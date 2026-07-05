import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { API_BASE, apiFetch } from './api';

// Assurez-vous que window.Pusher est défini pour Laravel Echo
if (typeof window !== 'undefined') {
  (window as any).Pusher = Pusher;
}

let echoInstance: Echo | null = null;

export const getEcho = () => {
  if (typeof window === 'undefined') return null;

  if (!echoInstance) {
    echoInstance = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'lnxjyu44kdcywasphwf3',
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel: any, options: any) => {
      return {
        authorize: (socketId: string, callback: (err: boolean, data: any) => void) => {
          apiFetch('/broadcasting/auth', {
            method: 'POST',
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name
            }),
          })
          .then(response => {
            if (!response.ok) throw new Error('Broadcast Auth Failed');
            return response.json();
          })
          .then(data => {
            callback(false, data);
          })
          .catch(error => {
            console.error('WebSocket auth error:', error);
            callback(true, error);
          });
        }
      };
    },
  });
  }
  
  return echoInstance;
};
