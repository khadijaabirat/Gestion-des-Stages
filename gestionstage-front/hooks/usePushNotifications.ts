import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Check if already subscribed
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setSubscription(sub);
          }
        });
      });
    }
  }, []);

  const subscribe = async () => {
    if (!isSupported) {
      toast.error('Les notifications Web ne sont pas supportées sur ce navigateur.');
      return;
    }

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        toast.error('Vous devez autoriser les notifications dans votre navigateur.');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // We need a VAPID public key from backend (using a generic one for now, usually fetched from API)
      const applicationServerKey = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuB231f13b-mJ2P6E00kF41E_o');
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      setSubscription(sub);

      // Send to backend
      await apiFetch('/push/subscribe', {
        method: 'POST',
        body: JSON.stringify(sub.toJSON()),
      });

      toast.success('Notifications activées avec succès !');
    } catch (error) {
      console.error('Erreur lors de la souscription:', error);
      toast.error('Erreur lors de l\'activation des notifications.');
    }
  };

  const unsubscribe = async () => {
    if (subscription) {
      try {
        await subscription.unsubscribe();
        setSubscription(null);
        
        // Remove from backend
        await apiFetch('/push/unsubscribe', {
          method: 'POST',
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        toast.success('Notifications désactivées.');
      } catch (error) {
        console.error('Erreur lors de la désinscription:', error);
      }
    }
  };

  return {
    isSupported,
    permission,
    subscription,
    subscribe,
    unsubscribe,
  };
}

// Utility function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
