import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [sidebar, setSidebar] = useState([]);
    const [loading, setLoading] = useState(true);

    const applySession = useCallback((data) => {
        const nextUser = data.user || null;
        const nextPermissions = data.permissions || [];
        const nextSidebar = data.sidebar || [];

        if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
        if (nextUser) localStorage.setItem("user", JSON.stringify(nextUser));
        if (nextPermissions.length) localStorage.setItem("permissions", JSON.stringify(nextPermissions));
        if (nextSidebar.length) localStorage.setItem("sidebar", JSON.stringify(nextSidebar));

        setUser(nextUser);
        setPermissions(nextPermissions);
        setSidebar(nextSidebar);
    }, []);

    const clearSession = useCallback(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("permissions");
        localStorage.removeItem("sidebar");
        setUser(null);
        setPermissions([]);
        setSidebar([]);
    }, []);

    const login = useCallback(async (username, password) => {
        const { data } = await api.post("/auth/login", { username, password });
        applySession(data.data);
        return data.data;
    }, [applySession]);

    const logout = useCallback(async () => {
        try {
            await api.post("/auth/logout");
        } catch (e) {
            // ignore - we clear local state regardless
        }

        clearSession();

        if (window.location.pathname !== "/login") {
            window.location.assign("/login");
        }
    }, [clearSession]);

    // Attempt to silently restore a session (e.g. after a page refresh)
    const bootstrap = useCallback(async () => {
        try {
            const { data } = await api.post("/auth/refresh-token", {}, { withCredentials: true });
            const accessToken = data.data.accessToken;
            const nextUser = data.data.user;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("user", JSON.stringify(nextUser));
            setUser(nextUser);

            const [permsRes, sidebarRes] = await Promise.all([
                api.get("/auth/permissions"),
                api.get("/auth/sidebar"),
            ]);
            const perms = permsRes.data.data || [];
            const sb = sidebarRes.data.data || [];
            localStorage.setItem("permissions", JSON.stringify(perms));
            localStorage.setItem("sidebar", JSON.stringify(sb));
            setPermissions(perms);
            setSidebar(sb);
        } catch (error) {
            // Only use cache if we have a valid token (network error, not auth error)
            const cachedUser = localStorage.getItem("user");
            const cachedToken = localStorage.getItem("accessToken");
            if (cachedUser && cachedToken) {
                setUser(JSON.parse(cachedUser));
                // Always fetch fresh permissions/sidebar even on refresh-token failure
                try {
                    const [permsRes, sidebarRes] = await Promise.all([
                        api.get("/auth/permissions"),
                        api.get("/auth/sidebar"),
                    ]);
                    const perms = permsRes.data.data || [];
                    const sb = sidebarRes.data.data || [];
                    localStorage.setItem("permissions", JSON.stringify(perms));
                    localStorage.setItem("sidebar", JSON.stringify(sb));
                    setPermissions(perms);
                    setSidebar(sb);
                } catch {
                    // Token truly expired — clear everything
                    clearSession();
                }
            } else {
                clearSession();
            }
        } finally {
            setLoading(false);
        }
    }, [clearSession]);

    useEffect(() => {
        bootstrap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Listen for permission changes triggered by Roles & Permissions page
    useEffect(() => {
        const handler = () => {
            const perms = localStorage.getItem('permissions');
            const sb = localStorage.getItem('sidebar');
            if (perms) setPermissions(JSON.parse(perms));
            if (sb) setSidebar(JSON.parse(sb));
        };
        window.addEventListener('auth-refresh', handler);
        return () => window.removeEventListener('auth-refresh', handler);
    }, []);

    const hasPermission = useCallback((moduleName, action = "view") => {
        const row = permissions.find((p) => p.module_name === moduleName);
        return !!(row && row[`can_${action}`]);
    }, [permissions]);

    const value = {
        user,
        permissions,
        sidebar,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
