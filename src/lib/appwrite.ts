import { Client, Account, Databases, Teams } from "appwrite";

// Helper to clean environment variables that might have extra quotes from Docker/Coolify
const cleanEnvVar = (value: string | undefined, fallback: string): string => {
    if (!value) return fallback;
    // Remove surrounding quotes if present (handles \"value\" or "value")
    return value.replace(/^\\*["']|\\*["']$/g, '').replace(/^["']|["']$/g, '');
};

const endpoint = cleanEnvVar(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT, "https://fra.cloud.appwrite.io/v1");
const projectId = cleanEnvVar(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID, "695f46420013c5e5e580");

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

const account = new Account(client);
const databases = new Databases(client);
const teams = new Teams(client);

export { client, account, databases, teams };
