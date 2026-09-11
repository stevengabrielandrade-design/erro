import { soundManager } from '../utils/audio';

export interface NotificationState {
  supported: boolean;
  permission: NotificationPermission;
  serviceWorkerActive: boolean;
  vibrationSupported: boolean;
  isIframe: boolean;
}

export interface SendNotificationResult {
  success: boolean;
  method: 'service_worker' | 'notification_api' | 'simulated' | 'failed';
  message: string;
  error?: string;
}

class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isInitializing: boolean = false;

  constructor() {
    this.initServiceWorker();
  }

  public async initServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    if (this.swRegistration) {
      return this.swRegistration;
    }

    if (this.isInitializing) return null;
    this.isInitializing = true;

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      this.swRegistration = reg;
      console.log('⚡ [Uchiha Notificações] Service Worker registrado com sucesso!');
      return reg;
    } catch (err) {
      console.warn('⚠️ [Uchiha Notificações] Registro do Service Worker:', err);
      return null;
    } finally {
      this.isInitializing = false;
    }
  }

  public getState(): NotificationState {
    const isSupported = typeof window !== 'undefined' && 'Notification' in window;
    let isIframe = false;
    try {
      isIframe = window.self !== window.top;
    } catch {
      isIframe = true;
    }

    return {
      supported: isSupported,
      permission: isSupported ? Notification.permission : 'denied',
      serviceWorkerActive: !!this.swRegistration || (typeof navigator !== 'undefined' && 'serviceWorker' in navigator),
      vibrationSupported: typeof navigator !== 'undefined' && 'vibrate' in navigator,
      isIframe,
    };
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.error('Erro ao solicitar permissão de notificação:', err);
      return 'denied';
    }
  }

  /**
   * Envia uma notificação para o celular (barra de notificações nativa do Android / iOS)
   */
  public async sendMobileNotification(options: {
    title: string;
    body: string;
    tag?: string;
    soundType?: 'signal' | 'goal' | 'green' | 'red';
    vibrate?: boolean;
    data?: any;
  }): Promise<SendNotificationResult> {
    const {
      title,
      body,
      tag = 'uchiha-signal-alert',
      soundType = 'signal',
      vibrate = true,
      data = {},
    } = options;

    // 1. Toca o alerta sonoro no celular
    try {
      if (soundType === 'signal') soundManager.playSignalAlert();
      else if (soundType === 'goal') soundManager.playGoalAlert();
      else if (soundType === 'green') soundManager.playGreenWin();
      else if (soundType === 'red') soundManager.playRedLoss();
    } catch (e) {
      console.warn('Audio playback error:', e);
    }

    // 2. Aciona o motor de vibração háptica do celular
    if (vibrate && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([300, 120, 300, 120, 400]);
      } catch (e) {
        console.warn('Vibration error:', e);
      }
    }

    // 3. Tenta disparar notificação nativa para a barra de notificações
    if (typeof window !== 'undefined' && 'Notification' in window) {
      let currentPermission = Notification.permission;

      if (currentPermission === 'default') {
        currentPermission = await this.requestPermission();
      }

      if (currentPermission === 'granted') {
        // Método A: Via Service Worker (Necessário no Chrome Android para barra de notificações)
        if ('serviceWorker' in navigator) {
          try {
            const reg = (await navigator.serviceWorker.ready.catch(() => null)) || this.swRegistration;
            if (reg && 'showNotification' in reg) {
              await reg.showNotification(title, {
                body,
                icon: '/icon.svg',
                badge: '/icon.svg',
                vibrate: [300, 120, 300, 120, 400],
                tag,
                requireInteraction: true,
                data: { ...data, timestamp: Date.now() },
              });
              return {
                success: true,
                method: 'service_worker',
                message: 'Notificação enviada com sucesso para a barra de notificações do celular (via Service Worker)!',
              };
            }
          } catch (swErr) {
            console.warn('Falha no Service Worker notification, tentando fallback:', swErr);
          }
        }

        // Método B: Via Notification API direta
        try {
          const notification = new Notification(title, {
            body,
            icon: '/icon.svg',
            badge: '/icon.svg',
            tag,
            data,
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          return {
            success: true,
            method: 'notification_api',
            message: 'Notificação disparada na barra do dispositivo via Web Notification API!',
          };
        } catch (apiErr: any) {
          console.warn('Notification API fallback:', apiErr);
          return {
            success: true,
            method: 'simulated',
            message: 'Alerta simulado com sucesso (som + vibração + banner).',
          };
        }
      } else {
        return {
          success: false,
          method: 'failed',
          message: 'Permissão de notificação negada ou não concedida pelo navegador.',
        };
      }
    }

    return {
      success: true,
      method: 'simulated',
      message: 'Dispositivo sem suporte nativo a Web Notifications; simulação sonora e visual concluída.',
    };
  }
}

export const notificationService = new NotificationService();
