"use client";

import { useEffect } from "react";
import { client } from "@/lib/appwrite";

/**
 * AppwriteVerifier component
 * Automatically pings the Appwrite backend server when the app loads
 * to verify the connection and setup.
 */
export function AppwriteVerifier() {
    useEffect(() => {
        const verifyAppwrite = async () => {
            try {
                await client.ping();
                console.log("✅ Appwrite connection verified");
            } catch (error) {
                console.error("❌ Appwrite connection failed:", error);
            }
        };

        verifyAppwrite();
    }, []);

    return null; // This component doesn't render anything
}
