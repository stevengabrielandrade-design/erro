import React, { useState } from 'react';
import { Signal, UserSettings } from '../types';
import { X, Flame, ShieldAlert, CheckCircle2, EyeOff, TrendingUp } from 'lucide-react';

interface BetActionModalProps {
  signal: Signal | null;
  settings: UserSettings | null;
  onClose: () => void;
  onPlaceBet: (signalId: string, stake: number) => void;
  onIgnore: (signalId: string) => void;
}

export const BetActionModal: React.FC<BetActionModalProps> = ({
  signal,
  settings,
  onClose,
  onPlaceBet,
  onIgnore,
}) => {
  if (!signal) return null;

  const currency = settings?.currency || 'Kz';
  const [stake, setStake] = useState<number>(signal.suggested_stake_amount);
  const potentialProfit = Math.round(stake * (signal.odd - 1));
  const totalReturn = stake + potentialProfit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#121216] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950/60 via-orange-950/40 to-zinc-900 border-b border-zinc-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30">
              <Flame className="w-5 h-5" />
            </span>
            <div>
              <div className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                Sinal {signal.strategy} Detectado
              </div>
              <h3 className="text-base font-extrabold text-white truncate max-w-[260px]">
                {signal.match_name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Info */}
        <div className="p-5 space-y-4">
          {/* Match & Condition Highlights */}
          <div className="grid grid-cols-3 gap-2 bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3 text-center">
            <div>
              <div className="text-[10px] text-zinc-400">Minuto</div>
              <div className="text-sm font-black text-white font-mono">{signal.minute}'</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-400">Ataques Perigosos</div>
              <div className="text-sm font-black text-orange-400 font-mono">
                {signal.dangerous_attacks_favorite} ({signal.dangerous_attacks_rate}/min)
              </div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-400">Odd de Entrada</div>
              <div className="text-sm font-black text-emerald-400 font-mono">
                @{signal.odd.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Validation Reason */}
          <div className="text-xs text-zinc-300 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60 leading-relaxed">
            <strong className="text-orange-400 font-semibold">Critério: </strong>
            {signal.reason}
          </div>

          {/* Stake Input */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-medium">Stake sugerida ({signal.suggested_stake_percent}% da banca):</span>
              <span className="font-mono text-orange-400 font-bold">
                {signal.suggested_stake_amount.toLocaleString('pt-PT')} {currency}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-orange-500 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none"
              />
              <span className="text-xs text-zinc-400 font-bold px-2">{currency}</span>
            </div>
          </div>

          {/* Potential Return */}
          <div className="flex items-center justify-between text-xs px-1 text-zinc-300">
            <span>Retorno Potencial (se GREEN):</span>
            <span className="font-mono font-bold text-emerald-400">
              +{potentialProfit.toLocaleString('pt-PT')} {currency} ({totalReturn.toLocaleString('pt-PT')} {currency})
            </span>
          </div>

          {/* Disclaimer reminder */}
          <div className="flex items-start gap-2 text-[10px] text-zinc-400 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/50">
            <ShieldAlert className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <span>
              O Uchiha da Bet fornece alertas estatísticos. O aplicativo NÃO aposta automaticamente. Você decide livremente se aposta ou ignora.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center gap-3">
          <button
            onClick={() => onIgnore(signal.signal_id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs transition-colors active:scale-95"
          >
            <EyeOff className="w-4 h-4 text-zinc-400" />
            IGNORAR ALERTA
          </button>

          <button
            onClick={() => onPlaceBet(signal.signal_id, stake)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-orange-950/50 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            APOSTAR AGORA
          </button>
        </div>
      </div>
    </div>
  );
};
