import { ActionRowBuilder, Events, StringSelectMenuBuilder } from "discord.js";
import { CLASSES } from "../../utils/consts.js";
import { db } from "../../utils/database.js";
import * as embeds from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isStringSelectMenu()) return;
	if (!interaction.customId.startsWith("map_select")) return;

	const { secondPlayer, classBans } = /** @type { Duel } */ (
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

	const pick = interaction.values[0];

	await db.set(
		`${interaction.guildId}.duels.${interaction.channel?.id}.rounds.first.map`,
		pick,
	);

	await db.push(
		`${interaction.guildId}.duels.${interaction.channel?.id}.mapBans`,
		pick,
	);

	const classMenu = new StringSelectMenuBuilder()
		.setCustomId(`1class_select-${interaction.id}`)
		.addOptions(
			CLASSES.filter((c) => ![...new Set(classBans)].includes(c)).map((c) => ({
				label: c,
				value: c,
			})),
		);

	const actionRow = new ActionRowBuilder().addComponents(classMenu);

	await interaction.editReply({
		content: `Select a Class to play <@${secondPlayer}>`,
		components: [actionRow],
	});

	await interaction.message?.edit({
		content: "",
		embeds: [
			embeds.success(
				`**${pick}** has been picked by <@${interaction.user.id}> for the map (1st round)`,
			),
		],
		components: [],
	});

	return true;
};
