import { ActionRowBuilder, Events, StringSelectMenuBuilder } from "discord.js";
import { db } from "../../utils/database.js";
import * as embeds from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

/** @type {BotEvent} */
export const run = async (interaction) => {
	if (!interaction.isStringSelectMenu()) return;
	if (!interaction.customId.startsWith("1secondban")) return;

	const { firstPlayer, secondPlayer, mapBans } = /** @type { Duel } */ (
		await db.get(`${interaction.guildId}.duels.${interaction.channel?.id}`)
	);

	if (interaction.user.id !== secondPlayer) {
		await interaction.reply({
			content: `Only <@${secondPlayer}> can select this`,
			ephemeral: true,
		});
		return;
	}

	await interaction.deferReply();

	const ban = interaction.values[0];
	await db.push(
		`${interaction.guildId}.duels.${interaction.channel?.id}.classBans`,
		ban,
	);

	const maps = /** @type { Maps } */ (
		(await db.get(`${interaction.guildId}.maps`)) ?? []
	);

	const mapMenu = new StringSelectMenuBuilder()
		.setCustomId(`mapban-${interaction.id}`)
		.addOptions(
			maps
				.filter((m) => ![...new Set(mapBans)].includes(m))
				.map((m) => ({ label: m, value: m })),
		);

	const actionRow = /** @type {ActionRowBuilder<StringSelectMenuBuilder>} */ (
		new ActionRowBuilder().addComponents(mapMenu)
	);

	await interaction.editReply({
		content: `Select Map to Ban <@${firstPlayer}>`,
		components: [actionRow],
	});

	await interaction.message?.edit({
		content: "",
		embeds: [
			embeds.success(
				`**${ban}** class has been banned by <@${interaction.user.id}>`,
			),
		],
		components: [],
	});

	return true;
};
