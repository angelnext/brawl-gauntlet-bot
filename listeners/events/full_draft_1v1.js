import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonComponent,
	Events,
	StringSelectMenuBuilder,
} from "discord.js";
import { embeds } from "../../utils/embeds.js";
import { CLASSES } from "../../utils/consts.js";

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith("full_draft_1v1")) return;

	const [_, first, second, manager] = interaction.customId.split("-");

	if (interaction.user.id !== manager) {
		interaction.reply({
			embeds: [embeds.error("You aren't the manager of this game")],
			ephemeral: true,
		});
		return;
	}

	const classMenu = new StringSelectMenuBuilder()
		.setCustomId(`firstban-${first}-${second}-${interaction.id}`)
		.addOptions(CLASSES.map((c) => ({ label: c, value: c })));

	const selectMenuActionRow = new ActionRowBuilder().addComponents(classMenu);

	await interaction.reply({
		content: `Select Class to Ban <@${first}>`,
		components: [selectMenuActionRow],
	});

	const row = interaction.message.components[0];
	row.components = row.components.map((button) => {
		const b = ButtonBuilder.from(button);
		if (b.data.custom_id.startsWith("cancel_draft")) return b;
		return b.setDisabled(true);
	});

	await interaction.message.edit({ components: [row] });

	return true;
};
