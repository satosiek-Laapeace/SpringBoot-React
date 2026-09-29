import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import logoImg from '../assets/images/craftfarm-logo.png';

export const LoginPage = () => {
  const { switchRole } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('reach@craftfarm.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('BUYER');

  const handleLogin = (e) => {
    e.preventDefault();
    switchRole(role);
    if (role === 'BUYER') navigate('/');
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        <div className="text-center space-y-3">
          <img
            src={logoImg}
            alt="CraftFarm Logo"
            className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-emerald-500/40 shadow-xl"
          />
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-serif tracking-tight">
              Welcome back to CraftFarm
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sign in to manage your marketplace orders, stock, or farm insights.
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs font-semibold">
          
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Select Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'BUYER', label: '🛒 Buyer' },
                { id: 'SELLER', label: '👨‍🌾 Farmer' },
                { id: 'ADMIN', label: '👑 Admin' }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    role === r.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Sign In to CraftFarm</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-600 font-bold hover:underline">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
};
