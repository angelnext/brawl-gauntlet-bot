import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	Events,
} from "discord.js";

export const on = Events.InteractionCreate;

/** @type {BotEvent} */
export const run = async (interaction) => {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith("cancel_draft")) return;

	const embed = new EmbedBuilder()
		.setTitle("Are you sure you want to cancel?")
		.setColor(0xffffff);

	const yesButton = new ButtonBuilder()
		.setCustomId(`cancel_proceed-${interaction.id}`)
		.setLabel("Yes, Cancel Game")
		.setStyle(ButtonStyle.Danger);

	const selectRow = /** @type {ActionRowBuilder<ButtonBuilder>} */ (
		new ActionRowBuilder().addComponents(yesButton)
	);

	await interaction.reply({ embeds: [embed], components: [selectRow] });
};
