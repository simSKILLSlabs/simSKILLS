import React, { useState } from 'react';
import Hero from '../components/Hero';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { SEO } from '../components/SEO';

const LandingPage: React.FC = () => {
    const [showAuth, setShowAuth] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleStart = () => {
        if (user.isLoggedIn) {
            navigate('/dashboard');
        } else {
            setShowAuth(true);
        }
    };

    const handleLogin = () => {
        setShowAuth(false);
        navigate('/dashboard');
    };

    return (
        <>
            <SEO title="SimSKILLS — Learn Software Engineering by Building" description="Structured computer science and software engineering tracks with interactive assignments and code reviews." />
            <Hero onStart={handleStart} onLogin={handleStart} />
            {showAuth && <AuthModal onLogin={handleLogin} onClose={() => setShowAuth(false)} />}
        </>
    );
};

export default LandingPage;
