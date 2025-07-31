import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Events,
} from "discord.js";
import { embeds } from "../../utils/embeds.js";
import { db } from "../../utils/database.js";

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isModalSubmit()) return;
	if (!interaction.customId.startsWith("ban_modal")) return;

	const [_, draftee1, draftee2] = interaction.customId.split("-");

	if (interaction.user.id !== draftee1) {
		await interaction.reply({
			content: `Only <@${draftee1}> can select this`,
			ephemeral: true,
		});
		return;
	}

	await interaction.deferReply();

	const ban1 = interaction.fields.getTextInputValue("first_ban");
	const ban2 = interaction.fields.getTextInputValue("second_ban");
	const ban3 = interaction.fields.getTextInputValue("third_ban");

	await db.push(
		`${interaction.guildId}-${draftee1}-${draftee2}-round1.bans`,
		ban1,
	);

	await db.push(
		`${interaction.guildId}-${draftee1}-${draftee2}-round2.bans`,
		ban2,
	);

	await db.push(
		`${interaction.guildId}-${draftee1}-${draftee2}-round3.bans`,
		ban3,
	);

	const button = new ButtonBuilder()
		.setCustomId(
			`1ban_button-${draftee1}-${draftee2}-${interaction.message.id}`,
		)
		.setLabel("Start the bans")
		.setStyle(ButtonStyle.Danger);

	const actionRow = new ActionRowBuilder().addComponents(button);

	await interaction.editReply({
		content: `Press this button to ban brawlers from each class <@${draftee2}>`,
		components: [actionRow],
	});

	await interaction.message?.edit({
		content: "",
		embeds: [
			embeds.success(
				`<@${interaction.user.id}> has banned ${ban1}, ${ban2} and ${ban3}`,
			),
		],
		components: [],
	});

	return true;
};
