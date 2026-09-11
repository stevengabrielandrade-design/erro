import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Vibrate,
  Clock,
  ExternalLink,
  X,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { notificationService, NotificationState } from '../services/notificationService';
import confetti from 'canvas-confetti';

interface NotificationTestModalProps {
  onClose: () => void;
}

export const NotificationTestModal: React.FC<NotificationTestModalProps> = ({ onClose }) => {
  const [notifState, setNotifState] = useState<NotificationState>(notificationService.getState());
  const [countdown, setCountdown] = useState<number | null>(null);
  const [lastNotificationSent, setLastNotificationSent] = useState<{
    title: string;
    body: string;
    time: string;
    type: 'signal' | 'green' | 'cobertura';
  } | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'warning' | 'info';
    text: string;
  } | null>(null);

  useEffect(() => {
    // Atualiza estado de permissão
    setNotifState(notificationService.getState());
  }, []);

  // Handler para solicitar permissão
  const handleRequestPermission = async () => {
    const perm = await notificationService.requestPermission();
    setNotifState(notificationService.getState());
    if (perm === 'granted') {
      setFeedbackMessage({
        type: 'success',
        text: 'Permissão concedida com sucesso! Agora você receberá os sinais diretamente na barra de notificações do celular.',
      });
    } else if (perm === 'denied') {
      setFeedbackMessage({
        type: 'warning',
        text: 'Permissão foi bloqueada no navegador. Para desbloquear, toque no ícone de cadeado na barra de endereços do seu celular e ative as notificações.',
      });
    }
  };

  // Disparo imediato da simulação
  const handleImmediateSimulation = async (type: 'signal' | 'green' | 'cobertura' = 'signal') => {
    let title = '🔥 Uchiha da Bet — SINAL DETECTADO!';
    let body = '⚡ Arsenal vs Chelsea (18\' 1T) — HT 0.5 Gols @1.85! Pressão Máxima (17 AP) 🎯';
    let soundType: 'signal' | 'green' | 'goal' = 'signal';

    if (type === 'green') {
      title = '💰 GREEN CONFIRMADO! — Lucro Registrado';
      body = '✅ Arsenal marcou aos 22\'! +12.500 Kz creditados na sua banca.';
      soundType = 'green';
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } else if (type === 'cobertura') {
      title = '🛡️ ALERTA DE COBERTURA (45-50\')';
      body = '⚠️ Real Madrid vs Valencia (47\' 2T) — HT não bateu! Pressão reiniciada (5 AP no 2T) @1.78.';
      soundType = 'signal';
    }

    const res = await notificationService.sendMobileNotification({
      title,
      body,
      tag: `test-${Date.now()}`,
      soundType,
      vibrate: true,
    });

    const nowStr = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    setLastNotificationSent({ title, body, time: nowStr, type });

    if (res.success) {
      setFeedbackMessage({
        type: 'success',
        text: `Simulação disparada! ${res.message}`,
      });
    } else {
      setFeedbackMessage({
        type: 'warning',
        text: `Aviso: ${res.message}. Teste visual e sonoro foi acionado!`,
      });
    }
  };

  // Simulação com Delay de 5s para o usuário testar com tela bloqueada ou app minimizado
  const handleDelayedSimulation = () => {
    let timeLeft = 5;
    setCountdown(timeLeft);
    setFeedbackMessage({
      type: 'info',
      text: '⏱️ Contagem iniciada! Você tem 5 segundos para minimizar o navegador ou bloquear a tela do seu celular para ver o alerta chegar na barra!',
    });

    const timer = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        clearInterval(timer);
        setCountdown(null);
        handleImmediateSimulation('signal');
      } else {
        setCountdown(timeLeft);
      }
    }, 1000);
  };

  // Abrir em nova aba para garantir suporte mobile sem restrições de iframe
  const handleOpenStandalone = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121216] border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-mono tracking-tight flex items-center gap-1.5">
                TESTE DA BARRA DE NOTIFICAÇÕES
              </h2>
              <p className="text-xs text-zinc-400">Simulador de Alertas Push no Celular</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-sm">
          {/* Status Diagnostic Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Diagnóstico do Dispositivo
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  notifState.permission === 'granted'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : notifState.permission === 'denied'
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                Permissão:{' '}
                {notifState.permission === 'granted'
                  ? 'CONCEDIDA ✅'
                  : notifState.permission === 'denied'
                  ? 'BLOQUEADA ❌'
                  : 'PENDENTE ⚠️'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/60 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-orange-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-zinc-400">Barra do Celular</div>
                  <div className="font-semibold text-zinc-200">
                    {notifState.supported ? 'Suportada' : 'Não Suportada'}
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/60 flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-orange-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-zinc-400">Vibração Háptica</div>
                  <div className="font-semibold text-zinc-200">
                    {notifState.vibrationSupported ? 'Ativa' : 'Indisponível'}
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/60 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-orange-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-zinc-400">Alerta Sonoro</div>
                  <div className="font-semibold text-zinc-200">Sintetizador OK</div>
                </div>
              </div>

              <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/60 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-zinc-400">Service Worker</div>
                  <div className="font-semibold text-zinc-200">
                    {notifState.serviceWorkerActive ? 'Registrado' : 'Standby'}
                  </div>
                </div>
              </div>
            </div>

            {/* Permission Action if not granted */}
            {notifState.permission !== 'granted' && (
              <div className="pt-1">
                <button
                  onClick={handleRequestPermission}
                  className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Ativar Permissão de Notificações no Celular
                </button>
              </div>
            )}
          </div>

          {/* Iframe Notice & New Tab Button */}
          {notifState.isIframe && (
            <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-3 text-xs text-blue-300 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-200">
                  <ExternalLink className="w-3.5 h-3.5" /> Dica de Teste Mobile
                </div>
                <p className="text-[11px] text-blue-300/90 leading-relaxed">
                  Para que a notificação apareça fisicamente na barra de status do seu celular com o aplicativo em segundo plano, abra em uma aba direta ou instale como app:
                </p>
              </div>
              <button
                onClick={handleOpenStandalone}
                className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1"
              >
                Abrir Direto <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Feedback Message */}
          {feedbackMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 animate-in fade-in duration-200 ${
                feedbackMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : feedbackMessage.type === 'warning'
                  ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{feedbackMessage.text}</p>
            </div>
          )}

          {/* Main Simulation Triggers */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              Ações de Simulação
            </span>

            {/* Simulation 1: Immediate */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-orange-400" />
                  Simulação Imediata (Agora)
                </div>
                <p className="text-[11px] text-zinc-400">
                  Dispara agora mesmo na barra com som e vibração do Sharingan
                </p>
              </div>
              <button
                onClick={() => handleImmediateSimulation('signal')}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-lg flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" /> Disparar
              </button>
            </div>

            {/* Simulation 2: Delayed with 5s countdown */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Simular com 5s de Delay
                </div>
                <p className="text-[11px] text-zinc-400">
                  Dá tempo de minimizar o app ou bloquear a tela do celular
                </p>
              </div>
              <button
                onClick={handleDelayedSimulation}
                disabled={countdown !== null}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 active:scale-95 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-lg flex items-center gap-1.5 shrink-0"
              >
                {countdown !== null ? (
                  <span className="font-mono text-xs">{countdown}s...</span>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" /> Testar 5s
                  </>
                )}
              </button>
            </div>

            {/* Other Simulation scenarios */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleImmediateSimulation('cobertura')}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-left transition-colors text-xs text-zinc-300 font-medium flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Sinal Cobertura</div>
                  <div className="text-[10px] text-zinc-500">Odd 1.78 no 2º Tempo</div>
                </div>
              </button>

              <button
                onClick={() => handleImmediateSimulation('green')}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-left transition-colors text-xs text-zinc-300 font-medium flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Vitória GREEN!</div>
                  <div className="text-[10px] text-zinc-500">+12.500 Kz de Lucro</div>
                </div>
              </button>
            </div>
          </div>

          {/* Visual Mobile Notification Shade Replica (Fidelidade Visual do Celular) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Visualização na Barra do Celular (Android / iOS)
              </span>
              <span className="text-[10px] text-zinc-500">Prévia do Sistema</span>
            </div>

            {/* Mobile Notification Card Mock */}
            <div className="bg-[#1e1e24] border border-zinc-700/80 rounded-2xl p-3.5 shadow-xl relative overflow-hidden">
              <div className="flex items-start gap-3">
                {/* Uchiha App Icon in Notification */}
                <div className="w-10 h-10 rounded-xl bg-black border border-red-600/60 p-1 flex items-center justify-center shrink-0 shadow-md">
                  <div className="w-full h-full rounded-full bg-red-600/20 flex items-center justify-center">
                    <span className="text-red-500 font-bold text-xs">👁️</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-0.5">
                    <div className="flex items-center gap-1.5 font-bold tracking-wider text-zinc-300 uppercase">
                      UCHIHA DA BET <span className="text-[9px] text-zinc-500">• agora</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {lastNotificationSent?.time || '18:34'}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-white tracking-tight">
                    {lastNotificationSent?.title || '🔥 Uchiha da Bet — SINAL DETECTADO!'}
                  </div>

                  <p className="text-[11px] text-zinc-300 mt-1 leading-snug">
                    {lastNotificationSent?.body ||
                      '⚡ Arsenal vs Chelsea (18\' 1T) — HT 0.5 Gols @1.85! Pressão Máxima (17 AP) 🎯'}
                  </p>

                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={() => {
                        alert('Ação da notificação: Abrindo detalhes do sinal no aplicativo!');
                      }}
                      className="px-3 py-1 bg-red-600/90 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider"
                    >
                      Apostar HT
                    </button>
                    <button
                      onClick={() => {
                        setLastNotificationSent(null);
                      }}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-semibold"
                    >
                      Dispensar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            Motor de Alertas Push v2.4 • Uchiha Bet
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
