import {
	ActionRowBuilder,
	Events,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { CLASSES } from "../../utils/consts.js";
import { db } from "../../utils/database.js";

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith("1ban_button")) return;

	const { secondPlayer, classBans, rounds } = /** @type { Duel } */ (
		await db.get(`${interaction.guildId}.duels.${interaction.channel?.id}`)
	);

	if (interaction.user.id !== secondPlayer) {
		await interaction.reply({
			content: `Only <@${secondPlayer}> can select this`,
			ephemeral: true,
		});
		return;
	}

	const thirdRoundClass =
		rounds?.third?.class ??
		CLASSES.filter((c) => ![...new Set(classBans)].includes(c))[0] ??
		"";

	const brawlBanModal = new ModalBuilder()
		.setCustomId(`1ban_modal-${interaction.id}`)
		.setTitle("Ban a brawler from each class");

	const firstBanTextInput = new TextInputBuilder()
		.setCustomId("first_ban")
		.setLabel(rounds?.first?.class || "")
		.setStyle(TextInputStyle.Short);

	const secondBanTextInput = new TextInputBuilder()
		.setCustomId("second_ban")
		.setLabel(rounds?.second?.class || "")
		.setStyle(TextInputStyle.Short);

	const thirdBanTextInput = new TextInputBuilder()
		.setCustomId("third_ban")
		.setLabel(thirdRoundClass)
		.setStyle(TextInputStyle.Short);

	const firstBanActionRow = new ActionRowBuilder().addComponents(
		firstBanTextInput,
	);
	const secondBanActionRow = new ActionRowBuilder().addComponents(
		secondBanTextInput,
	);
	const thirdBanActionRow = new ActionRowBuilder().addComponents(
		thirdBanTextInput,
	);

	brawlBanModal.addComponents(
		firstBanActionRow,
		secondBanActionRow,
		thirdBanActionRow,
	);

	await interaction.showModal(brawlBanModal);

	return true;
};
