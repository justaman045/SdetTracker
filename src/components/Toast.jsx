import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-green-400" />,
  error: <XCircle className="w-5 h-5 text-red-400" />,
  info: <Info className="w-5 h-5 text-blue-400" />,
};

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, toast.duration ?? 3000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 shadow-xl animate-in slide-in-from-right duration-200 min-w-[260px] max-w-sm">
      {ICONS[toast.type ?? 'info']}
      <span className="text-sm text-gray-200 flex-1">{toast.message}</span>
      <button onClick={onRemove} className="text-gray-500 hover:text-gray-300">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
