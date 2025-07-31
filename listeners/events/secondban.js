import { ActionRowBuilder, Events, StringSelectMenuBuilder } from "discord.js";
import { CLASSES } from "../../utils/consts.js";
import { db } from "../../utils/database.js";
import { embeds } from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isStringSelectMenu()) return;
	if (!interaction.customId.startsWith("secondban")) return;

	const [_, draftee1, draftee2] = interaction.customId.split("-");

	if (interaction.user.id !== draftee2) {
		await interaction.reply({
			content: `Only <@${draftee2}> can select this`,
			ephemeral: true,
		});
		return;
	}

	await interaction.deferReply();

	const class_bans = await db.push(
		`${interaction.guildId}-${draftee1}-${draftee2}-class_bans`,
		interaction.values[0],
	);

	const classMenu = new StringSelectMenuBuilder()
		.setCustomId(`class_select-${draftee1}-${draftee2}-${interaction.id}`)
		.addOptions(
			CLASSES.filter((c) => ![...new Set(class_bans)].includes(c)).map((c) => ({
				label: c,
				value: c,
			})),
		);

	const actionRow = new ActionRowBuilder().addComponents(classMenu);

	await interaction.editReply({
		content: `Select a Class to play <@${draftee1}>`,
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
