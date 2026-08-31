
import { AlertCircle, X } from 'lucide-react';

interface Props {
  message: string;
  onClose?: () => void;
}

export default function ErrorBanner({ message, onClose }: Props) {
  return (
    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
      <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
      <p className="text-sm text-red-400 flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
          <X size={14} className="text-red-400" />
        </button>
      )}
    </div>
  );
}
