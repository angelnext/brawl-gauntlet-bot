import {
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
	Events,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import * as embeds from "../../utils/embeds.js";
import { db } from "../../utils/database.js";
import { MANAGER_ROLE } from "../../utils/consts.js";

export const on = Events.InteractionCreate;

/** @type {ButtonEvent} */
export const run = async (interaction) => {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith("eval_button")) return;

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

	const d1 = await interaction.guild?.members.fetch(firstPlayer);
	const d2 = await interaction.guild?.members.fetch(secondPlayer);

	const embed = new EmbedBuilder()
		.setDescription("Select Winner")
		.setColor(0xffffff);
	const select = new StringSelectMenuBuilder()
		.setCustomId(`eval_select-${interaction.id}`)
		.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel(d1?.user.username || "First Player")
				.setValue(`${firstPlayer}-${interaction.id}`),
			new StringSelectMenuOptionBuilder()
				.setLabel(d2?.user.username || "Second Player")
				.setValue(`${secondPlayer}-${interaction.id}`),
		);

	const selectRow = new ActionRowBuilder().addComponents(select);

	await interaction.reply({ embeds: [embed], components: [selectRow] });

	const row = interaction.message.components[0];
	row.components = row.components.map((button) =>
		ButtonBuilder.from(button).setDisabled(true),
	);

	await interaction.message.edit({ components: [row] });

	return true;
};
