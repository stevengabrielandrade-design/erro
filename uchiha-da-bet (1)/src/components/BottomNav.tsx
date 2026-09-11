import React from 'react';
import { Home, Flame, BarChart3, Users, Settings, ShoppingBag } from 'lucide-react';

export type TabId = 'dashboard' | 'signals' | 'analytics' | 'community' | 'settings' | 'shop';

interface BottomNavProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  pendingSignalsCount: number;
  activeOpsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  pendingSignalsCount,
  activeOpsCount,
}) => {
  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'signals', label: 'Sinais', icon: Flame, badge: pendingSignalsCount },
    { id: 'analytics', label: 'Estatísticas', icon: BarChart3, badge: activeOpsCount > 0 ? activeOpsCount : undefined },
    { id: 'community', label: 'Comunidade', icon: Users },
    { id: 'settings', label: 'Config', icon: Settings },
    { id: 'shop', label: 'Loja', icon: ShoppingBag },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-md border-t border-zinc-800/80 px-2 py-1.5 sm:py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all select-none ${
                isActive
                  ? 'text-orange-400 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-orange-500 stroke-[2.5]' : 'stroke-2'
                  }`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#0c0c0e] animate-bounce">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <div className="w-3 h-0.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
