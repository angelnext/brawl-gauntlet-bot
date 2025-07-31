import { join } from "node:path";
import {
	ChatInputCommandInteraction,
	Client,
	Collection,
	ContextMenuCommandBuilder,
	Events,
	SlashCommandBuilder,
} from "discord.js";
import fg from "fast-glob";
import { log } from "./logger.js";

/**
 * @callback runFn
 * @param {ChatInputCommandInteraction | Events} options
 * @returns {Promise<boolean>}
 */

/** @type {Collection<string, [SlashCommandBuilder | ContextMenuCommandBuilder, runFn]>} */
export const commands = new Collection();

/** @param {Client} client */
export async function setListeners(client) {
	const files = await fg([join(process.cwd(), "listeners/**/*.js")]);

	for (const file of files) {
		/**
		 * @type {{ on: SlashCommandBuilder | ContextMenuCommandBuilder | string, run: runFn }}
		 */
		const { on, run } = await import(file);

		if (!on) continue;

		const isSlashCommand = on instanceof SlashCommandBuilder;
		const isContextCommand = on instanceof ContextMenuCommandBuilder;

		if (isSlashCommand || isContextCommand) {
			commands.set(on.name, [on, run]);
			continue;
		}

		client.on(on, async (event) => {
			try {
				const success = await run(event);

				if (success === false) {
					log.warn(
						`Error was caught at event on file "${file}", this is normal behaviour most of the time, but worth checking`,
					);
				} else if (success === true) {
					log.success(`Event on file "${file}" executed successfully!`);
				}
			} catch (err) {
				log.fatal(`Uncaught error at event on file "${file}"`);
				console.error(err);
			}
		});
	}
}
