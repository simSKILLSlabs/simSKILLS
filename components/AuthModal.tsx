import React, { useState } from 'react';
import { X, Mail, Lock, Github, ArrowRight, AlertCircle, Loader2, Chrome, User } from 'lucide-react';
import { auth, googleProvider, githubProvider, isFirebaseConfigured } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
    onLogin: (name: string, email: string) => void;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose }) => {
    const { loginLocal } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Please enter an email address');
            return;
        }
        if (password.length < 4) {
            setError('Please enter a password');
            return;
        }

        setLoading(true);

        try {
            if (isFirebaseConfigured && auth) {
                if (isLogin) {
                    await signInWithEmailAndPassword(auth, email, password);
                    onLogin(name || email.split('@')[0], email);
                } else {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    if (name) {
                        await updateProfile(userCredential.user, { displayName: name });
                    }
                    onLogin(name || email.split('@')[0], email);
                }
            } else {
                const resolvedName = name || email.split('@')[0];
                await loginLocal(resolvedName, email);
                onLogin(resolvedName, email);
            }
        } catch (err: any) {
            console.error(err);
            let msg = "Authentication failed";
            if (err.code === 'auth/invalid-credential') msg = "Invalid email or password";
            else if (err.code === 'auth/email-already-in-use') msg = "Email already in use";
            else if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: any, providerLabel: string) => {
        setError('');
        setLoading(true);
        try {
            if (isFirebaseConfigured && auth) {
                const result = await signInWithPopup(auth, provider);
                const user = result.user;
                onLogin(user.displayName || user.email?.split('@')[0] || 'User', user.email || '');
            } else {
                const fallbackEmail = `${providerLabel.toLowerCase()}@simskills.dev`;
                const fallbackName = `${providerLabel} Developer`;
                await loginLocal(fallbackName, fallbackEmail);
                onLogin(fallbackName, fallbackEmail);
            }
        } catch (err: any) {
            console.error(err);
            setError("Social login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="surface-card w-full max-w-md rounded-2xl p-8 relative">
                <button
                    onClick={onClose}
                    className="btn-secondary absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="mb-6">
                    <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-mono font-bold text-xs mb-4 shadow-sm">
                        S
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        {isLogin ? 'Sign in to SimSKILLS' : 'Create your account'}
                    </h2>
                    <p className="text-neutral-400 text-xs mt-1">
                        Save your learning tracks, code drafts, and XP across sessions.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {error && (
                        <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 flex items-center gap-2 text-red-400 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {!isLogin && (
                        <div className="surface-recessed focus-within:border-white/30 rounded-lg flex items-center px-3.5 py-2.5 transition-colors">
                            <User className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
                            <input
                                type="text"
                                placeholder="Name or username"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-transparent border-none outline-none text-white text-xs w-full placeholder-neutral-500"
                            />
                        </div>
                    )}
                    <div className="surface-recessed focus-within:border-white/30 rounded-lg flex items-center px-3.5 py-2.5 transition-colors">
                        <Mail className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-transparent border-none outline-none text-white text-xs w-full placeholder-neutral-500"
                        />
                    </div>
                    <div className="surface-recessed focus-within:border-white/30 rounded-lg flex items-center px-3.5 py-2.5 transition-colors">
                        <Lock className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-transparent border-none outline-none text-white text-xs w-full placeholder-neutral-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <span>{isLogin ? 'Continue with Email' : 'Create Account'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="my-5 flex items-center justify-center gap-3 text-neutral-500 text-[11px] font-mono">
                    <span className="h-px flex-1 bg-white/[0.08]" />
                    <span>OR</span>
                    <span className="h-px flex-1 bg-white/[0.08]" />
                </div>

                <div className="space-y-2.5">
                    <button
                        type="button"
                        onClick={() => handleSocialLogin(googleProvider, 'Google')}
                        disabled={loading}
                        className="btn-secondary w-full font-medium text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Chrome className="w-4 h-4 text-neutral-300" />
                        <span>Continue with Google</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSocialLogin(githubProvider, 'GitHub')}
                        disabled={loading}
                        className="btn-secondary w-full font-medium text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Github className="w-4 h-4 text-neutral-300" />
                        <span>Continue with GitHub</span>
                    </button>
                </div>

                <div className="mt-6 text-center text-xs text-neutral-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setIsLogin(!isLogin)} className="text-white font-semibold hover:underline">
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;