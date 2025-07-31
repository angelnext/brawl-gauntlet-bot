import { ActionRowBuilder, Events, StringSelectMenuBuilder } from "discord.js";
import { CLASSES } from "../../utils/consts.js";
import { db } from "../../utils/database.js";
import { embeds } from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isStringSelectMenu()) return;
	if (!interaction.customId.startsWith("1map_select")) return;

	const [_, draftee1, draftee2] = interaction.customId.split("-");

	if (interaction.user.id !== draftee1) {
		await interaction.reply({
			content: `Only <@${draftee1}> can select this`,
			ephemeral: true,
		});
		return;
	}

	await interaction.deferReply();

	await db.set(
		`${interaction.guildId}-${draftee1}-${draftee2}-round2.map`,
		interaction.values[0],
	);

	await db.push(
		`${interaction.guildId}-${draftee1}-${draftee2}-map_bans`,
		interaction.values[0],
	);

	const class_bans = await db.get(
		`${interaction.guildId}-${draftee1}-${draftee2}-class_bans`,
	);

	const classMenu = new StringSelectMenuBuilder()
		.setCustomId(`1firstban-${draftee1}-${draftee2}-${interaction.id}`)
		.addOptions(
			CLASSES.filter((c) => ![...new Set(class_bans)].includes(c)).map((c) => ({
				label: c,
				value: c,
			})),
		);

	const actionRow = new ActionRowBuilder().addComponents(classMenu);

	await interaction.editReply({
		content: `Select Class to Ban <@${draftee1}>`,
		components: [actionRow],
	});

	await interaction.message?.edit({
		content: "",
		embeds: [
			embeds.success(
				`**${interaction.values[0]}** has been picked by <@${interaction.user.id}> for the map (2nd round)`,
			),
		],
		components: [],
	});

	return true;
};
