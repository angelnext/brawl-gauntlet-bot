import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	User,
} from "discord.js";
import { embeds } from "../../utils/embeds.js";
import { db } from "../../utils/database.js";

/** @param {ChatInputCommandInteraction} interaction */
export const run = async (interaction) => {
	const member = interaction.options.getMember("user", true);

	if (!member) {
		await interaction.reply({
			embeds: [embeds.error("You can't challenge somebody outside the server")],
			flags: [MessageFlags.Ephemeral],
		});
		return;
	}

	/** @type {User} */
	const user = member.user;

	if (user.id === interaction.user.id) {
		await interaction.reply({
			embeds: [embeds.error("You can't challenge yourself!")],
			flags: [MessageFlags.Ephemeral],
		});
		return;
	}

	if (user.bot) {
		await interaction.reply({
			embeds: [embeds.error("You can't challenge a bot!")],
			flags: [MessageFlags.Ephemeral],
		});
		return;
	}

	const challengerIsInGame = await db.get(
		`${interaction.guildId}-${interaction.user.id}-in_game`,
	);

	if (challengerIsInGame) {
		await interaction.reply({
			embeds: [
				embeds.error(
					`${interaction.user} you must finish the game you're in before starting another one.`,
				),
			],
		});
		return;
	}

	const challengedIsInGame = await db.get(
		`${interaction.guildId}-${user.id}-in_game`,
	);

	if (challengedIsInGame) {
		await interaction.reply({
			embeds: [
				embeds.error(
					`${interaction.user} you can't challenge ${user.username} because he is in a game at the moment.`,
				),
			],
		});
		return;
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
