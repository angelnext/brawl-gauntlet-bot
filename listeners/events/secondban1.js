import { ActionRowBuilder, Events, StringSelectMenuBuilder } from "discord.js";
import { db } from "../../utils/database.js";
import { embeds } from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isStringSelectMenu()) return;
	if (!interaction.customId.startsWith("1secondban")) return;

	const [_, draftee1, draftee2] = interaction.customId.split("-");

	if (interaction.user.id !== draftee2) {
		await interaction.reply({
			content: `Only <@${draftee2}> can select this`,
			ephemeral: true,
		});
		return;
	}

	await interaction.deferReply();

	await db.push(
		`${interaction.guildId}-${draftee1}-${draftee2}-class_bans`,
		interaction.values[0],
	);

	const maps = (await db.get(`${interaction.guildId}-maps`)) ?? [];
	const map_bans = await db.get(
		`${interaction.guildId}-${draftee1}-${draftee2}-map_bans`,
	);

	const mapMenu = new StringSelectMenuBuilder()
		.setCustomId(`mapban-${draftee1}-${draftee2}-${interaction.id}`)
		.addOptions(
			maps
				.filter((m) => ![...new Set(map_bans)].includes(m))
				.map((m) => ({ label: m, value: m })),
		);

	const actionRow = new ActionRowBuilder().addComponents(mapMenu);

	await interaction.editReply({
		content: `Select Map to Ban <@${draftee1}>`,
		components: [actionRow],
	});

	await interaction.message?.edit({
		content: "",
		embeds: [
			embeds.success(
				`**${interaction.values[0]}** class has been banned by <@${interaction.user.id}>`,
			),
		],
		components: [],
	});

	return true;
};
