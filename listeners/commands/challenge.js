import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	MessageFlags,
	User,
} from "discord.js";
import { db } from "../../utils/database.js";
import * as embeds from "../../utils/embeds.js";

/** @type { SlashCommand } */
export const run = async (interaction) => {
	const member = interaction.options.getMember("user");

	if (!member) {
		await interaction.reply({
			embeds: [embeds.error("You can't challenge somebody outside the server")],
			flags: [MessageFlags.Ephemeral],
		});
		return true;
	}

	const user = /** @type {User} */ (member.user);

	if (user.id === interaction.user.id) {
		await interaction.reply({
			embeds: [embeds.error("You can't challenge yourself!")],
			flags: [MessageFlags.Ephemeral],
		});
		return true;
	}

	if (user.bot) {
		await interaction.reply({
			embeds: [embeds.error("You can't challenge a bot!")],
			flags: [MessageFlags.Ephemeral],
		});
		return true;
	}

	const challengerIsInGame = /** @type { boolean } */ (
		await db.get(`${interaction.guildId}.users.${interaction.user.id}.inGame`)
	);

	if (challengerIsInGame) {
		await interaction.reply({
			embeds: [
				embeds.error(
					`${interaction.user} you must finish the game you're in before starting another one.`,
				),
			],
		});
		return true;
	}

	const challengedIsInGame = /** @type { boolean } */ (
		await db.get(`${interaction.guildId}.users.${user.id}.inGame`)
	);

	if (challengedIsInGame) {
		await interaction.reply({
			embeds: [
				embeds.error(
					`${interaction.user} you can't challenge ${user.username} because they are in a game at the moment.`,
				),
			],
		});
		return true;
	}

	const embed = new EmbedBuilder()
		.setTitle("New Gauntlet Challenge")
		.setDescription(
			`${interaction.user} is challenging you to a gauntlet.\n\nClick the button below to accept the invitation.`,
		)
		.setThumbnail(interaction.user.displayAvatarURL())
		.setColor(0xffffff);

	const acceptButton = new ButtonBuilder()
		.setCustomId(`accept_gauntlet-${interaction.user.id}-${user.id}`)
		.setLabel("Accept Challenge")
		.setStyle(ButtonStyle.Success);

	const acceptRow = new ActionRowBuilder().addComponents(acceptButton);

	await interaction.reply({
		content: `${user}`,
		embeds: [embed],
		components: [acceptRow],
	});
	return true;
};
