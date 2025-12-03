
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ChevronLeft, Camera, Mail, Save, User, Shield, Zap, Flame, Trophy, Calendar, LifeBuoy, AlertTriangle } from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  onUpdate: (updatedUser: UserProfile) => void;
  onBack: () => void;
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate, onBack, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    title: user.title || 'Student',
    bio: user.bio || 'Learning to code, one line at a time.',
    email: user.email
  });

  const handleSave = () => {
    onUpdate({
      ...user,
      name: formData.name,
      title: formData.title,
      bio: formData.bio,
      email: formData.email
    });
    setIsEditing(false);
  };

  const handleSupport = () => {
    window.location.href = "mailto:support@simskill.com?subject=SimSkill Support Request";
  };

  const confirmCancelSubscription = () => {
    onUpdate({
      ...user,
      isPro: false
    });
    setShowCancelConfirm(false);
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto animate-fade-in pb-24">
      
      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#09090b] border border-red-900/50 p-6 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
                
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Cancel Subscription?
                </h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Are you sure you want to cancel your <span className="text-emerald-400 font-bold">Pro Architect</span> plan? 
                    You will lose access to premium features like infinite practice and advanced grading immediately.
                </p>
                
                <div className="flex gap-3 justify-end">
                    <button 
                        onClick={() => setShowCancelConfirm(false)} 
                        className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                        Keep Plan
                    </button>
                    <button 
                        onClick={confirmCancelSubscription} 
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-red-900/20"
                    >
                        Confirm Cancellation
                    </button>
                </div>
            </div>
        </div>
      )}

      <button 
        onClick={onBack}
        className="mb-8 text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors flex items-center gap-2 font-mono"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Identity */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-gray-800 to-gray-900 border-4 border-[#050505] shadow-xl flex items-center justify-center text-4xl font-bold text-gray-400">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 p-2 bg-emerald-500 rounded-full text-black border-4 border-[#050505]">
                    <Camera className="w-4 h-4" />
                </div>
              </div>

              {!isEditing ? (
                  <>
                    <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                    <p className="text-emerald-500 font-mono text-xs uppercase tracking-wider mb-4">{user.title || 'Tech Explorer'}</p>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">{user.bio || 'No bio yet.'}</p>
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="w-full py-2 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                        Edit Profile
                    </button>
                  </>
              ) : (
                  <div className="w-full space-y-3">
                    <input 
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Name"
                    />
                    <input 
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Title (e.g. Frontend Dev)"
                    />
                     <textarea 
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none resize-none h-24"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="Short bio..."
                    />
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="flex-1 py-2 text-xs text-gray-400 hover:text-white">Cancel</button>
                        <button onClick={handleSave} className="flex-1 py-2 bg-emerald-500 text-black text-xs font-bold rounded hover:bg-emerald-400 flex items-center justify-center gap-1">
                            <Save className="w-3 h-3" /> Save
                        </button>
                    </div>
                  </div>
              )}
           </div>

           <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Credentials</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                        <Mail className="w-4 h-4 text-gray-600" />
                        {user.email}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                        <Shield className="w-4 h-4 text-gray-600" />
                        {user.isPro ? <span className="text-emerald-400 font-bold">Pro Member</span> : "Free Tier"}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        Joined {user.joinedDate || 'Oct 2023'}
                    </div>
                </div>
           </div>
        </div>

        {/* Right Column: Stats & Settings */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900/20 border border-gray-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2 text-yellow-500 text-xs font-bold uppercase">
                        <Zap className="w-4 h-4" /> Total XP
                    </div>
                    <div className="text-3xl font-bold text-white">{user.xp.toLocaleString()}</div>
                </div>
                <div className="bg-gray-900/20 border border-gray-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2 text-orange-500 text-xs font-bold uppercase">
                        <Flame className="w-4 h-4" /> Streak
                    </div>
                    <div className="text-3xl font-bold text-white">{user.streak} <span className="text-sm font-normal text-gray-500">days</span></div>
                </div>
                <div className="bg-gray-900/20 border border-gray-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2 text-purple-500 text-xs font-bold uppercase">
                        <Trophy className="w-4 h-4" /> Projects
                    </div>
                    <div className="text-3xl font-bold text-white">{user.completedProjects.length}</div>
                </div>
            </div>

            {/* Settings Area */}
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8">
                 <h3 className="text-white font-bold mb-4">Account Settings</h3>
                 <div className="space-y-4">
                     <div className="flex justify-between items-center py-2 border-b border-gray-800">
                         <div>
                             <p className="text-white text-sm">Email Notifications</p>
                             <p className="text-gray-500 text-xs">Receive grading reports via email.</p>
                         </div>
                         <div className="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                             <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                         </div>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-gray-800">
                         <div>
                             <p className="text-white text-sm">Public Profile</p>
                             <p className="text-gray-500 text-xs">Allow others to see your progress.</p>
                         </div>
                         <div className="w-10 h-6 bg-gray-700 rounded-full relative cursor-pointer">
                             <div className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full"></div>
                         </div>
                     </div>

                     {/* Cancel Subscription - Only for Pro Users */}
                     {user.isPro && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-800">
                            <div>
                                <p className="text-white text-sm">Pro Subscription</p>
                                <p className="text-gray-500 text-xs">Manage your plan status.</p>
                            </div>
                            <button
                                onClick={() => setShowCancelConfirm(true)}
                                className="text-xs text-red-400 hover:text-white border border-red-900/50 hover:bg-red-900/50 hover:border-red-500 px-4 py-2 rounded bg-transparent transition-all"
                            >
                                Cancel Plan
                            </button>
                        </div>
                     )}
                     
                     <div className="flex justify-between items-center py-2 border-b border-gray-800">
                         <div className="flex items-center gap-3">
                             <div>
                                 <p className="text-white text-sm flex items-center gap-2">
                                    <LifeBuoy className="w-4 h-4 text-emerald-500" /> Contact Support
                                 </p>
                                 <p className="text-gray-500 text-xs">Need help with your account or billing?</p>
                             </div>
                         </div>
                         <button 
                            onClick={handleSupport}
                            className="text-xs text-gray-300 hover:text-white border border-gray-700 hover:border-emerald-500 px-4 py-2 rounded bg-gray-900 transition-all"
                         >
                            Open Ticket
                         </button>
                     </div>

                     <div className="flex justify-between items-center py-2 pt-2">
                         <div 
                            onClick={onLogout}
                            className="text-red-400 text-sm cursor-pointer hover:text-red-300 font-medium"
                         >
                            Sign Out
                         </div>
                     </div>
                 </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileView;
