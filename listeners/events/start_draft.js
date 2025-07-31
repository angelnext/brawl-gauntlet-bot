import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	Events,
} from "discord.js";
import { embeds } from "../../utils/embeds.js";
import { db } from "../../utils/database.js";

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith("start_draft")) return;

	if (!interaction.member.roles.cache.has("1262159706047119401")) {
		interaction.reply({
			embeds: [
				embeds.error(
					"You aren't a Gauntlet Manager and therefore cannot manage a game",
				),
			],
			ephemeral: true,
		});
		return;
	}

	const [_, draftee1, draftee2] = interaction.customId.split("-");

	const draftees = [draftee1, draftee2];

	const randomNumber = Math.round(Math.random());
	const first = draftees[randomNumber];
	const second = draftees[+!randomNumber];

	await db.delete(`${interaction.guildId}-${first}-${second}-class_bans`);
	await db.delete(`${interaction.guildId}-${first}-${second}-map_bans`);
	await db.delete(`${interaction.guildId}-${first}-${second}-round1`);
	await db.delete(`${interaction.guildId}-${first}-${second}-round2`);
	await db.delete(`${interaction.guildId}-${first}-${second}-round3`);

	await interaction.reply({
		content: `<@${first}> has been chosen as Draftee 1, <@${second}> is Draftee 2. <@${interaction.user.id}> will be managing this duel.`,
	});

	const embed = new EmbedBuilder()
		.setTitle("Select Gauntlet Mode")
		.setDescription(
			"Between the 2 players decide run a gauntlet mode and then tell the manager so he selects it for you",
		)
		.setColor(0xffffff)
		.setThumbnail(interaction.client.user.displayAvatarURL());

	const fullDraft1v1Button = new ButtonBuilder()
		.setCustomId(`full_draft_1v1-${first}-${second}-${interaction.user.id}`)
		.setLabel("1v1 (Full Draft)")
		.setStyle(ButtonStyle.Secondary);

	const randomDraft1v1Button = new ButtonBuilder()
		.setCustomId(`random_draft_1v1-${first}-${second}-${interaction.user.id}`)
		.setLabel("1v1 (Random Draft)")
		.setStyle(ButtonStyle.Secondary);

	const cancelButton = new ButtonBuilder()
		.setCustomId(`cancel_draft-${first}-${second}-${interaction.user.id}`)
		.setLabel("Cancel Game")
		.setStyle(ButtonStyle.Danger);

	const buttons = new ActionRowBuilder().addComponents(
		fullDraft1v1Button,
		randomDraft1v1Button,
		cancelButton,
	);

	await interaction.followUp({ embeds: [embed], components: [buttons] });

	const row = interaction.message.components[0];
	row.components = row.components.map((button) =>
		ButtonBuilder.from(button).setDisabled(true),
	);

	await interaction.message.edit({ components: [row] });

	return true;
};
