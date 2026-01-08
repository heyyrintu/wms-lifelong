import { Client, Account, Databases } from "appwrite";

const client = new Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("695f46420013c5e5e580");

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
