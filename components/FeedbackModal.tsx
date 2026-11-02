import React, { useState } from 'react';
import { X, Send, MessageSquare, Loader2 } from 'lucide-react';
import { saveFeedback } from '../services/db';
import { toast } from 'sonner';

interface FeedbackModalProps {
    isOpen?: boolean;
    onClose: () => void;
    userId?: string;
    userEmail?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen = true, onClose, userId, userEmail }) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!message.trim()) return;

        setIsSending(true);
        try {
            await saveFeedback({
                userId: userId || 'anonymous',
                userEmail: userEmail || 'anonymous',
                message: message,
                timestamp: Date.now(),
                type: 'general'
            });

            setSent(true);
            setTimeout(() => {
                setSent(false);
                setMessage('');
                onClose();
            }, 1500);
        } catch (error) {
            console.error("Failed to send feedback:", error);
            toast.error("Failed to send feedback. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="surface-card w-full max-w-md rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.08] flex justify-between items-center bg-[#080a0f]">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-300" />
                        <span>Send Product Feedback</span>
                    </h3>
                    <button
                        onClick={onClose}
                        className="btn-secondary w-7 h-7 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="p-6">
                    {sent ? (
                        <div className="text-center py-6 animate-fade-in space-y-2">
                            <div className="w-10 h-10 surface-recessed rounded-xl flex items-center justify-center mx-auto">
                                <Send className="w-4 h-4 text-indigo-300" />
                            </div>
                            <h4 className="text-sm font-bold text-white">Feedback Received</h4>
                            <p className="text-neutral-400 text-xs">Thank you for helping improve SimSKILLS.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-xs text-neutral-300">
                                Share suggestions, curriculum requests, or bug reports directly with our team.
                            </p>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Describe your feedback..."
                                className="w-full h-28 surface-recessed rounded-xl p-3.5 text-white text-xs focus:border-white/30 outline-none resize-none transition-colors placeholder-neutral-500"
                            />
                            <div className="flex justify-end gap-2.5">
                                <button
                                    onClick={onClose}
                                    className="btn-secondary px-3.5 py-2 text-xs rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!message.trim() || isSending}
                                    className="btn-primary px-4 py-2 text-xs font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                                >
                                    {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                    <span>{isSending ? 'Sending...' : 'Submit Feedback'}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;
