import { ActionRowBuilder, Events, StringSelectMenuBuilder } from "discord.js";
import { CLASSES } from "../../utils/consts.js";
import { db } from "../../utils/database.js";
import * as embeds from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

/** @type {BotEvent} */
export const run = async (interaction) => {
	if (!interaction.isStringSelectMenu()) return;
	if (!interaction.customId.startsWith("secondban")) return;

	const { firstPlayer, secondPlayer } = /** @type { Duel } */ (
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
	const server = /** @type { Server } */ (
		await db.push(
			`${interaction.guildId}.duels.${interaction.channel?.id}.classBans`,
			ban,
		)
	);
	const classBans =
		server.duels?.[interaction.channel?.id || 0].classBans || [];

	const classMenu = new StringSelectMenuBuilder()
		.setCustomId(`class_select-${interaction.id}`)
		.addOptions(
			CLASSES.filter((c) => ![...new Set(classBans)].includes(c)).map((c) => ({
				label: c,
				value: c,
			})),
		);

	const actionRow = /** @type {ActionRowBuilder<StringSelectMenuBuilder>} */ (
		new ActionRowBuilder().addComponents(classMenu)
	);

	await interaction.editReply({
		content: `Select a Class to play <@${firstPlayer}>`,
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
