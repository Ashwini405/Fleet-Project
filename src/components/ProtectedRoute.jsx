import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AccessDenied from "../pages/AccessDenied";

function PageLoader() {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

export default function ProtectedRoute({ module, action = "view", redirectIfDenied = false, children }) {
    const { isAuthenticated, loading, hasPermission, sidebar } = useAuth();
    const location = useLocation();

    if (loading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (module && !hasPermission(module, action)) {
        // e.g. the home route: send users without Dashboard access to their first allowed page
        const firstAllowed = sidebar?.[0]?.items?.[0]?.path;
        if (redirectIfDenied && firstAllowed && firstAllowed !== location.pathname) {
            return <Navigate to={firstAllowed} replace />;
        }
        return <AccessDenied />;
    }

    return children;
}
