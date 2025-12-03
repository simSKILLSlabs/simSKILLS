
import React from 'react';
import { AlertTriangle, X, Terminal } from 'lucide-react';

interface AlertModalProps {
  message: string | null;
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#09090b] border border-red-900/50 p-6 rounded-2xl max-w-md w-full shadow-[0_0_50px_-10px_rgba(220,38,38,0.2)] relative overflow-hidden transform transition-all scale-100">
        
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-600"></div>

        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
            <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center border border-red-900/50 mb-2">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <div>
                <h3 className="text-xl font-bold text-white mb-2 font-mono flex items-center justify-center gap-2">
                    <Terminal className="w-4 h-4 text-red-500" />
                    DOMAIN ERROR
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    {message}
                </p>
            </div>
            
            <div className="w-full pt-4">
                <button 
                    onClick={onClose} 
                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 hover:shadow-red-900/40"
                >
                    ACKNOWLEDGE & RETRY
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
