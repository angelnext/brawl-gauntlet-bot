import { Colors, EmbedBuilder, Events } from "discord.js";
import { commands } from "../../utils/listeners.js";
import { log } from "../../utils/logger.js";

export const on = Events.InteractionCreate;

/** @type {BotEvent} */
export const run = async (interaction) => {
	if (!interaction.isCommand()) return;

	const command = commands.get(interaction.commandName);
	if (!command?.length) {
		log.error(`Command with name "${interaction.commandName}" was not found!`);
		return false;
	}

	const [_, run] = command;

	try {
		const success = await run(interaction);

		if (success === false) {
			log.warn(
				`Error was caught at command "${
					interaction.commandName
				}", this is normal behaviour most of the time, but worth checking, command was executed with the following options: "${interaction.toString()}"`,
			);
		} else if (success === true) {
			log.success(
				`Command "${interaction.commandName}" executed successfully!`,
			);
		}
	} catch (err) {
		log.fatal(`Uncaught error at command "${interaction.commandName}"`);
		console.error(err);

		const embed = new EmbedBuilder()
			.setTitle("There was an error with this command")
			.setDescription(
				`The command ${interaction.commandName} failed by unknown reasons, try again later, or report this bug.`,
			)
			.setColor(Colors.Red)
			.setTimestamp(new Date());

		if (interaction.replied || interaction.deferred) {
			await interaction.editReply({ embeds: [embed] });
			return false;
		}

		await interaction.reply({ embeds: [embed] });
		return false;
	}

	return true;
};
