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

	const [_, draftee1, draftee2] = interaction.customId.split("-");

	if (interaction.user.id !== draftee2) {
		await interaction.reply({
			content: `Only <@${draftee2}> can select this`,
			ephemeral: true,
		});
		return;
	}

	const class_bans = await db.get(
		`${interaction.guildId}-${draftee1}-${draftee2}-class_bans`,
	);

	const round1 = await db.get(
		`${interaction.guildId}-${draftee1}-${draftee2}-round1`,
	);
	const round2 = await db.get(
		`${interaction.guildId}-${draftee1}-${draftee2}-round2`,
	);
	const r3 = await db.get(
		`${interaction.guildId}-${draftee1}-${draftee2}-round3`,
	);

	const round3 = {
		type:
			r3?.type ??
			CLASSES.filter((c) => ![...new Set(class_bans)].includes(c))[0] ??
			"",
	};

	const brawlBanModal = new ModalBuilder()
		.setCustomId(`1ban_modal-${draftee1}-${draftee2}-${interaction.id}`)
		.setTitle("Ban a brawler from each class");

	const firstBanTextInput = new TextInputBuilder()
		.setCustomId("first_ban")
		.setLabel(round1.type)
		.setStyle(TextInputStyle.Short);

	const secondBanTextInput = new TextInputBuilder()
		.setCustomId("second_ban")
		.setLabel(round2.type)
		.setStyle(TextInputStyle.Short);

	const thirdBanTextInput = new TextInputBuilder()
		.setCustomId("third_ban")
		.setLabel(round3.type)
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
