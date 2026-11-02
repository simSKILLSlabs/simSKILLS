import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#06070a] text-[#f0f2f5] selection:bg-white selection:text-black font-sans relative overflow-x-hidden">
            {/* Soft Overhead Ambient Illumination */}
            <div
                className="pointer-events-none fixed inset-x-0 top-0 h-[520px] z-0"
                style={{
                    background:
                        'radial-gradient(ellipse 75% 45% at 50% -10%, rgba(120, 145, 255, 0.085), rgba(255, 255, 255, 0.025) 45%, transparent 80%)',
                }}
            />

            <div className="relative z-10">
                <Outlet />
            </div>

            <Toaster
                position="bottom-right"
                theme="dark"
                toastOptions={{
                    style: {
                        background: '#0c0e14',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 12px 32px -8px rgba(0, 0, 0, 0.75)',
                        color: '#f0f2f5',
                    },
                }}
            />
        </div>
    );
};

export default MainLayout;
