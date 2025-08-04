import { Client, GatewayIntentBits } from "discord.js";
import { setListeners } from "./utils/listeners.js";
import { log } from "./utils/logger.js";
import { Hono } from "hono";
import { serve } from "@hono/node-server";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

let TOKEN;

if (process.env.NODE_ENV === "development") {
	TOKEN = process.env.DEV_TOKEN;
} else {
	TOKEN = process.env.TOKEN;
}

try {
	await setListeners(client);
	await client.login(TOKEN);

	const app = new Hono();
	app.get("/", (c) => c.text("Something something"));
	serve(app);
} catch (err) {
	log.fatal("Error loading commands and/or starting client");
	console.error(err);
}
