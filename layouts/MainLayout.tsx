import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500 selection:text-black grid-bg font-sans relative overflow-x-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/5 rounded-full blur-[120px]" />
            </div>

            {/* Content Content */}
            <div className="relative z-10">
                <Outlet />
            </div>

            <Toaster position="bottom-right" theme="dark" />
        </div>
    );
};

export default MainLayout;
