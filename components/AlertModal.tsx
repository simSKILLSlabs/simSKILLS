import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface AlertModalProps {
  message: string | null;
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="surface-card p-6 rounded-2xl max-w-md w-full relative">
        <button
          onClick={onClose}
          className="btn-secondary absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-950/30 rounded-lg flex items-center justify-center border border-red-900/50 shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="text-sm font-bold text-white">
              Request Could Not Be Completed
            </h3>
          </div>

          <p className="text-neutral-300 text-xs leading-relaxed">
            {message}
          </p>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="btn-primary px-4 py-2 text-xs font-semibold rounded-lg"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
