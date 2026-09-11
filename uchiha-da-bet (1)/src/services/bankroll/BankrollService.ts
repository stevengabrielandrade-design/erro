import { DataStore } from '../../database/store';
import { NormalizedMatch, Operation, Signal, StrategyType } from '../../types';

export class BankrollService {
  private store: DataStore;

  constructor() {
    this.store = DataStore.getInstance();
  }

  /**
   * Places a user bet on a detected signal.
   * Freezes entry_odd, stake, entry_minute and creates active Operation.
   */
  public placeBet(signalId: string, customStake?: number): { success: boolean; operation?: Operation; error?: string } {
    const signals = this.store.getSignals();
    const signal = signals.find((s) => s.signal_id === signalId);
    if (!signal) {
      return { success: false, error: 'Sinal não encontrado.' };
    }
    if (signal.status !== 'PENDING') {
      return { success: false, error: `Sinal já processado com status: ${signal.status}.` };
    }

    const userSettings = this.store.getUserSettings();
    const currentBankroll = userSettings.bankroll.current;
    const stakeAmount = customStake || signal.suggested_stake_amount;

    if (stakeAmount > currentBankroll) {
      return { success: false, error: `Stake solicitada (${stakeAmount} ${userSettings.currency}) excede a banca disponível (${currentBankroll} ${userSettings.currency}).` };
    }

    const matches = this.store.getMatches();
    const match = matches.find((m) => m.match_id === signal.match_id);
    const scoreNow = match ? `${match.score_home}-${match.score_away}` : '0-0';

    const operation: Operation = {
      operation_id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userSettings.user_id,
      signal_id: signal.signal_id,
      match_id: signal.match_id,
      strategy: signal.strategy,
      match_name: signal.match_name,
      competition: signal.competition,
      favorite_team: signal.favorite_team,
      market: this.getMarketLabel(signal.strategy),
      stake: stakeAmount,
      entry_odd: signal.odd, // LOCKED
      entry_minute: signal.minute,
      entry_timestamp: new Date().toISOString(),
      status: 'ACTIVE',
      result: 'PENDING',
      profit_loss: 0,
      bankroll_before: currentBankroll,
      bankroll_after: currentBankroll,
      parent_operation_id: signal.parent_operation_id,
      score_at_entry: scoreNow,
    };

    this.store.addOperation(operation);
    this.store.updateSignalStatus(signal.signal_id, 'BET_PLACED');

    return { success: true, operation };
  }

  /**
   * User ignores an alert.
   * Stored in Ignored list for future hypothetical review without modifying actual bankroll.
   */
  public ignoreSignal(signalId: string): { success: boolean; error?: string } {
    const signals = this.store.getSignals();
    const signal = signals.find((s) => s.signal_id === signalId);
    if (!signal) {
      return { success: false, error: 'Sinal não encontrado.' };
    }

    this.store.updateSignalStatus(signalId, 'IGNORED');
    this.store.addIgnoredSignal({
      record_id: `ign_${Date.now()}`,
      signal_id: signal.signal_id,
      match_id: signal.match_id,
      match_name: signal.match_name,
      strategy: signal.strategy,
      odd: signal.odd,
      minute: signal.minute,
      timestamp: new Date().toISOString(),
      hypothetical_result: 'PENDING',
    });

    return { success: true };
  }

  /**
   * Settles an operation as GREEN or RED, updating the bankroll.
   */
  public settleOperation(
    operationId: string,
    result: 'GREEN' | 'RED',
    scoreAtExit: string
  ): Operation | null {
    const operations = this.store.getOperations();
    const op = operations.find((o) => o.operation_id === operationId);
    if (!op || op.status === 'SETTLED') return null;

    const userSettings = this.store.getUserSettings();
    let profitLoss = 0;

    if (result === 'GREEN') {
      // lucro = stake * (odd - 1)
      profitLoss = Math.round(op.stake * (op.entry_odd - 1));
    } else {
      // prejuizo = stake
      profitLoss = -op.stake;
    }

    const newBankroll = userSettings.bankroll.current + profitLoss;
    this.store.updateUserSettings({
      bankroll: {
        ...userSettings.bankroll,
        current: newBankroll,
        updated_at: new Date().toISOString(),
      },
    });

    // Check sequence combined PnL if Cobertura with parent operation
    let combinedPnL: number | undefined;
    if (op.strategy === 'COBERTURA' && op.parent_operation_id) {
      const parentOp = operations.find((o) => o.operation_id === op.parent_operation_id);
      if (parentOp) {
        combinedPnL = (parentOp.profit_loss || 0) + profitLoss;
      }
    }

    let updatedOp: Operation | null = null;
    this.store.updateOperation(operationId, (current) => {
      updatedOp = {
        ...current,
        status: 'SETTLED',
        result,
        profit_loss: profitLoss,
        bankroll_after: newBankroll,
        score_at_exit: scoreAtExit,
        exit_timestamp: new Date().toISOString(),
        combined_profit_loss: combinedPnL,
      };
      return updatedOp;
    });

    return updatedOp;
  }

  /**
   * Evaluates active operations against updated match state (e.g. half-time or full-time)
   */
  public evaluateMatchSettlements(match: NormalizedMatch): Operation[] {
    const activeOps = this.store.getActiveOperations().filter((o) => o.match_id === match.match_id);
    const settled: Operation[] = [];

    for (const op of activeOps) {
      const isFavHome = match.favorite_team === 'HOME';
      const favScore = isFavHome ? match.score_home : match.score_away;
      const underScore = isFavHome ? match.score_away : match.score_home;
      const scoreStr = `${match.score_home}-${match.score_away}`;

      if (op.strategy === 'HT') {
        // Settled when match reaches half-time or past 45'
        if (match.status === 'HALF_TIME' || match.minute >= 45) {
          const result = favScore > underScore ? 'GREEN' : 'RED';
          const s = this.settleOperation(op.operation_id, result, scoreStr);
          if (s) settled.push(s);
        }
      } else if (op.strategy === 'COBERTURA' || op.strategy === 'MONEYLINE') {
        // Settled when match finishes (>= 90')
        if (match.status === 'FINISHED' || match.minute >= 90) {
          const result = favScore > underScore ? 'GREEN' : 'RED';
          const s = this.settleOperation(op.operation_id, result, scoreStr);
          if (s) settled.push(s);
        }
      }
    }

    return settled;
  }

  private getMarketLabel(strategy: StrategyType): string {
    switch (strategy) {
      case 'HT':
        return 'Vencedor 1º Tempo (HT)';
      case 'COBERTURA':
        return 'Cobertura (Vencedor Partida)';
      case 'MONEYLINE':
        return 'Vencedor Partida (ML)';
    }
  }
}
