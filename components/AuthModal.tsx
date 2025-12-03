import React, { useState } from 'react';
import { X, Mail, Lock, Github, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  onLogin: (name: string, email: string) => void;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // Mock Login
      onLogin(name || email.split('@')[0], email);
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

            <button type="submit" className="w-full bg-emerald-500 text-black font-bold py-3 rounded-lg hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 mt-2">
                {isLogin ? 'Sign In' : 'Join Free'}
                <ArrowRight className="w-4 h-4" />
            </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4 text-gray-500 text-xs">
            <span className="h-px w-12 bg-gray-800"></span>
            OR
            <span className="h-px w-12 bg-gray-800"></span>
        </div>

        <button onClick={() => onLogin('GitHub User', 'gh@test.com')} className="w-full mt-6 bg-gray-900 border border-gray-800 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
            <Github className="w-4 h-4" />
            Continue with GitHub
        </button>

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