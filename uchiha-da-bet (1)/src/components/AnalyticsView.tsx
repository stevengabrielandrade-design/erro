import React, { useState } from 'react';
import {
  AnalyticsSummary,
  IgnoredSignalRecord,
  Operation,
  StrategyType,
  UserSettings,
} from '../types';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  EyeOff,
  Filter,
} from 'lucide-react';

interface AnalyticsViewProps {
  analytics: AnalyticsSummary | null;
  operations: Operation[];
  ignoredSignals: IgnoredSignalRecord[];
  settings: UserSettings | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  operations,
  ignoredSignals,
  settings,
}) => {
  const currency = settings?.currency || 'Kz';
  const [historyTab, setHistoryTab] = useState<'OPERATIONS' | 'IGNORED'>('OPERATIONS');
  const [filterStrategy, setFilterStrategy] = useState<'ALL' | StrategyType>('ALL');
  const [filterResult, setFilterResult] = useState<'ALL' | 'GREEN' | 'RED' | 'PENDING'>('ALL');
  const [timeFilter, setTimeFilter] = useState<'ALL' | '7D' | '30D'>('ALL');

  if (!analytics) return null;

  const filteredOps = operations.filter((op) => {
    if (filterStrategy !== 'ALL' && op.strategy !== filterStrategy) return false;
    if (filterResult !== 'ALL' && op.result !== filterResult) return false;
    if (timeFilter === '7D') {
      return Date.now() - new Date(op.entry_timestamp).getTime() <= 7 * 86400000;
    }
    if (timeFilter === '30D') {
      return Date.now() - new Date(op.entry_timestamp).getTime() <= 30 * 86400000;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-4">
          <span className="text-[10px] uppercase font-semibold text-zinc-400">Banca Inicial</span>
          <div className="text-lg sm:text-xl font-bold font-mono text-zinc-300 mt-1">
            {analytics.bankroll_initial.toLocaleString('pt-PT')} {currency}
          </div>
        </div>

        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-4">
          <span className="text-[10px] uppercase font-semibold text-zinc-400">Banca Atual</span>
          <div className="text-lg sm:text-xl font-extrabold font-mono text-orange-400 mt-1">
            {analytics.bankroll_current.toLocaleString('pt-PT')} {currency}
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" /> +{analytics.growth_percent}%
          </span>
        </div>

        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-4">
          <span className="text-[10px] uppercase font-semibold text-zinc-400">Lucro Líquido</span>
          <div
            className={`text-lg sm:text-xl font-extrabold font-mono mt-1 ${
              analytics.net_profit_loss >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {analytics.net_profit_loss >= 0 ? '+' : ''}
            {analytics.net_profit_loss.toLocaleString('pt-PT')} {currency}
          </div>
          <span className="text-[11px] text-zinc-500 block mt-0.5">
            Total Apostado: {analytics.total_staked.toLocaleString('pt-PT')} {currency}
          </span>
        </div>

        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-4">
          <span className="text-[10px] uppercase font-semibold text-zinc-400">ROI Global</span>
          <div className="text-lg sm:text-xl font-extrabold font-mono text-emerald-400 mt-1">
            +{analytics.roi_percent}%
          </div>
          <span className="text-[11px] text-zinc-400 mt-0.5 block">
            Taxa de Acerto: <strong className="text-white">{analytics.win_rate_percent}%</strong>
          </span>
        </div>
      </div>

      {/* Advanced Stats Bento */}
      <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-4 sm:p-5">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono mb-4">
          Indicadores de Performance & Gestão de Risco
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <span className="text-zinc-400 text-[10px] block">Greens / Reds</span>
            <div className="text-sm font-bold mt-1">
              <span className="text-emerald-400 font-mono font-black">{analytics.greens_count} 🟢</span>
              <span className="mx-2 text-zinc-600">/</span>
              <span className="text-red-400 font-mono font-black">{analytics.reds_count} 🔴</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <span className="text-zinc-400 text-[10px] block">Stake Média</span>
            <div className="text-sm font-bold text-white font-mono mt-1">
              {analytics.average_stake.toLocaleString('pt-PT')} {currency}
            </div>
          </div>

          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <span className="text-zinc-400 text-[10px] block">Sequência Recorde</span>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-1">
              {analytics.max_green_streak} Greens seguidos
            </div>
            <span className="text-[10px] text-zinc-500 block mt-0.5">
              (Maior Red: {analytics.max_red_streak})
            </span>
          </div>

          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <span className="text-zinc-400 text-[10px] block">Drawdown Máximo</span>
            <div className="text-sm font-bold text-amber-400 font-mono mt-1">
              {analytics.max_drawdown_percent}%
            </div>
            <span className="text-[10px] text-zinc-500 block mt-0.5">Controlado pelo modelo</span>
          </div>
        </div>
      </div>

      {/* Breakdown per Strategy (Requirement 28) */}
      <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-4 sm:p-5">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono mb-4">
          Performance Por Estratégia (HT, Cobertura, ML)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {(['HT', 'COBERTURA', 'MONEYLINE'] as const).map((strat) => {
            const metrics = analytics.by_strategy[strat];
            const isHT = strat === 'HT';
            const isCob = strat === 'COBERTURA';

            return (
              <div
                key={strat}
                className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-black font-mono ${
                      isHT
                        ? 'bg-orange-950 text-orange-400 border border-orange-800/60'
                        : isCob
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        : 'bg-red-950 text-red-400 border border-red-800/60'
                    }`}
                  >
                    ESTRATÉGIA {strat}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {metrics.operations_count} ops
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Acerto</span>
                    <strong className="text-white font-mono text-sm">{metrics.win_rate_percent}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">ROI</span>
                    <strong className="text-emerald-400 font-mono text-sm">+{metrics.roi_percent}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Odd Média</span>
                    <strong className="text-zinc-300 font-mono text-sm">@{metrics.average_odd.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Lucro Líquido</span>
                    <strong className="text-emerald-400 font-mono text-sm">
                      +{metrics.net_profit_loss.toLocaleString('pt-PT')} {currency}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Greens / Reds:</span>
                  <span className="font-mono font-bold">
                    <span className="text-emerald-400">{metrics.greens}G</span> / <span className="text-red-400">{metrics.reds}R</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operations History & Ignored Signals Analyzer */}
      <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHistoryTab('OPERATIONS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                historyTab === 'OPERATIONS'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              📋 Histórico de Operações ({operations.length})
            </button>
            <button
              onClick={() => setHistoryTab('IGNORED')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                historyTab === 'IGNORED'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              Sinais Ignorados ({ignoredSignals.length})
            </button>
          </div>

          {/* Quick Filters */}
          {historyTab === 'OPERATIONS' && (
            <div className="flex items-center gap-1.5 text-xs">
              <select
                value={filterStrategy}
                onChange={(e) => setFilterStrategy(e.target.value as any)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-300 font-semibold focus:outline-none"
              >
                <option value="ALL">Todas Estratégias</option>
                <option value="HT">Apenas HT</option>
                <option value="COBERTURA">Apenas Cobertura</option>
                <option value="MONEYLINE">Apenas ML</option>
              </select>

              <select
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value as any)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-300 font-semibold focus:outline-none"
              >
                <option value="ALL">Todos Resultados</option>
                <option value="GREEN">Apenas GREEN</option>
                <option value="RED">Apenas RED</option>
                <option value="PENDING">Em Andamento</option>
              </select>
            </div>
          )}
        </div>

        {historyTab === 'OPERATIONS' ? (
          <div className="space-y-2.5">
            {filteredOps.map((op) => {
              const isGreen = op.result === 'GREEN';
              const isRed = op.result === 'RED';
              const isPending = op.status === 'ACTIVE';

              return (
                <div
                  key={op.operation_id}
                  className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase ${
                        op.strategy === 'HT'
                          ? 'bg-orange-950 text-orange-400 border border-orange-800/50'
                          : op.strategy === 'COBERTURA'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                          : 'bg-red-950 text-red-400 border border-red-800/50'
                      }`}
                    >
                      {op.strategy}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{op.match_name}</h4>
                      <div className="text-[11px] text-zinc-400">
                        {op.market} • Entrada: <strong className="text-zinc-200">@{op.entry_odd.toFixed(2)}</strong> ({op.entry_minute}') • Stake: <strong className="text-zinc-200">{op.stake.toLocaleString('pt-PT')} {currency}</strong>
                      </div>
                      {op.parent_operation_id && op.combined_profit_loss !== undefined && (
                        <div className="text-[10px] text-amber-400 mt-0.5">
                          Sequência (HT + Cobertura): Líquido: {op.combined_profit_loss >= 0 ? '+' : ''}{op.combined_profit_loss.toLocaleString('pt-PT')} {currency}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {isPending ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800/50 animate-pulse">
                          EM ANDAMENTO
                        </span>
                      ) : (
                        <div>
                          <div
                            className={`text-sm font-black font-mono ${
                              isGreen ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {isGreen ? '+' : ''}
                            {op.profit_loss.toLocaleString('pt-PT')} {currency}
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              isGreen ? 'text-emerald-500' : 'text-red-500'
                            }`}
                          >
                            {isGreen ? 'GREEN 🟢' : 'RED 🔴'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Ignored Signals Analysis (Requirement 30) */
          <div className="space-y-3">
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs text-zinc-400 leading-relaxed">
              <strong className="text-orange-400 font-semibold">Análise Hipotética Post-Mortem: </strong>
              Permite verificar o que teria acontecido caso você tivesse aceitado os alertas que decidiu ignorar. Estes registros NÃO afetam sua banca real.
            </div>

            {ignoredSignals.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-xs">
                Nenhum sinal ignorado registrado até o momento.
              </div>
            ) : (
              ignoredSignals.map((ign) => (
                <div
                  key={ign.record_id}
                  className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-zinc-400 border border-zinc-800 mr-2">
                      {ign.strategy}
                    </span>
                    <strong className="text-white">{ign.match_name}</strong>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      Odd @{ign.odd.toFixed(2)} aos {ign.minute}'
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-700">
                      IGNORADO
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono block mt-0.5">
                      Teria dado GREEN (+{Math.round(2500 * (ign.odd - 1))} {currency})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
