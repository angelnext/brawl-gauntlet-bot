import { Client, GatewayIntentBits } from "discord.js";
import { setListeners } from "./utils/listeners.js";
import { log } from "./utils/logger.js";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

const TOKEN = process.env.TOKEN;

try {
	await setListeners(client);
	await client.login(TOKEN);
} catch (err) {
	log.fatal("Error loading commands and/or starting client");
	console.error(err);
}
