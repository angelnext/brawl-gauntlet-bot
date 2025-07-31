import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Embed,
	EmbedBuilder,
	Events,
} from "discord.js";
import { embeds } from "../../utils/embeds.js";
import { db } from "../../utils/database.js";
import { CLASSES } from "../../utils/consts.js";

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isModalSubmit()) return;
	if (!interaction.customId.startsWith("1ban_modal")) return;

	const [_, draftee1, draftee2] = interaction.customId.split("-");

	if (interaction.user.id !== draftee2) {
		await interaction.reply({
			content: `Only <@${draftee2}> can select this`,
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

	const maps = (await db.get(`${interaction.guildId}-maps`)) ?? [];
	const map_bans = await db.get(
		`${interaction.guildId}-${draftee1}-${draftee2}-map_bans`,
	);

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
		map: r3?.map ?? maps.filter((m) => ![...new Set(map_bans)].includes(m))[0],
		bans: await db.get(
			`${interaction.guildId}-${draftee1}-${draftee2}-round3.bans`,
		),
	};

	const draftEmbed = new EmbedBuilder()
		.setColor(0xffffff)
		.setTimestamp(new Date())
		.setFields(
			{
				name: "Round 1",
				value: `${round1.type} in ${round1.map} (${round1.bans.join(" and ")} banned)`,
			},
			{
				name: "Round 2",
				value: `${round2.type} in ${round2.map} (${round2.bans.join(" and ")} banned)`,
			},
			{
				name: "Round 3",
				value: `${round3.type} in ${round3.map} (${round3.bans.join(" and ")} banned)`,
			},
		);

	const evalButton = new ButtonBuilder()
		.setCustomId(`eval_button-${draftee1}-${draftee2}-${interaction.id}`)
		.setLabel("Evaluate Game")
		.setStyle(ButtonStyle.Danger);

	const cancelButton = new ButtonBuilder()
		.setCustomId(`cancel_draft-${draftee1}-${draftee2}-${interaction.id}`)
		.setLabel("Cancel Game")
		.setStyle(ButtonStyle.Danger);

	const evalRow = new ActionRowBuilder().addComponents(
		evalButton,
		cancelButton,
	);

	await interaction.editReply({ embeds: [draftEmbed], components: [evalRow] });

	const msg = await interaction.fetchReply();
	msg?.pin();

	await interaction.message.edit({
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
