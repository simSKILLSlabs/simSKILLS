import React from 'react';
import ProfileView from '../components/ProfileView';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

const ProfilePage: React.FC = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <>
            <SEO title="Profile" />
            <ProfileView
                user={user}
                onUpdate={updateUser}
                onBack={() => navigate('/dashboard')}
                onLogout={handleLogout}
            />
        </>
    );
};

export default ProfilePage;
