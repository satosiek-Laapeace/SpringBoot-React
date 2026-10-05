import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle, Mail, UserRound } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import { PasswordField } from './PasswordField';

export const RegisterForm = () => {
	const { signUp, signUpWithGoogle } = useAuth();
	const navigate = useNavigate();
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [registered, setRegistered] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

	const handleSubmit = async event => {
		event.preventDefault();
		setError('');
		setIsSubmitting(true);
		try {
			await signUp({ username: username.trim(), email: email.trim(), password });
			setRegistered(true);
		} catch (requestError) {
			setError(requestError.message || 'Registration failed. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleGoogleSuccess = async response => {
		if (!response.credential) {
			setError('Google did not return an identity token. Please try again.');
			return;
		}
		setError('');
		setIsSubmitting(true);
		try {
			await signUpWithGoogle(response.credential);
			navigate('/products', { replace: true });
		} catch (requestError) {
			setError(requestError.message || 'Google registration failed.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className="w-full max-w-[440px] space-y-6 text-slate-800">
			<Link to="/" className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-200">
				<ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back
			</Link>
			<header>
				<p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">FarmCraft account</p>
				<h1 className="mt-3 font-serif text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-[#123e2b] sm:text-[40px]">Create your account</h1>
				<p className="mt-3 text-[15px] leading-6 text-slate-500">Join the local marketplace and shop from nearby growers.</p>
			</header>

			{registered ? (
				<div className="space-y-4 text-center">
					<CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
					<p role="status" className="text-sm text-slate-700">Your account was created. Sign in with your username and password.</p>
					<Link to="/login" state={{ username }} className="auth-primary-button group inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white">Continue to sign in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
				</div>
			) : (
				<>
					{error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label htmlFor="register-username" className="mb-2 block text-sm font-semibold text-slate-700">Username</label>
							<div className="group relative">
								<UserRound aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-700" />
								<input id="register-username" name="username" type="text" autoComplete="username" minLength={2} maxLength={50} required value={username} onChange={event => setUsername(event.target.value)} placeholder="Choose a username" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10" />
							</div>
						</div>
						<div>
							<label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
							<div className="group relative">
								<Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-700" />
								<input id="register-email" name="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10" />
							</div>
						</div>
						<PasswordField id="register-password" label="Password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" minLength={6} />
						<button type="submit" disabled={isSubmitting} className="auth-primary-button group flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-sm font-bold text-white outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/20 disabled:cursor-wait disabled:opacity-60">
							{isSubmitting ? <><LoaderCircle className="h-4 w-4 animate-spin" />Creating account...</> : <>Create account<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
						</button>
					</form>

					<div className="flex items-center gap-3 text-xs text-slate-400" aria-hidden="true">
						<span className="h-px flex-1 bg-slate-200" />
						<span>or</span>
						<span className="h-px flex-1 bg-slate-200" />
					</div>

					{googleClientId ? (
						<div className="flex justify-center">
							<GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google registration was cancelled or failed.')} width="320" theme="outline" shape="rectangular" locale="en" />
						</div>
					) : (
						<p role="status" className="text-center text-xs text-slate-500">Google sign-in is not configured for this environment.</p>
					)}
					<p className="text-center text-sm text-slate-500">Already registered? <Link to="/login" className="font-semibold text-emerald-700 hover:underline">Sign in</Link></p>
				</>
			)}
		</section>
	);
};
