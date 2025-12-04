import React, { useState } from 'react';
import { X, Send, MessageSquare, Loader2 } from 'lucide-react';
import { saveFeedback } from '../services/db';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId?: string;
    userEmail?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, userId, userEmail }) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!message.trim()) return;

        setIsSending(true);
        try {
            // Save to Firestore
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
            }, 2000);
        } catch (error) {
            console.error("Failed to send feedback:", error);
            alert("Failed to send feedback. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#09090b] border border-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/30">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-emerald-500" />
                        Send Feedback
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-6">
                    {sent ? (
                        <div className="text-center py-8 animate-fade-in">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">Feedback Sent!</h4>
                            <p className="text-gray-400 text-sm">Thank you for helping us improve.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-400">
                                Have a suggestion or found a bug? Let us know!
                            </p>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your feedback here..."
                                className="w-full h-32 bg-black border border-gray-800 rounded-xl p-4 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none transition-all"
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!message.trim() || isSending}
                                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {isSending ? 'Sending...' : 'Send Feedback'}
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
