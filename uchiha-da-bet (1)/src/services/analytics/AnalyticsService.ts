import { DataStore } from '../../database/store';
import { AnalyticsSummary, Operation, StrategyMetrics } from '../../types';

export class AnalyticsService {
  private store: DataStore;

  constructor() {
    this.store = DataStore.getInstance();
  }

  public getSummary(timeFilterDays?: number): AnalyticsSummary {
    const userSettings = this.store.getUserSettings();
    let operations = this.store.getOperations();

    if (timeFilterDays && timeFilterDays > 0) {
      const cutoff = Date.now() - timeFilterDays * 86400000;
      operations = operations.filter((op) => new Date(op.entry_timestamp).getTime() >= cutoff);
    }

    const initialBankroll = userSettings.bankroll.initial;
    const currentBankroll = userSettings.bankroll.current;
    const growthAmount = currentBankroll - initialBankroll;
    const growthPercent = Number(((growthAmount / initialBankroll) * 100).toFixed(2));

    const settled = operations.filter((op) => op.status === 'SETTLED');
    const greens = settled.filter((op) => op.result === 'GREEN');
    const reds = settled.filter((op) => op.result === 'RED');

    const totalStaked = settled.reduce((acc, op) => acc + op.stake, 0);
    const totalProfit = greens.reduce((acc, op) => acc + Math.max(0, op.profit_loss), 0);
    const totalLoss = reds.reduce((acc, op) => acc + Math.abs(op.profit_loss), 0);
    const netProfitLoss = totalProfit - totalLoss;

    const roiPercent = totalStaked > 0 ? Number(((netProfitLoss / totalStaked) * 100).toFixed(2)) : 0;
    const winRatePercent = settled.length > 0 ? Number(((greens.length / settled.length) * 100).toFixed(2)) : 0;
    const avgStake = settled.length > 0 ? Math.round(totalStaked / settled.length) : 0;

    // Streaks calculation (chronological order)
    const sortedSettled = [...settled].sort(
      (a, b) => new Date(a.entry_timestamp).getTime() - new Date(b.entry_timestamp).getTime()
    );

    let maxGreenStreak = 0;
    let maxRedStreak = 0;
    let curGreen = 0;
    let curRed = 0;

    for (const op of sortedSettled) {
      if (op.result === 'GREEN') {
        curGreen++;
        curRed = 0;
        if (curGreen > maxGreenStreak) maxGreenStreak = curGreen;
      } else if (op.result === 'RED') {
        curRed++;
        curGreen = 0;
        if (curRed > maxRedStreak) maxRedStreak = curRed;
      }
    }

    const lastOp = sortedSettled[sortedSettled.length - 1];
    let currentStreak: { type: 'GREEN' | 'RED' | 'NONE'; count: number } = { type: 'NONE', count: 0 };
    if (lastOp) {
      if (lastOp.result === 'GREEN') currentStreak = { type: 'GREEN', count: curGreen };
      else if (lastOp.result === 'RED') currentStreak = { type: 'RED', count: curRed };
    }

    // Max Drawdown calculation
    let peak = initialBankroll;
    let maxDrawdown = 0;
    let runningBalance = initialBankroll;
    for (const op of sortedSettled) {
      runningBalance += op.profit_loss;
      if (runningBalance > peak) {
        peak = runningBalance;
      }
      const dd = ((peak - runningBalance) / peak) * 100;
      if (dd > maxDrawdown) {
        maxDrawdown = dd;
      }
    }

    return {
      bankroll_initial: initialBankroll,
      bankroll_current: currentBankroll,
      growth_amount: growthAmount,
      growth_percent: growthPercent,
      total_staked: totalStaked,
      total_profit: totalProfit,
      total_loss: totalLoss,
      net_profit_loss: netProfitLoss,
      roi_percent: roiPercent,
      win_rate_percent: winRatePercent,
      greens_count: greens.length,
      reds_count: reds.length,
      total_operations: operations.length,
      average_stake: avgStake,
      max_green_streak: maxGreenStreak,
      max_red_streak: maxRedStreak,
      current_streak: currentStreak,
      max_drawdown_percent: Number(maxDrawdown.toFixed(2)),
      by_strategy: {
        HT: this.computeStrategyMetrics(settled.filter((o) => o.strategy === 'HT')),
        COBERTURA: this.computeStrategyMetrics(settled.filter((o) => o.strategy === 'COBERTURA')),
        MONEYLINE: this.computeStrategyMetrics(settled.filter((o) => o.strategy === 'MONEYLINE')),
      },
    };
  }

  private computeStrategyMetrics(ops: Operation[]): StrategyMetrics {
    const greens = ops.filter((o) => o.result === 'GREEN');
    const reds = ops.filter((o) => o.result === 'RED');
    const totalStaked = ops.reduce((acc, o) => acc + o.stake, 0);
    const netProfit = ops.reduce((acc, o) => acc + o.profit_loss, 0);
    const roi = totalStaked > 0 ? Number(((netProfit / totalStaked) * 100).toFixed(2)) : 0;
    const winRate = ops.length > 0 ? Number(((greens.length / ops.length) * 100).toFixed(2)) : 0;
    const avgOdd = ops.length > 0 ? Number((ops.reduce((acc, o) => acc + o.entry_odd, 0) / ops.length).toFixed(2)) : 0;
    const avgStake = ops.length > 0 ? Math.round(totalStaked / ops.length) : 0;

    return {
      operations_count: ops.length,
      greens: greens.length,
      reds: reds.length,
      win_rate_percent: winRate,
      total_staked: totalStaked,
      net_profit_loss: netProfit,
      roi_percent: roi,
      average_odd: avgOdd,
      average_stake: avgStake,
    };
  }
}
