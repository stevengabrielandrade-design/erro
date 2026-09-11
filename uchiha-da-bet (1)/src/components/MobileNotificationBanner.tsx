import React, { useState, useEffect } from 'react';
import { Bell, X, ExternalLink, ShieldCheck, Flame } from 'lucide-react';
import { soundManager } from '../utils/audio';

export interface MobileBannerData {
  id: string;
  title: string;
  body: string;
  time?: string;
  type?: 'signal' | 'green' | 'cobertura';
  onAction?: () => void;
}

interface MobileNotificationBannerProps {
  banner: MobileBannerData | null;
  onDismiss: () => void;
}

export const MobileNotificationBanner: React.FC<MobileNotificationBannerProps> = ({
  banner,
  onDismiss,
}) => {
  if (!banner) return null;

  return (
    <div className="fixed top-2 left-2 right-2 sm:left-auto sm:right-4 sm:w-96 z-50 animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="bg-[#18181f]/95 border border-red-500/50 rounded-2xl shadow-2xl backdrop-blur-xl p-3.5 text-white overflow-hidden">
        {/* Top Header / App Identity */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 pb-1 border-b border-zinc-800/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-extrabold uppercase tracking-wider text-zinc-200 font-mono">
              UCHIHA DA BET
            </span>
            <span className="text-[10px] text-zinc-500">• agora</span>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 text-zinc-400 hover:text-white rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex items-start gap-3 mt-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 p-0.5 shrink-0 flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center text-red-500 font-bold text-xs">
              👁️
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs text-white leading-tight flex items-center gap-1">
              {banner.title}
            </div>
            <p className="text-[11px] text-zinc-300 mt-1 leading-snug">
              {banner.body}
            </p>

            {/* Quick Action buttons */}
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={() => {
                  if (banner.onAction) banner.onAction();
                  onDismiss();
                }}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all shadow-md"
              >
                Ver no App
              </button>
              <button
                onClick={onDismiss}
                className="px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-medium transition-colors"
              >
                Dispensar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
