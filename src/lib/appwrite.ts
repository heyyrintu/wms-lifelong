import { Client, Account, Databases } from "appwrite";

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "695f46420013c5e5e580");

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
