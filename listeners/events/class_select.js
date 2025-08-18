import { ActionRowBuilder, Events, StringSelectMenuBuilder } from "discord.js";
import { db } from "../../utils/database.js";
import * as embeds from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isStringSelectMenu()) return;
	if (!interaction.customId.startsWith("class_select")) return;

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

	const pick = interaction.values[0];

	await db.set(
		`${interaction.guildId}.duels.${interaction.channel?.id}.rounds.first.class`,
		pick,
	);

	await db.push(
		`${interaction.guildId}.duels.${interaction.channel?.id}.classBans`,
		pick,
	);

	const maps = /** @type { Maps } */ (
		(await db.get(`${interaction.guildId}.maps`)) ?? []
	);

	const classMenu = new StringSelectMenuBuilder()
		.setCustomId(`map_select-${interaction.id}`)
		.addOptions(maps.map((m) => ({ label: m, value: m })));

	const actionRow = new ActionRowBuilder().addComponents(classMenu);

	await interaction.editReply({
		content: `Select a Map to play <@${secondPlayer}>`,
		components: [actionRow],
	});

	await interaction.message?.edit({
		content: "",
		embeds: [
			embeds.success(
				`**${pick}** class has been picked to play by <@${interaction.user.id}> (1st round)`,
			),
		],
		components: [],
	});

	return true;
};
