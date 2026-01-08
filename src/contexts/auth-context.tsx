"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { account, teams } from "@/lib/appwrite";
import type { Models } from "appwrite";

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    isAdmin: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    logout: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);

            // Check if user is in admin team
            await checkAdminStatus();

            // If on login page and authenticated, redirect to home
            if (pathname === "/login") {
                router.push("/");
            }
        } catch {
            setUser(null);
            setIsAdmin(false);

            // If not on login page and not authenticated, redirect to login
            if (pathname !== "/login") {
                router.push("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const checkAdminStatus = async () => {
        try {
            const adminTeamId = process.env.NEXT_PUBLIC_APPWRITE_ADMIN_TEAM_ID;
            if (!adminTeamId) {
                setIsAdmin(false);
                return;
            }

            // Get user's team memberships
            const userTeams = await teams.list();
            const isInAdminTeam = userTeams.teams.some(
                (team) => team.$id === adminTeamId
            );
            setIsAdmin(isInAdminTeam);
        } catch (error) {
            console.error("Failed to check admin status:", error);
            setIsAdmin(false);
        }
    };

    const logout = async () => {
        try {
            // Only attempt to delete session if user is logged in
            if (user) {
                await account.deleteSession("current");
            }
        } catch (error) {
            console.error("Logout error:", error);
            // Continue with logout even if session deletion fails
        } finally {
            // Always clear local state and redirect
            setUser(null);
            setIsAdmin(false);
            router.push("/login");
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

