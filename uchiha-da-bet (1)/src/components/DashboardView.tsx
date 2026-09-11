import React from 'react';
import {
  AnalyticsSummary,
  NormalizedMatch,
  Operation,
  Signal,
  SystemBotStatus,
  UserSettings,
} from '../types';
import {
  Activity,
  Flame,
  TrendingUp,
  ShieldAlert,
  Clock,
  Radio,
  CheckCircle,
  XCircle,
  Play,
  Zap,
  ArrowRight,
  Target,
  BellRing,
  Smartphone,
  Bell,
} from 'lucide-react';

interface DashboardViewProps {
  status: SystemBotStatus | null;
  settings: UserSettings | null;
  analytics: AnalyticsSummary | null;
  signals: Signal[];
  operations: Operation[];
  matches: NormalizedMatch[];
  onSelectSignal: (sig: Signal) => void;
  onNavigateTab: (tab: any) => void;
  onInjectDemo: (scenario: any) => void;
  onAdvanceStep: () => void;
  onOpenNotificationTest?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  status,
  settings,
  analytics,
  signals,
  operations,
  matches,
  onSelectSignal,
  onNavigateTab,
  onInjectDemo,
  onAdvanceStep,
  onOpenNotificationTest,
}) => {
  const currency = settings?.currency || 'Kz';
  const pendingSignals = signals.filter((s) => s.status === 'PENDING').slice(0, 3);
  const activeOps = operations.filter((o) => o.status === 'ACTIVE');
  const recentSettled = operations.filter((o) => o.status === 'SETTLED').slice(0, 3);

  const bankrollCurrent = settings?.bankroll?.current ?? 250000;
  const roi = analytics?.roi_percent ?? 0;
  const growthPercent = analytics?.growth_percent ?? 0;

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Bot Status Card */}
      <div className="bg-gradient-to-r from-[#181820] via-[#121216] to-[#181820] border border-zinc-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white tracking-wide font-mono">
                  BOT ONLINE
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40">
                  MONITORAMENTO ATIVO
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Varredura automática contínua em ligas de 1ª divisão, divisões inferiores e futebol feminino.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <span className="text-zinc-500 text-[10px] block uppercase">Última varredura</span>
              <span className="text-zinc-200 font-bold">{status?.last_scan || '07:15:03'}</span>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 text-[10px] block uppercase">Próxima varredura</span>
              <span className="text-orange-400 font-bold">{status?.next_scan || '07:20:00'}</span>
            </div>
          </div>
        </div>

        {/* Quick Diagnostics bar */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
          <div className="flex items-center gap-2">
            <span>Fonte Principal:</span>
            <strong className="text-zinc-200 uppercase font-mono">ScoreBing</strong>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-400 text-[11px]">ONLINE</span>
          </div>
          {status?.fallback_active && (
            <div className="text-amber-400 text-[11px] font-medium flex items-center gap-1">
              <Radio className="w-3.5 h-3.5" />
              Fallback ativado: {status.active_provider}
            </div>
          )}
          <div className="text-[11px] text-zinc-500">
            Horário configurado: <span className="text-zinc-300 font-mono">07:00 — 00:00</span>
          </div>
        </div>
      </div>

      {/* Mobile Push Notification Tester Banner */}
      {onOpenNotificationTest && (
        <div className="bg-gradient-to-r from-orange-950/40 via-[#181822] to-red-950/40 border border-orange-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/50 flex items-center justify-center text-orange-400 shrink-0">
              <Smartphone className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider font-mono">
                  Barra de Notificações do Celular
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-600 text-white animate-pulse">
                  TESTE AO VIVO
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Simule o recebimento de alertas push na barra do seu celular (com som, vibração e delay de 5s).
              </p>
            </div>
          </div>
          <button
            onClick={onOpenNotificationTest}
            className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2 shrink-0"
          >
            <BellRing className="w-4 h-4" />
            Simular Notificação no Celular
          </button>
        </div>
      )}

      {/* Bento Metric Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Banca */}
        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-4 relative overflow-hidden">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
            Banca Atual
          </span>
          <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
            {bankrollCurrent.toLocaleString('pt-PT')}
            <span className="text-xs text-zinc-400 font-normal ml-1">{currency}</span>
          </div>
          <div className="text-[11px] font-semibold text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +{growthPercent}% de crescimento
          </div>
        </div>

        {/* ROI */}
        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-4 relative overflow-hidden">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
            Retorno (ROI)
          </span>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {roi >= 0 ? `+${roi}%` : `${roi}%`}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Taxa de Acerto: <strong className="text-white font-mono">{analytics?.win_rate_percent ?? 0}%</strong>
          </div>
        </div>

        {/* Jogos Analisados */}
        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-4">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
            Jogos Analisados
          </span>
          <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
            {status?.matches_analyzed_today ?? 327}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Ciclo a cada 5 minutos
          </div>
        </div>

        {/* Sinais / Operações Hoje */}
        <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-4">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
            Sinais Hoje
          </span>
          <div className="text-xl sm:text-2xl font-black text-orange-400 font-mono mt-1">
            {status?.signals_generated_today ?? 8}
            <span className="text-xs text-zinc-500 font-normal ml-2">
              ({status?.operations_today ?? 5} apostadas)
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {pendingSignals.length} aguardando decisão
          </div>
        </div>
      </div>

      {/* Demo Controls Bar (For quick scenario simulation) */}
      <div className="bg-gradient-to-r from-orange-950/30 via-zinc-900 to-zinc-900 border border-orange-900/30 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-orange-500/20 text-orange-400">
            <Zap className="w-4 h-4" />
          </span>
          <div className="text-xs">
            <strong className="text-orange-400 uppercase font-mono">Modo Demonstração Interativo: </strong>
            <span className="text-zinc-300">Simule os cenários reais para testar o Rule Engine em tempo real</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => onInjectDemo('HT_VALID')}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-orange-600 hover:text-white text-zinc-200 border border-zinc-700 transition-colors font-semibold"
          >
            ⚡ Arsenal 15' (HT)
          </button>
          <button
            onClick={() => onInjectDemo('COBERTURA_VALID')}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-orange-600 hover:text-white text-zinc-200 border border-zinc-700 transition-colors font-semibold"
          >
            ⚡ Benfica 48' (Cobertura)
          </button>
          <button
            onClick={() => onInjectDemo('ML_VALID')}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-orange-600 hover:text-white text-zinc-200 border border-zinc-700 transition-colors font-semibold"
          >
            ⚡ Villarreal 64' (ML)
          </button>
          <button
            onClick={onAdvanceStep}
            title="Avança minutos e acumula ataques nos jogos"
            className="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/60 transition-colors font-bold flex items-center gap-1"
          >
            <Play className="w-3 h-3" />
            Avançar Minuto (+1')
          </button>
        </div>
      </div>

      {/* Active Operations Tracking */}
      {activeOps.length > 0 && (
        <div className="bg-[#121216] border border-orange-900/40 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                Operações Ativas em Andamento ({activeOps.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {activeOps.map((op) => {
              const liveMatch = matches.find((m) => m.match_id === op.match_id);
              const score = liveMatch ? `${liveMatch.score_home} - ${liveMatch.score_away}` : op.score_at_entry;
              const minute = liveMatch ? `${liveMatch.minute}'` : `${op.entry_minute}'`;

              return (
                <div
                  key={op.operation_id}
                  className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-orange-950/80 text-orange-400 border border-orange-800/40">
                      {op.strategy}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{op.match_name}</h4>
                      <div className="text-[11px] text-zinc-400">
                        Entrada: <strong className="text-zinc-200">@{op.entry_odd.toFixed(2)}</strong> ({op.entry_minute}') • Stake: <strong className="text-zinc-200">{op.stake.toLocaleString('pt-PT')} {currency}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white">{score}</div>
                      <div className="text-[10px] text-orange-400 font-semibold">{minute}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/60 border border-amber-800/40 text-amber-300 animate-pulse">
                      ACOMPANHANDO
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Latest Signals Feed */}
      <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
              Últimos Sinais Detectados ({signals.length})
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('signals')}
            className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
          >
            Ver feed completo <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingSignals.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">
            Nenhum sinal pendente no momento. O bot está varrendo jogos ao vivo a cada 5 minutos.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingSignals.map((sig) => (
              <div
                key={sig.signal_id}
                className="bg-zinc-950/70 hover:bg-zinc-950 border border-zinc-800/90 hover:border-orange-500/40 rounded-xl p-4 transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800/50">
                      SINAL {sig.strategy}
                    </span>
                    <span className="text-xs text-zinc-400">{sig.competition}</span>
                  </div>
                  <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-400" /> {sig.minute}'
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-extrabold text-white">{sig.match_name}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{sig.reason}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-400">Odd de Entrada</div>
                      <div className="text-sm font-black text-emerald-400 font-mono">
                        @{sig.odd.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-400">Stake Sugerida</div>
                      <div className="text-sm font-black text-orange-400 font-mono">
                        {sig.suggested_stake_amount.toLocaleString('pt-PT')} {currency}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="mt-3 pt-3 border-t border-zinc-900 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onSelectSignal(sig)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Target className="w-3.5 h-3.5" />
                    Avaliar Alerta [APOSTAR / IGNORAR]
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Responsibility Disclaimer (Item 49 & 62) */}
      <div className="bg-zinc-950 border border-zinc-800/70 rounded-xl p-3.5 flex items-start gap-2.5 text-[11px] text-zinc-400 leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-zinc-300 font-semibold">Declaração de Responsabilidade: </strong>
          Este aplicativo fornece alertas e informações estatísticas em tempo real baseadas em modelos matemáticos. Não realiza apostas automaticamente e não garante resultados futuros. A decisão de apostar e os riscos financeiros decorrentes são de responsabilidade exclusiva do utilizador.
        </div>
      </div>
    </div>
  );
};
