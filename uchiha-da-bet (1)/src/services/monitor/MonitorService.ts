import { DataStore } from '../../database/store';
import { ProviderManager } from '../providers/ProviderManager';
import { RuleEngine } from '../rule-engine/RuleEngine';
import { BankrollService } from '../bankroll/BankrollService';
import { MatchSimulator } from './MatchSimulator';
import { NormalizedMatch, Operation, Signal } from '../../types';

export class MonitorService {
  private static instance: MonitorService;
  private store: DataStore;
  private providerManager: ProviderManager;
  private ruleEngine: RuleEngine;
  private bankrollService: BankrollService;
  private simulator: MatchSimulator;
  private timer: NodeJS.Timeout | null = null;
  private isScanning: boolean = false;

  private constructor() {
    this.store = DataStore.getInstance();
    this.providerManager = new ProviderManager();
    const settings = this.store.getUserSettings();
    this.ruleEngine = new RuleEngine(settings.odds_thresholds);
    this.bankrollService = new BankrollService();
    this.simulator = new MatchSimulator();
  }

  public static getInstance(): MonitorService {
    if (!MonitorService.instance) {
      MonitorService.instance = new MonitorService();
    }
    return MonitorService.instance;
  }

  public getProviderManager(): ProviderManager {
    return this.providerManager;
  }

  public getRuleEngine(): RuleEngine {
    return this.ruleEngine;
  }

  public getBankrollService(): BankrollService {
    return this.bankrollService;
  }

  public getSimulator(): MatchSimulator {
    return this.simulator;
  }

  /**
   * Checks if current time is within configured active monitoring hours (e.g. 07:00 - 00:00)
   */
  public isWithinMonitoringHours(): boolean {
    const settings = this.store.getUserSettings();
    if (!settings.schedule.is_active) return false;

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    const [startH, startM] = settings.schedule.start_time.split(':').map(Number);
    const [endH, endM] = settings.schedule.end_time.split(':').map(Number);

    const startTotal = startH * 60 + startM; // e.g. 07:00 -> 420
    const endTotal = endH === 0 && endM === 0 ? 1440 : endH * 60 + endM; // 00:00 -> 1440

    if (startTotal <= endTotal) {
      return currentTotalMinutes >= startTotal && currentTotalMinutes < endTotal;
    } else {
      // Span midnight
      return currentTotalMinutes >= startTotal || currentTotalMinutes < endTotal;
    }
  }

  /**
   * Starts the background monitoring loop (continuous automated monitor)
   */
  public startBackgroundMonitor(intervalMs: number = 300000) {
    if (this.timer) clearInterval(this.timer);
    // In our server environment, we run scan every 30s in demo mode or 5 mins in production
    const isDemo = this.store.getStatus().mode === 'DEMO';
    const activeInterval = isDemo ? 30000 : intervalMs;

    this.timer = setInterval(() => {
      this.executeScanCycle();
    }, activeInterval);

    // Run first scan immediately
    this.executeScanCycle();
  }

  public stopBackgroundMonitor() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.store.updateStatus({ monitoring_active: false });
  }

  /**
   * Main scan cycle: collects matches, normalizes, audits rules, triggers signals and settles operations
   */
  public async executeScanCycle(): Promise<{
    signalsCreated: Signal[];
    settledOperations: Operation[];
    matchesCount: number;
    sourceUsed: string;
  }> {
    if (this.isScanning) {
      return { signalsCreated: [], settledOperations: [], matchesCount: 0, sourceUsed: 'busy' };
    }

    this.isScanning = true;
    const now = new Date();
    const isWithinHours = this.isWithinMonitoringHours();

    const userSettings = this.store.getUserSettings();
    this.ruleEngine.updateThresholds(userSettings.odds_thresholds);

    let signalsCreated: Signal[] = [];
    let settledOperations: Operation[] = [];
    let matchesCount = 0;
    let sourceUsed = 'scorebing';

    try {
      if (!isWithinHours) {
        console.log(`[MonitorService] Fora do horário de monitoramento (${userSettings.schedule.start_time} até ${userSettings.schedule.end_time}). Monitoramento em espera.`);
        this.store.updateStatus({
          monitoring_active: false,
          current_time: now.toLocaleTimeString('pt-BR'),
        });
        return { signalsCreated, settledOperations, matchesCount: 0, sourceUsed: 'hours_suspended' };
      }

      // Collect matches via ProviderManager with priority fallback
      const collection = await this.providerManager.collectMatches();
      sourceUsed = collection.sourceUsed;

      // In demo mode or if provider has matches:
      let currentMatches = collection.matches;
      if (currentMatches.length === 0) {
        currentMatches = this.store.getMatches();
      } else {
        this.store.setMatches(currentMatches);
      }
      matchesCount = currentMatches.length;

      // Evaluate each match
      const activeOps = this.store.getActiveOperations();
      const settledOps = this.store.getOperations().filter((o) => o.status === 'SETTLED');

      for (const match of currentMatches) {
        // Save snapshot for historical reconstruction and future backtesting (Requirement 44)
        this.store.addSnapshot({
          snapshot_id: `snap_${Date.now()}_${match.match_id}`,
          match_id: match.match_id,
          timestamp: new Date().toISOString(),
          minute: match.minute,
          score: `${match.score_home}-${match.score_away}`,
          attacks: { home: match.attacks_home, away: match.attacks_away },
          dangerous_attacks: { home: match.dangerous_attacks_home, away: match.dangerous_attacks_away },
          odds: { ht: match.first_half_odds, ml: match.moneyline_odds },
          source: match.data_source,
        });

        // 1. Settle any existing active operations on this match
        const settled = this.bankrollService.evaluateMatchSettlements(match);
        if (settled.length > 0) {
          settledOperations.push(...settled);
        }

        // Check if there is already an active operation for this match
        const hasActiveOp = activeOps.some((op) => op.match_id === match.match_id);

        // 2. Evaluate HT Strategy
        if (!hasActiveOp && match.status === 'FIRST_HALF') {
          const htEval = this.ruleEngine.evaluateHT(match);
          if (htEval.eligible) {
            const signal = this.ruleEngine.createSignalFromEvaluation(
              'HT',
              htEval,
              match,
              userSettings.bankroll.current,
              userSettings.stakes,
              userSettings.currency
            );
            this.store.addSignal(signal);
            signalsCreated.push(signal);
          }
        }

        // 3. Evaluate COBERTURA Strategy
        // Only if user had a prior HT operation on this match and 1st half ended in draw
        if (!hasActiveOp && (match.status === 'HALF_TIME' || match.status === 'SECOND_HALF')) {
          const priorHTOp = [...activeOps, ...settledOps].find(
            (o) => o.match_id === match.match_id && o.strategy === 'HT'
          ) || null;

          if (priorHTOp) {
            const cobEval = this.ruleEngine.evaluateCobertura(match, priorHTOp);
            if (cobEval.eligible) {
              const signal = this.ruleEngine.createSignalFromEvaluation(
                'COBERTURA',
                cobEval,
                match,
                userSettings.bankroll.current,
                userSettings.stakes,
                userSettings.currency,
                priorHTOp.operation_id
              );
              this.store.addSignal(signal);
              signalsCreated.push(signal);
            }
          }
        }

        // 4. Evaluate MONEYLINE Strategy (Independent of HT, second half up to 70')
        if (!hasActiveOp && match.status === 'SECOND_HALF') {
          const mlEval = this.ruleEngine.evaluateMoneyline(match);
          if (mlEval.eligible) {
            const signal = this.ruleEngine.createSignalFromEvaluation(
              'MONEYLINE',
              mlEval,
              match,
              userSettings.bankroll.current,
              userSettings.stakes,
              userSettings.currency
            );
            this.store.addSignal(signal);
            signalsCreated.push(signal);
          }
        }
      }

      // Update System Bot status
      const nextScanTime = new Date(Date.now() + userSettings.schedule.interval_minutes * 60000);
      this.store.updateStatus({
        online: true,
        monitoring_active: true,
        current_time: now.toLocaleTimeString('pt-BR'),
        last_scan: now.toLocaleTimeString('pt-BR'),
        next_scan: nextScanTime.toLocaleTimeString('pt-BR'),
        primary_provider: this.providerManager.getPrimaryProviderId(),
        active_provider: this.providerManager.getActiveProviderId(),
        fallback_active: collection.isFallback,
        fallback_reason: collection.reason,
        matches_analyzed_today: this.store.getStatus().matches_analyzed_today + matchesCount,
      });
    } catch (err: any) {
      console.error('[MonitorService] Error during scan cycle:', err);
    } finally {
      this.isScanning = false;
    }

    return { signalsCreated, settledOperations, matchesCount, sourceUsed };
  }
}
