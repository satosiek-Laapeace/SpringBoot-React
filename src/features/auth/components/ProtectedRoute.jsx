import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, allowedRoles }) => {
	const { isAuthenticated, isLoading, role, sessionError, retrySessionCheck } = useAuth();
	const location = useLocation();

	if (isLoading) {
		return <div role="status" className="flex min-h-60 items-center justify-center text-sm text-slate-500">Checking your session...</div>;
	}

	if (sessionError) {
		return (
			<div role="alert" className="flex min-h-60 flex-col items-center justify-center gap-3 text-center text-sm text-slate-600">
				<p>{sessionError}</p>
				<button type="button" onClick={retrySessionCheck} className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800">
					Try again
				</button>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (allowedRoles && (!role || !allowedRoles.includes(role))) {
		return <Navigate to="/" replace />;
	}

	return children;
};
