import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Events,
} from "discord.js";
import { embeds } from "../../utils/embeds.js";
import { db } from "../../utils/database.js";
import { CLASSES } from "../../utils/consts.js";

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith("random_draft_1v1")) return;

	const [_, first, second, manager] = interaction.customId.split("-");

	if (interaction.user.id !== manager) {
		interaction.reply({
			embeds: [embeds.error("You aren't the manager of this game")],
			ephemeral: true,
		});
		return;
	}

	const maps = (await db.get(`${interaction.guildId}-maps`)) ?? [];

	const [type1, type2, type3] = CLASSES.sort(() => Math.random() - 0.5);
	const [map1, map2, map3] = maps.sort(() => Math.random() - 0.5);

	await db.set(`${interaction.guildId}-${first}-${second}-round1`, {
		type: type1,
		map: map1,
	});

	await db.set(`${interaction.guildId}-${first}-${second}-round2`, {
		type: type2,
		map: map2,
	});

	await db.set(`${interaction.guildId}-${first}-${second}-round3`, {
		type: type3,
		map: map3,
	});

	const button = new ButtonBuilder()
		.setCustomId(`ban_button-${first}-${second}-${interaction.id}`)
		.setLabel("Start the bans")
		.setStyle(ButtonStyle.Danger);

	const buttonActionRow = new ActionRowBuilder().addComponents(button);

	await interaction.reply({
		content: `Press this button to ban brawlers from each class <@${first}>`,
		components: [buttonActionRow],
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
