import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Wifi, WifiOff } from 'lucide-react';

export const OnlineStatusIndicator = () => {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 text-white text-sm font-semibold rounded-full shadow-lg bg-red-500">
        <WifiOff className="h-4 w-4" />
        <span>Offline</span>
      </div>
    );
  }

  // Render nothing if online, to be less intrusive.
  // Or we could show a green one for a few seconds when connection is restored.
  // For now, let's only show it when offline.
  return null;
};
