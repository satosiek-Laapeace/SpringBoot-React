import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import logoImg from '../assets/images/craftfarm-logo.png';

export const RegisterPage = () => {
  const { switchRole } = useStore();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('BUYER');

  const handleRegister = (e) => {
    e.preventDefault();
    switchRole(role);
    navigate('/');
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
              Create CraftFarm Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Join thousands of smart farmers and buyers on CraftFarm.
            </p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs font-semibold">
          
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Account Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('BUYER')}
                className={`py-2 rounded-xl font-bold transition-all ${
                  role === 'BUYER'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                🛒 Fresh Produce Buyer
              </button>
              <button
                type="button"
                onClick={() => setRole('SELLER')}
                className={`py-2 rounded-xl font-bold transition-all ${
                  role === 'SELLER'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                👨‍🌾 Farmer / Seller
              </button>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sophea Heng"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
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
                placeholder="name@example.com"
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
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Register CraftFarm Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 font-bold hover:underline">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
};
