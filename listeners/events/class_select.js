import { ActionRowBuilder, Events, StringSelectMenuBuilder } from "discord.js";
import { db } from "../../utils/database.js";
import { embeds } from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isStringSelectMenu()) return;
	if (!interaction.customId.startsWith("class_select")) return;

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
		`${interaction.guildId}-${draftee1}-${draftee2}-round1.type`,
		interaction.values[0],
	);

	await db.push(
		`${interaction.guildId}-${draftee1}-${draftee2}-class_bans`,
		interaction.values[0],
	);

	const maps = (await db.get(`${interaction.guildId}-maps`)) ?? [];

	const classMenu = new StringSelectMenuBuilder()
		.setCustomId(`map_select-${draftee1}-${draftee2}-${interaction.id}`)
		.addOptions(maps.map((m) => ({ label: m, value: m })));

	const actionRow = new ActionRowBuilder().addComponents(classMenu);

	await interaction.editReply({
		content: `Select a Map to play <@${draftee2}>`,
		components: [actionRow],
	});

	await interaction.message?.edit({
		content: "",
		embeds: [
			embeds.success(
				`**${interaction.values[0]}** class has been picked to play by <@${interaction.user.id}> (1st round)`,
			),
		],
		components: [],
	});

	return true;
};
