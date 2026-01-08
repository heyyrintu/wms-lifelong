"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { account } from "@/lib/appwrite";
import type { Models } from "appwrite";

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);

            // If on login page and authenticated, redirect to home
            if (pathname === "/login") {
                router.push("/");
            }
        } catch (error) {
            setUser(null);

            // If not on login page and not authenticated, redirect to login
            if (pathname !== "/login") {
                router.push("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await account.deleteSession("current");
            setUser(null);
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
