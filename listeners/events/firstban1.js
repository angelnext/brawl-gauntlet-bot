import { ActionRowBuilder, Events, StringSelectMenuBuilder } from "discord.js";
import { CLASSES } from "../../utils/consts.js";
import { db } from "../../utils/database.js";
import * as embeds from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isStringSelectMenu()) return;
	if (!interaction.customId.startsWith("1firstban")) return;

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
			`${interaction.guildId}.duels.${interaction.channel?.id}.classBans`,
			ban,
		)
	);
	const classBans = server.duels?.[interaction.channelId].classBans || [];

	const classMenu = new StringSelectMenuBuilder()
		.setCustomId(`1secondban-${interaction.id}`)
		.addOptions(
			CLASSES.filter((c) => ![...new Set(classBans)].includes(c)).map((c) => ({
				label: c,
				value: c,
			})),
		);

	const actionRow = new ActionRowBuilder().addComponents(classMenu);

	await interaction.editReply({
		content: `Select Class to Ban <@${secondPlayer}>`,
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
