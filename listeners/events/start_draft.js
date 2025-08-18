import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	Events,
} from "discord.js";
import * as embeds from "../../utils/embeds.js";
import { db } from "../../utils/database.js";
import { MANAGER_ROLE } from "../../utils/consts.js";
import { setAllButtonsToDisabled } from "../../utils/buttons.js";

export const on = Events.InteractionCreate;

/** @type { ButtonEvent } */
export const run = async (interaction) => {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith("start_draft")) return;

	if (!interaction.member.roles.cache.has(MANAGER_ROLE)) {
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
	const firstPlayer = draftees[randomNumber];
	const secondPlayer = draftees[+!randomNumber];

	await db.set(
		`${interaction.guildId}.duels.${interaction.channel?.id}`,
		/** @type { Duel } */ ({
			firstPlayer,
			secondPlayer,
			manager: interaction.user.id,
		}),
	);

	await interaction.reply({
		content: `<@${firstPlayer}> has been chosen as the first player, <@${secondPlayer}> is the second player. <@${interaction.user.id}> will be managing this duel.`,
	});

	const embed = new EmbedBuilder()
		.setTitle("Select Gauntlet Mode")
		.setDescription(
			"Between the 2 players, decide on a gauntlet mode and then tell the manager so he selects it for you.",
		)
		.setColor(0xffffff)
		.setThumbnail(interaction.client.user.displayAvatarURL());

	const fullDraft1v1Button = new ButtonBuilder()
		.setCustomId(`full_draft_1v1-${interaction.id}`)
		.setLabel("1v1 (Full Draft)")
		.setStyle(ButtonStyle.Secondary);

	const randomDraft1v1Button = new ButtonBuilder()
		.setCustomId(`random_draft_1v1-${interaction.id}`)
		.setLabel("1v1 (Random Draft)")
		.setStyle(ButtonStyle.Secondary);

	const cancelButton = new ButtonBuilder()
		.setCustomId(`cancel_draft-${interaction.id}`)
		.setLabel("Cancel Game")
		.setStyle(ButtonStyle.Danger);

	const buttons = new ActionRowBuilder().addComponents(
		fullDraft1v1Button,
		randomDraft1v1Button,
		cancelButton,
	);

	await interaction.followUp({ embeds: [embed], components: [buttons] });

	const row = setAllButtonsToDisabled(interaction.message.components[0]);

	await interaction.message.edit({ components: [row] });

	return true;
};
