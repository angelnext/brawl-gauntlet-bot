import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	Events,
} from "discord.js";
import * as embeds from "../../utils/embeds.js";
import { db } from "../../utils/database.js";
import { MANAGER_ROLE } from "../../utils/consts.js";

export const on = Events.InteractionCreate;

/** @type {ButtonEvent} */
export const run = async (interaction) => {
	if (!interaction.isStringSelectMenu()) return;
	if (!interaction.customId.startsWith("eval_select")) return;

	if (!interaction.member.roles.cache.has(MANAGER_ROLE)) {
		interaction.reply({
			embeds: [
				embeds.error(
					"You aren't a Gauntlet Manager and therefore cannot evaluate a game",
				),
			],
			ephemeral: true,
		});
		return;
	}

	const { firstPlayer, secondPlayer } = /** @type { Duel } */ (
		await db.get(`${interaction.guildId}.duels.${interaction.channelId}`)
	);

	const winner = interaction.values[0].split("-")[0];
	const loser = winner === firstPlayer ? secondPlayer : firstPlayer;

	await db.set(
		`${interaction.guildId}.duels.${interaction.channelId}.winner`,
		winner,
	);
	await db.set(
		`${interaction.guildId}.duels.${interaction.channelId}.loser`,
		loser,
	);

	const embed = new EmbedBuilder()
		.setDescription("Was it a sweep?")
		.setColor(0xffffff);
	const yesButton = new ButtonBuilder()
		.setCustomId(`eval_confirm-yes`)
		.setLabel("Yes")
		.setStyle(ButtonStyle.Primary);
	const noButton = new ButtonBuilder()
		.setCustomId(`eval_confirm-no`)
		.setLabel("No")
		.setStyle(ButtonStyle.Secondary);

	const selectRow = new ActionRowBuilder().addComponents(yesButton, noButton);

	await interaction.reply({ embeds: [embed], components: [selectRow] });

	await interaction.message.edit({
		components: [],
		embeds: [
			new EmbedBuilder()
				.setColor(0xffffff)
				.setDescription(
					`Selected <@${interaction.values[0].split("-")[0]}> as winner`,
				),
		],
	});

	return true;
};
