import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	Events,
	Message,
	TextChannel,
} from "discord.js";
import { db } from "../../utils/database.js";
import * as embeds from "../../utils/embeds.js";

export const on = Events.MessageCreate;

/** @param {Message} message */
export const run = async (message) => {
	if (!message.content.includes("<@&1262435961653035209>")) return;
	const isInGame = await db.get(
		`${message.guildId}.users.${message.author.id}.inGame`,
	);

	if (!message.channel.isSendable()) {
		return true;
	}

	if (isInGame) {
		await message.delete();
		await message.channel.send({
			embeds: [
				embeds.error(
					`${message.author} you must finish the game you're in before starting another one.`,
				),
			],
		});
		return;
	}

	const embed = new EmbedBuilder()
		.setTitle("New Gauntlet Challenge")
		.setDescription(
			`${message.author} is searching for a game\n\nClick the button below to challenge them to a gauntlet.`,
		)
		.setThumbnail(message.author.displayAvatarURL())
		.setColor(0xffffff);

	const acceptButton = new ButtonBuilder()
		.setCustomId(`accept_gauntlet-${message.author.id}`)
		.setLabel("Accept Challenge")
		.setStyle(ButtonStyle.Success);

	const acceptRow = /** @type {ActionRowBuilder<ButtonBuilder>} */ (
		new ActionRowBuilder().addComponents(acceptButton)
	);

	await message.channel.send({ embeds: [embed], components: [acceptRow] });

	return true;
};
