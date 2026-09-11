import React from 'react';
import { UchihaEyeLogo } from './UchihaEyeLogo';
import { SystemBotStatus, UserSettings } from '../types';
import { Activity, RefreshCw, Volume2, VolumeX, ShieldAlert, BellRing, Bell } from 'lucide-react';

interface HeaderProps {
  status: SystemBotStatus | null;
  settings: UserSettings | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTriggerScan: () => void;
  isScanning: boolean;
  onOpenNotificationTest?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  settings,
  soundEnabled,
  onToggleSound,
  onTriggerScan,
  isScanning,
  onOpenNotificationTest,
}) => {
  const isOnline = status?.online ?? true;
  const isMonitoring = status?.monitoring_active ?? true;
  const currency = settings?.currency || 'Kz';
  const currentBankroll = settings?.bankroll?.current ?? 250000;

  return (
    <header className="sticky top-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5">
          <UchihaEyeLogo size={36} />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black tracking-wider text-white uppercase font-mono">
                UCHIHA <span className="text-orange-500">DA BET</span>
              </h1>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/50">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline && isMonitoring ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                  }`}
                />
                <span className="font-medium text-zinc-300">
                  {isOnline && isMonitoring ? 'BOT ONLINE' : 'MONITOR PAUSADO'}
                </span>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400 truncate max-w-[130px] sm:max-w-none">
                Fonte: <strong className="text-zinc-200 capitalize">{status?.active_provider || 'ScoreBing'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right Info: Bankroll & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Bankroll Pill */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-1.5 text-right shadow-inner">
            <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
              Banca Atual
            </div>
            <div className="text-sm sm:text-base font-extrabold text-white font-mono tracking-tight text-orange-400">
              {currentBankroll.toLocaleString('pt-PT')} <span className="text-xs text-zinc-300 font-normal">{currency}</span>
            </div>
          </div>

          {/* Quick Trigger Scan Button */}
          <button
            onClick={onTriggerScan}
            disabled={isScanning}
            title="Executar varredura manual de jogos"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 text-zinc-300 hover:text-orange-400 transition-colors active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-orange-500' : ''}`} />
          </button>

          {/* Notification Bar Test & Status Toggle */}
          {onOpenNotificationTest && (
            <button
              onClick={onOpenNotificationTest}
              title="Testar alertas na barra de notificações do celular"
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 text-orange-400 hover:text-orange-300 transition-colors active:scale-95 relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-orange-500" />
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar alertas sonoros' : 'Ativar alertas sonoros'}
            className={`p-2 rounded-xl border transition-colors active:scale-95 ${
              soundEnabled
                ? 'bg-red-950/40 border-red-800/60 text-red-400 hover:text-red-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
