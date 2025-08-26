import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Wifi, WifiOff } from 'lucide-react';

export const OnlineStatusIndicator = () => {
  const isOnline = useOnlineStatus();

  const statusClass = isOnline ? 'bg-green-500' : 'bg-red-500';
  const text = isOnline ? 'Online' : 'Offline';
  const Icon = isOnline ? Wifi : WifiOff;

  return (
    <div className={`fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 text-white text-sm font-semibold rounded-full shadow-lg ${statusClass}`}>
      <Icon className="h-4 w-4" />
      <span>{text}</span>
    </div>
  );
};
