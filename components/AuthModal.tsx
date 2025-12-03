import React, { useState } from 'react';
import { X, Mail, Lock, Github, ArrowRight, AlertCircle, Loader2, Chrome } from 'lucide-react';
import { auth, googleProvider, githubProvider } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';



interface AuthModalProps {
    onLogin: (name: string, email: string) => void;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
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

    const handleSocialLogin = async (provider: any) => {
        setError('');
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            onLogin(user.displayName || user.email?.split('@')[0] || 'User', user.email || '');
        } catch (err: any) {
            console.error(err);
            setError("Social login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8 relative overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-gray-400 text-sm">Sync your progress across devices.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-500 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {!isLogin && (
                        <div className="bg-gray-900/50 border border-gray-800 rounded-lg flex items-center px-4 py-3">
                            <span className="text-gray-500 text-sm w-8">ID</span>
                            <input
                                type="text"
                                placeholder="Username"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-600"
                            />
                        </div>
                    )}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg flex items-center px-4 py-3">
                        <Mail className="w-4 h-4 text-gray-500 mr-3" />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-600"
                        />
                    </div>
                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg flex items-center px-4 py-3">
                        <Lock className="w-4 h-4 text-gray-500 mr-3" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-600"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 text-black font-bold py-3 rounded-lg hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Join Free'}
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>

                </form>

                <div className="mt-6 flex items-center justify-center gap-4 text-gray-500 text-xs">
                    <span className="h-px w-12 bg-gray-800"></span>
                    OR
                    <span className="h-px w-12 bg-gray-800"></span>
                </div>

                <div className="space-y-3 mt-6">
                    <button
                        onClick={() => handleSocialLogin(googleProvider)}
                        disabled={loading}
                        className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Chrome className="w-4 h-4" />
                        Continue with Google
                    </button>

                    <button
                        onClick={() => handleSocialLogin(githubProvider)}
                        disabled={loading}
                        className="w-full bg-[#24292e] text-white font-medium py-3 rounded-lg hover:bg-[#2f363d] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Github className="w-4 h-4" />
                        Continue with GitHub
                    </button>
                </div>


                <div className="mt-6 text-center text-sm text-gray-500">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setIsLogin(!isLogin)} className="text-emerald-500 hover:underline">
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AuthModal;