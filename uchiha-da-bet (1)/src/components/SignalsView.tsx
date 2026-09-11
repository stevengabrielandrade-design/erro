import React, { useState } from 'react';
import { NormalizedMatch, Signal, StrategyType, UserSettings } from '../types';
import { Flame, Clock, Radio, Search, Filter, ShieldAlert, CheckCircle, EyeOff, Target } from 'lucide-react';

interface SignalsViewProps {
  signals: Signal[];
  matches: NormalizedMatch[];
  settings: UserSettings | null;
  onSelectSignal: (signal: Signal) => void;
  onPlaceBet: (signalId: string, stake?: number) => void;
  onIgnore: (signalId: string) => void;
}

export const SignalsView: React.FC<SignalsViewProps> = ({
  signals,
  matches,
  settings,
  onSelectSignal,
  onPlaceBet,
  onIgnore,
}) => {
  const currency = settings?.currency || 'Kz';
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'BET_PLACED' | 'IGNORED'>('ALL');
  const [strategyFilter, setStrategyFilter] = useState<'ALL' | StrategyType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [tabMode, setTabMode] = useState<'SIGNALS' | 'LIVE_MATCHES'>('SIGNALS');

  const filteredSignals = signals.filter((sig) => {
    if (activeFilter !== 'ALL' && sig.status !== activeFilter) return false;
    if (strategyFilter !== 'ALL' && sig.strategy !== strategyFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        sig.match_name.toLowerCase().includes(q) ||
        sig.competition.toLowerCase().includes(q) ||
        sig.favorite_team.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* View Switcher: Sinais Detectados vs Jogos ao Vivo Sendo Monitorados */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTabMode('SIGNALS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tabMode === 'SIGNALS'
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            🔥 Sinais ({signals.length})
          </button>
          <button
            onClick={() => setTabMode('LIVE_MATCHES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              tabMode === 'LIVE_MATCHES'
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Jogos Ao Vivo Monitorados ({matches.length})
          </button>
        </div>
      </div>

      {tabMode === 'SIGNALS' ? (
        <>
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121216] border border-zinc-800 rounded-xl p-3">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {(['ALL', 'PENDING', 'BET_PLACED', 'IGNORED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeFilter === status
                      ? 'bg-orange-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {status === 'ALL' && 'Todos'}
                  {status === 'PENDING' && 'Pendentes'}
                  {status === 'BET_PLACED' && 'Apostados'}
                  {status === 'IGNORED' && 'Ignorados'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              {(['ALL', 'HT', 'COBERTURA', 'MONEYLINE'] as const).map((strat) => (
                <button
                  key={strat}
                  onClick={() => setStrategyFilter(strat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors ${
                    strategyFilter === strat
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-zinc-900/60 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {strat}
                </button>
              ))}
            </div>
          </div>

          {/* Signals List */}
          {filteredSignals.length === 0 ? (
            <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
              <Flame className="w-8 h-8 mx-auto mb-2 text-zinc-600 opacity-50" />
              <p className="text-sm font-medium">Nenhum sinal encontrado para este filtro.</p>
              <p className="text-xs text-zinc-600 mt-1">
                O monitor verifica jogos ao vivo a cada 5 minutos procurando padrões HT, Cobertura e ML.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredSignals.map((sig) => {
                const isPending = sig.status === 'PENDING';
                const isBet = sig.status === 'BET_PLACED';
                const isIgnored = sig.status === 'IGNORED';

                return (
                  <div
                    key={sig.signal_id}
                    className={`bg-[#121216] border rounded-2xl p-4 sm:p-5 transition-all shadow-md ${
                      isPending
                        ? 'border-orange-900/50 hover:border-orange-600/70 shadow-orange-950/20'
                        : isBet
                        ? 'border-emerald-900/50 bg-emerald-950/10'
                        : 'border-zinc-800/80 opacity-75'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase font-mono tracking-wider ${
                            sig.strategy === 'HT'
                              ? 'bg-orange-950 text-orange-400 border border-orange-800/60'
                              : sig.strategy === 'COBERTURA'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                              : 'bg-red-950 text-red-400 border border-red-800/60'
                          }`}
                        >
                          SINAL {sig.strategy}
                        </span>
                        <span className="text-xs font-semibold text-zinc-400">
                          {sig.competition}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-orange-400" />
                          {sig.minute}' Minuto
                        </span>

                        {isPending && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-950/80 text-orange-300 border border-orange-700/50 animate-pulse">
                            AGUARDANDO DECISÃO
                          </span>
                        )}
                        {isBet && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> APOSTADO
                          </span>
                        )}
                        {isIgnored && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 text-zinc-400 border border-zinc-700/50 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" /> IGNORADO
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="py-3 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-black text-white tracking-tight">
                          {sig.match_name}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
                          {sig.reason}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 bg-zinc-950/80 border border-zinc-800/90 rounded-xl px-4 py-2.5">
                        <div className="text-center">
                          <span className="text-[10px] text-zinc-400 uppercase block font-semibold">Odd Entrada</span>
                          <span className="text-base font-black text-emerald-400 font-mono">
                            @{sig.odd.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-px h-8 bg-zinc-800" />
                        <div className="text-center">
                          <span className="text-[10px] text-zinc-400 uppercase block font-semibold">Stake Sugerida</span>
                          <span className="text-base font-black text-orange-400 font-mono">
                            {sig.suggested_stake_amount.toLocaleString('pt-PT')} {currency}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions if Pending */}
                    {isPending && (
                      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => onIgnore(sig.signal_id)}
                          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold transition-all active:scale-95"
                        >
                          [IGNORAR ALERTA]
                        </button>
                        <button
                          onClick={() => onSelectSignal(sig)}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-extrabold shadow-lg shadow-orange-950/40 transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <Target className="w-4 h-4" />
                          [APOSTAR AGORA]
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Live Matches Being Monitored */
        <div className="space-y-3">
          <div className="text-xs text-zinc-400 flex items-center justify-between">
            <span>O sistema analisa ataques perigosos e odds em tempo real:</span>
            <span className="text-orange-400 font-mono font-bold">Total: {matches.length} partidas</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {matches.map((m) => {
              const favAttacks = m.favorite_team === 'HOME' ? m.dangerous_attacks_home : m.dangerous_attacks_away;
              const rate = (favAttacks / Math.max(1, m.minute)).toFixed(2);

              return (
                <div
                  key={m.match_id}
                  className="bg-[#121216] border border-zinc-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-400">{m.competition} ({m.country})</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 font-mono font-bold text-orange-400">
                      {m.minute}' • {m.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div className="space-y-1">
                      <div className={`text-sm font-bold ${m.favorite_team === 'HOME' ? 'text-orange-400' : 'text-white'}`}>
                        {m.home_team} {m.favorite_team === 'HOME' && '⭐'}
                      </div>
                      <div className={`text-sm font-bold ${m.favorite_team === 'AWAY' ? 'text-orange-400' : 'text-white'}`}>
                        {m.away_team} {m.favorite_team === 'AWAY' && '⭐'}
                      </div>
                    </div>

                    <div className="text-right font-mono text-lg font-black text-white bg-zinc-950 px-3 py-1 rounded-xl border border-zinc-800">
                      {m.score_home} - {m.score_away}
                    </div>
                  </div>

                  {/* Pressure Meters */}
                  <div className="bg-zinc-950/80 rounded-xl p-2.5 border border-zinc-800/80 text-[11px] grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-zinc-500 block">Atq. Perigosos</span>
                      <strong className="text-orange-400 font-mono font-bold">
                        {m.dangerous_attacks_home} x {m.dangerous_attacks_away}
                      </strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Pressão Fav.</span>
                      <strong className="text-white font-mono font-bold">{rate}/min</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Odd HT / ML</span>
                      <strong className="text-emerald-400 font-mono font-bold">
                        @{m.first_half_odds.toFixed(2)} / @{m.moneyline_odds.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
