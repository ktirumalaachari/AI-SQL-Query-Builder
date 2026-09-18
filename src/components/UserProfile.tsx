import React, { useState } from 'react';
import {
  User as UserIcon, Mail, Calendar, KeyRound, Check, AlertCircle, Loader2,
  Database, History, Camera, ShieldCheck, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
];

export const UserProfile: React.FC = () => {
  const { user, token, updateProfile, refreshProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');
  
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  if (!user) return null;

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameSuccess(null);
    setNameError(null);

    if (!name.trim()) {
      setNameError('Full Name cannot be empty.');
      return;
    }

    setIsUpdatingName(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: name.trim(), profile_image: profileImage })
      });

      const data = await res.json();

      if (!res.ok) {
        setNameError(data.error || 'Failed to update profile.');
      } else {
        updateProfile(data.user);
        setNameSuccess('Profile updated successfully!');
        setTimeout(() => setNameSuccess(null), 3000);
      }
    } catch (e) {
      setNameError('Communication error.');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleSelectAvatar = async (imgUrl: string) => {
    setProfileImage(imgUrl);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: user.name, profile_image: imgUrl })
      });

      const data = await res.json();
      if (res.ok) {
        updateProfile(data.user);
      }
    } catch (e) {
      console.error("Avatar update error:", e);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess(null);
    setPassError(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPassError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPassError('New Password and Confirm New Password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('New Password must be at least 6 characters long.');
      return;
    }

    setIsChangingPass(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        setPassError(data.error || 'Failed to change password.');
      } else {
        setPassSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => setPassSuccess(null), 3000);
      }
    } catch (e) {
      setPassError('Communication error.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const formattedDate = new Date(user.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner Profile Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          <div className="relative">
            {user.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-600 border-2 border-indigo-400 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-md">
                {user.name.charAt(0)}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              {user.name}
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Active Account
              </span>
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> {user.email}
            </p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Member since {formattedDate}
            </p>
          </div>
        </div>

        {/* User Usage Stats */}
        <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 w-full md:w-auto">
          <div className="text-center px-4 border-r border-slate-800">
            <p className="text-xl font-extrabold text-indigo-400 flex items-center justify-center gap-1">
              <History className="w-4 h-4" /> {user.totalQueries || 0}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">Total Queries</p>
          </div>
          <div className="text-center px-4">
            <p className="text-xl font-extrabold text-cyan-400 flex items-center justify-center gap-1">
              <Database className="w-4 h-4" /> {user.totalDatabasesUploaded || 0}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">Databases Loaded</p>
          </div>
        </div>

      </div>

      {/* Grid: Edit Profile & Change Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Personal Details & Avatar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
          
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Update Personal Details</h3>
              <p className="text-xs text-slate-400">Change display name and select profile picture</p>
            </div>
          </div>

          {nameSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{nameSuccess}</span>
            </div>
          )}

          {nameError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{nameError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateName} className="space-y-4">
            
            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Choose Avatar Preset</label>
              <div className="flex items-center gap-3">
                {PRESET_AVATARS.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="Avatar preset"
                    onClick={() => handleSelectAvatar(img)}
                    className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition ${
                      profileImage === img
                        ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/30'
                        : 'border-slate-800 hover:border-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Read-only Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-800/60 bg-slate-950/60 text-slate-500 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingName}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
            >
              {isUpdatingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Name</span>
            </button>

          </form>

        </div>

        {/* Card 2: Security & Change Password */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
          
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Security & Password</h3>
              <p className="text-xs text-slate-400">Update account password securely</p>
            </div>
          </div>

          {passSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{passSuccess}</span>
            </div>
          )}

          {passError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
            >
              {isChangingPass ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
              <span>Update Password</span>
            </button>

          </form>

        </div>

      </div>

    </div>
  );
};
