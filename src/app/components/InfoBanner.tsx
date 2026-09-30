import { Info, X } from 'lucide-react';
import { useState } from 'react';

interface InfoBannerProps {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning';
  dismissible?: boolean;
}

/**
 * InfoBanner - Reusable information banner component
 * Used throughout the app to display important messages and tips
 */
export default function InfoBanner({ 
  title, 
  message, 
  type = 'info',
  dismissible = true 
}: InfoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };

  const iconStyles = {
    info: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600'
  };

  return (
    <div className={`${styles[type]} border rounded-lg p-4 relative`}>
      <div className="flex items-start gap-3">
        <Info size={20} className={`${iconStyles[type]} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm opacity-90">{message}</p>
        </div>
        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
