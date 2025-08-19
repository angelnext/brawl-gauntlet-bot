import { ActionRowBuilder, Events, StringSelectMenuBuilder } from "discord.js";
import { db } from "../../utils/database.js";
import * as embeds from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

/** @type {BotEvent} */
export const run = async (interaction) => {
	if (!interaction.isStringSelectMenu()) return;
	if (!interaction.customId.startsWith("mapban")) return;

	const { firstPlayer, secondPlayer } = /** @type { Duel } */ (
		await db.get(`${interaction.guildId}.duels.${interaction.channel?.id}`)
	);

	if (interaction.user.id !== firstPlayer) {
		await interaction.reply({
			content: `Only <@${firstPlayer}> can select this`,
			ephemeral: true,
		});
		return;
	}

	await interaction.deferReply();

	const ban = interaction.values[0];
	const server = /** @type { Server } */ (
		await db.push(
			`${interaction.guildId}.duels.${interaction.channel?.id}.mapBans`,
			ban,
		)
	);
	const mapBans = server.duels?.[interaction.channel?.id || ""].mapBans || [];

	const maps = /** @type { Maps } */ (
		(await db.get(`${interaction.guildId}.maps`)) ?? []
	);

	const mapMenu = new StringSelectMenuBuilder()
		.setCustomId(`1mapban-${interaction.id}`)
		.addOptions(
			maps
				.filter((m) => ![...new Set(mapBans)].includes(m))
				.map((m) => ({ label: m, value: m })),
		);

	const actionRow = /** @type {ActionRowBuilder<StringSelectMenuBuilder>} */ (
		new ActionRowBuilder().addComponents(mapMenu)
	);

	await interaction.editReply({
		content: `Select Map to Ban <@${secondPlayer}>`,
		components: [actionRow],
	});

	await interaction.message?.edit({
		content: "",
		embeds: [
			embeds.success(
				`The map **${ban}** has been banned by <@${interaction.user.id}>`,
			),
		],
		components: [],
	});

	return true;
};
