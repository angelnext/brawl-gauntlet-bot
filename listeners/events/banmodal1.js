import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Embed,
	EmbedBuilder,
	Events,
} from "discord.js";
import * as embeds from "../../utils/embeds.js";
import { db } from "../../utils/database.js";
import { CLASSES } from "../../utils/consts.js";

export const on = Events.InteractionCreate;

/** @type { ModalEvent } */
export const run = async (interaction) => {
	if (!interaction.isModalSubmit()) return;
	if (!interaction.customId.startsWith("1ban_modal")) return;

	const { secondPlayer, classBans, mapBans } = /** @type { Duel } */ (
		await db.get(`${interaction.guildId}.duels.${interaction.channel?.id}`)
	);

	if (interaction.user.id !== secondPlayer) {
		await interaction.reply({
			content: `Only <@${secondPlayer}> can select this`,
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

	const server = /** @type { Server } */ (
		await db.push(
			`${interaction.guildId}.duels.${interaction.channel?.id}.rounds.third.bans`,
			ban3,
		)
	);

	const maps = /** @type { Maps } */ (
		(await db.get(`${interaction.guildId}.maps`)) ?? []
	);

	const { rounds } = server.duels?.[interaction.channel?.id] || {};

	const thirdRound = /** @type { Round } */ ({
		class:
			rounds?.third?.class ??
			CLASSES.filter((c) => ![...new Set(classBans)].includes(c))[0] ??
			"",
		map:
			rounds?.third?.map ??
			maps.filter((m) => ![...new Set(mapBans)].includes(m))[0],
		bans: rounds?.third?.bans,
	});

	const draftEmbed = new EmbedBuilder()
		.setColor(0xffffff)
		.setTimestamp(new Date())
		.setFields(
			{
				name: "Round 1",
				value: `${rounds?.first?.class} in ${rounds?.first?.map} (${rounds?.first?.bans?.join(" and ")} banned)`,
			},
			{
				name: "Round 2",
				value: `${rounds?.second?.class} in ${rounds?.second?.map} (${rounds?.second?.bans?.join(" and ")} banned)`,
			},
			{
				name: "Round 3",
				value: `${thirdRound.class} in ${thirdRound.map} (${thirdRound.bans?.join(" and ")} banned)`,
			},
		);

	const evalButton = new ButtonBuilder()
		.setCustomId(`eval_button-${interaction.id}`)
		.setLabel("Evaluate Game")
		.setStyle(ButtonStyle.Danger);

	const cancelButton = new ButtonBuilder()
		.setCustomId(`cancel_draft-${interaction.id}`)
		.setLabel("Cancel Game")
		.setStyle(ButtonStyle.Danger);

	const evalRow = new ActionRowBuilder().addComponents(
		evalButton,
		cancelButton,
	);

	await interaction.editReply({ embeds: [draftEmbed], components: [evalRow] });

	const msg = await interaction.fetchReply();

	await interaction.message?.edit({
		content: "",
		embeds: [
			embeds.success(
				`<@${interaction.user.id}> has banned ${ban1}, ${ban2} and ${ban3}`,
			),
		],
		components: [],
	});

	await msg?.pin();

	return true;
};
