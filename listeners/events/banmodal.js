import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Events,
} from "discord.js";
import { db } from "../../utils/database.js";
import * as embeds from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

/** @type {BotEvent} */
export const run = async (interaction) => {
	if (!interaction.isModalSubmit()) return;
	if (!interaction.customId.startsWith("ban_modal")) return;

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

	const ban1 = interaction.fields.getTextInputValue("first_ban");
	const ban2 = interaction.fields.getTextInputValue("second_ban");
	const ban3 = interaction.fields.getTextInputValue("third_ban");

	await db.push(
		`${interaction.guildId}.duels.${interaction.channel?.id}.rounds.first.bans`,
		ban1,
	);

	await db.push(
		`${interaction.guildId}.duels.${interaction.channel?.id}.rounds.second.bans`,
		ban2,
	);

	await db.push(
		`${interaction.guildId}.duels.${interaction.channel?.id}.rounds.third.bans`,
		ban3,
	);

	const button = new ButtonBuilder()
		.setCustomId(`1ban_button-${interaction.id}`)
		.setLabel("Start the bans")
		.setStyle(ButtonStyle.Danger);

	const actionRow = /** @type {ActionRowBuilder<ButtonBuilder>} */ (
		new ActionRowBuilder().addComponents(button)
	);

	await interaction.editReply({
		content: `Press this button to ban brawlers from each class <@${secondPlayer}>`,
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
