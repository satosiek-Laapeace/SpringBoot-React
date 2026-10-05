import React, { createContext, useContext, useEffect, useState } from 'react';
import {
	getCurrentUserAPI,
	googleLoginAPI,
	googleRegisterAPI,
	loginAPI,
	logoutAPI,
	registerAPI,
} from '../services/authApi';

const AuthContext = createContext(null);

const normalizeRole = role => String(role || '').replace(/^ROLE_/, '').toUpperCase();

const normalizeUser = (profile, authData = {}) => {
	const sourceRoles = authData.roles || profile.roles || (profile.role ? [profile.role] : []);
	const roles = (Array.isArray(sourceRoles) ? sourceRoles : [sourceRoles]).map(normalizeRole).filter(Boolean);
	const username = profile.username || authData.username || profile.name || '';
	const role = normalizeRole(profile.role || roles[0]);

	return {
		...profile,
		username,
		full_name: profile.full_name || profile.fullName || profile.displayName || profile.name || username,
		role,
		roles,
	};
};

const readStoredUser = () => {
	try {
		return JSON.parse(localStorage.getItem('farmcraft_user') || 'null');
	} catch {
		return null;
	}
};

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(() => localStorage.getItem('token'));
	const [user, setUser] = useState(() => localStorage.getItem('token') ? readStoredUser() : null);
	const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem('token')));
	const [isSessionVerified, setIsSessionVerified] = useState(false);
	const [sessionError, setSessionError] = useState('');
	const [sessionCheckAttempt, setSessionCheckAttempt] = useState(0);

	useEffect(() => {
		if (!token) {
			localStorage.removeItem('farmcraft_user');
			setIsSessionVerified(false);
			setSessionError('');
			setUser(null);
			setIsLoading(false);
			return undefined;
		}

		let active = true;
		setIsLoading(true);
		setIsSessionVerified(false);
		setSessionError('');
		getCurrentUserAPI()
			.then(profile => {
				if (!active) return;
				const savedUser = normalizeUser(profile);
				if (!savedUser.role) {
					throw new Error('The session profile did not include a role.');
				}
				localStorage.setItem('farmcraft_user', JSON.stringify(savedUser));
				setUser(savedUser);
				setIsSessionVerified(true);
			})
			.catch(error => {
				if (!active) return;
				localStorage.removeItem('farmcraft_user');
				setUser(null);
				setIsSessionVerified(false);
				if (error.status === 401 || error.status === 403) {
					localStorage.removeItem('token');
					setToken(null);
				} else {
					setSessionError('Unable to verify your session. Please try again.');
				}
			})
			.finally(() => {
				if (active) setIsLoading(false);
			});

		return () => {
			active = false
		};
	}, [token, sessionCheckAttempt])

	const acceptLoginResponse = result => {
		if (!result?.token) throw new Error('The login response did not include an access token.');

		const signedInUser = normalizeUser({ username: result.username }, result);
		localStorage.setItem('token', result.token);
		localStorage.setItem('farmcraft_user', JSON.stringify(signedInUser));
		setIsLoading(true);
		setIsSessionVerified(false);
		setSessionError('');
		setToken(result.token);
		setUser(signedInUser);
		setSessionCheckAttempt(attempt => attempt + 1);
		return signedInUser;
	};

	const signIn = async (username, password) => acceptLoginResponse(
		await loginAPI({ username, password })
	);

	const signInWithGoogle = async idToken => acceptLoginResponse(await googleLoginAPI(idToken));
	const signUp = userData => registerAPI(userData);
	const signUpWithGoogle = async idToken => acceptLoginResponse(await googleRegisterAPI(idToken));
	const updateCurrentUserProfile = profile => {
		const mergedProfile = {
			...user,
			...profile,
			username: profile.username ?? profile.name ?? user?.username,
			full_name: profile.full_name ?? profile.fullName ?? profile.name ?? user?.full_name,
			roles: profile.roles ?? user?.roles,
		};
		const updatedUser = normalizeUser(mergedProfile, { roles: mergedProfile.roles, username: mergedProfile.username });
		localStorage.setItem('farmcraft_user', JSON.stringify(updatedUser));
		setUser(updatedUser);
		return updatedUser;
	};
	const signOut = async () => {
		try {
			if (token) await logoutAPI();
		} catch {
			console.warn('The server logout request failed; the local session was cleared.');
		} finally {
			localStorage.removeItem('token');
			localStorage.removeItem('farmcraft_user');
			setToken(null);
			setUser(null);
			setIsSessionVerified(false);
			setSessionError('');
			setIsLoading(false);
		}
	};

	const role = user?.role || user?.roles?.[0] || null;
	const retrySessionCheck = () => setSessionCheckAttempt(attempt => attempt + 1);
 
	return (
		<AuthContext.Provider value={{
			token,
			user,
			role,
			roles: user?.roles || [],
			isAuthenticated: Boolean(token && isSessionVerified),
			isLoading,
			sessionError,
			retrySessionCheck,
			signIn,
			signInWithGoogle,
			signUp,
			signUpWithGoogle,
			updateCurrentUserProfile,
			signOut,
		}}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuthContext = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuthContext must be used within AuthProvider');
	return context;
};
