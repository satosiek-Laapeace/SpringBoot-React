import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LoaderCircle, Mail, UserRound } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import { PasswordField } from './PasswordField';
import { forgotPasswordAPI, resetPasswordAPI } from '../services/authApi';


export const LoginForm = () => {
	const { signIn, signInWithGoogle } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [username, setUsername] = useState(location.state?.username || '');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isForgotPassword, setIsForgotPassword] = useState(false);
	const [resetEmail, setResetEmail] = useState('');
	const [resetCode, setResetCode] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [resetCodeSent, setResetCodeSent] = useState(false);
	const [resetMessage, setResetMessage] = useState(null);
	const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

	const finishSignIn = user => {
		const defaultPath = user.role === 'ADMIN'
			? '/dashboard/admin'
			: user.role === 'SELLER'
				? '/dashboard/seller'
				: '/products';
		navigate(location.state?.from?.pathname || defaultPath, { replace: true });
	};

	const handleSubmit = async event => {
		event.preventDefault();
		setError('');
		setIsSubmitting(true);
		try {
			const user = await signIn(username.trim(), password);
			finishSignIn(user);
		} catch (requestError) {
			setError(requestError.message || 'Sign in failed. Check your username and password.');
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
			finishSignIn(await signInWithGoogle(response.credential));
		} catch (requestError) {
			setError(requestError.message || 'Google sign-in failed. Register first if you do not have an account.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleForgotPassword = async event => {
		event.preventDefault();
		setError('');
		setResetMessage(null);
		setIsSubmitting(true);
		try {
			if (!resetCodeSent) {
				const result = await forgotPasswordAPI(resetEmail.trim());
				setResetCodeSent(true);
				setResetMessage({
					type: 'success',
					text: result?.message || 'If an account with that email exists, a verification code has been sent.',
				});
				return;
			}

			if (newPassword !== confirmPassword) {
				setResetMessage({ type: 'error', text: 'The new passwords do not match.' });
				return;
			}

			const result = await resetPasswordAPI({
				email: resetEmail.trim(),
				otp: resetCode.trim(),
				newPassword,
			});
			setResetMessage({
				type: 'success',
				text: result?.message || 'Password reset successfully. You can now sign in.',
			});
			setIsForgotPassword(false);
			setPassword('');
			setResetCode('');
			setNewPassword('');
			setConfirmPassword('');
		} catch (requestError) {
			setResetMessage({ type: 'error', text: requestError.message || 'Password reset could not be completed.' });
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
				<h1 className="mt-3 font-serif text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-[#123e2b] sm:text-[40px]">
					{isForgotPassword ? 'Reset your password' : 'Welcome back'}
				</h1>
				<p className="mt-3 text-[15px] leading-6 text-slate-500">
					{isForgotPassword ? 'We’ll email you a verification code to reset your password.' : 'Sign in to discover fresh picks from local farms.'}
				</p>
			</header>

			{error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
			{resetMessage && (
				<p role={resetMessage.type === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-3 py-2 text-sm ${resetMessage.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
					{resetMessage.text}
				</p>
			)}

			{isForgotPassword ? (
				<form onSubmit={handleForgotPassword} className="space-y-4">
					<div>
						<label htmlFor="reset-email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
						<div className="group relative">
							<Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-700" />
							<input
							id="reset-email"
							name="email"
							type="email"
							autoComplete="email"
							required
							value={resetEmail}
							onChange={event => setResetEmail(event.target.value)}
							placeholder="Enter your account email"
							className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
							/>
						</div>
					</div>
					{resetCodeSent && (
						<>
							<div>
								<label htmlFor="reset-code" className="mb-2 block text-sm font-semibold text-slate-700">Verification code</label>
								<input
									id="reset-code"
									name="one-time-code"
									type="text"
									inputMode="numeric"
									autoComplete="one-time-code"
									pattern="[0-9]{6}"
									maxLength={6}
									required
									value={resetCode}
									onChange={event => setResetCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
									placeholder="Enter the 6-digit code"
									className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-700/15"
								/>
							</div>
							<PasswordField
								id="reset-new-password"
								label="New password"
								value={newPassword}
								onChange={event => setNewPassword(event.target.value)}
								autoComplete="new-password"
								minLength={6}
							/>
							<PasswordField
								id="reset-confirm-password"
								label="Confirm new password"
								value={confirmPassword}
								onChange={event => setConfirmPassword(event.target.value)}
								autoComplete="new-password"
								minLength={6}
							/>
						</>
					)}
					<button type="submit" disabled={isSubmitting} className="auth-primary-button group flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-sm font-bold text-white outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/20 disabled:cursor-wait disabled:opacity-60">
						{isSubmitting ? <><LoaderCircle className="h-4 w-4 animate-spin" />Please wait...</> : <>{resetCodeSent ? 'Reset password' : 'Send verification code'}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
					</button>
					<button
						type="button"
						onClick={() => {
							setIsForgotPassword(false);
							setResetMessage(null);
							setResetCodeSent(false);
							setResetCode('');
							setNewPassword('');
							setConfirmPassword('');
						}}
						className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"
					>
						<ArrowLeft className="h-4 w-4" /> Back to sign in
					</button>
				</form>
			) : (
			<>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="login-username" className="mb-2 block text-sm font-semibold text-slate-700">Username</label>
					<div className="relative">
						<UserRound aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
						<input
							id="login-username"
							name="username"
							type="text"
							autoComplete="username"
							required
							value={username}
							onChange={event => setUsername(event.target.value)}
							placeholder="Enter your username"
						className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
						/>
					</div>
				</div>

				<PasswordField
					id="login-password"
					label="Password"
					value={password}
					onChange={event => setPassword(event.target.value)}
					autoComplete="current-password"
					inputClassName="bg-slate-50"
				/>

				<div className="-mt-1 text-right">
					<button
						type="button"
						onClick={() => {
							setResetEmail('');
							setResetCodeSent(false);
							setResetMessage(null);
							setIsForgotPassword(true);
						}}
						className="text-sm font-semibold text-emerald-700 hover:underline"
					>
						Forgot password?
					</button>
				</div>

			<button type="submit" disabled={isSubmitting} className="auth-primary-button group flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-sm font-bold text-white outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/20 disabled:cursor-wait disabled:opacity-60">
				{isSubmitting ? <><LoaderCircle className="h-4 w-4 animate-spin" />Signing in...</> : <>Sign in<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
				</button>
			</form>

			<div className="flex items-center gap-3 text-xs text-slate-400" aria-hidden="true">
				<span className="h-px flex-1 bg-slate-200" />
				<span>or</span>
				<span className="h-px flex-1 bg-slate-200" />
			</div>

			{googleClientId ? (
				<div className="flex justify-center">
					<GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google sign-in was cancelled or failed.')} width="320" theme="outline" shape="rectangular" locale="en" />
				</div>
			) : (
				<p role="status" className="text-center text-xs text-slate-500">Google sign-in is not configured for this environment.</p>
			)}

			<p className="text-center text-sm text-slate-500">
				New to FarmCraft? <Link to="/register" className="font-semibold text-emerald-700 hover:underline">Create an account</Link>
			</p>
			</>
			)}
		</section>
	);
};
