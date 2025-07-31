import { Events, Routes } from "discord.js";
import { commands } from "../../utils/listeners.js";
import { log } from "../../utils/logger.js";

export const on = Events.ClientReady;

export const run = async ({ rest, user }) => {
	try {
		await rest.put(Routes.applicationCommands(user.id), {
			body: commands.map(([on]) => on.toJSON()),
		});
		log.info(`Logged in as "${user.tag}"`);
	} catch (err) {
		log.fatal("There was an error uploading commands to Discord API");
		console.error(err);
		return false;
	}

	return true;
};
