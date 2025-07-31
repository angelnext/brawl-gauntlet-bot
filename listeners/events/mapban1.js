import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Events,
} from "discord.js";
import { db } from "../../utils/database.js";
import { embeds } from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isStringSelectMenu()) return;
	if (!interaction.customId.startsWith("1mapban")) return;

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
		`${interaction.guildId}-${draftee1}-${draftee2}-map_bans`,
		interaction.values[0],
	);

	const button = new ButtonBuilder()
		.setCustomId(`ban_button-${draftee1}-${draftee2}-${interaction.id}`)
		.setLabel("Start the bans")
		.setStyle(ButtonStyle.Danger);

	const actionRow = new ActionRowBuilder().addComponents(button);

	await interaction.editReply({
		content: `Press this button to ban brawlers from each class <@${draftee1}>`,
		components: [actionRow],
	});

	await interaction.message?.edit({
		content: "",
		embeds: [
			embeds.success(
				`The map **${interaction.values[0]}** has been banned by <@${interaction.user.id}>`,
			),
		],
		components: [],
	});

	return true;
};
