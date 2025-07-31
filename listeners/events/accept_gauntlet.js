import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	Events,
} from "discord.js";
import { db } from "../../utils/database.js";
import { embeds } from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith("accept_gauntlet")) return;

	const [_, userId, specific] = interaction.customId.split("-");

	if (interaction.user.id === userId) {
		interaction.reply({
			embeds: [embeds.error("You can't play yourself!")],
			ephemeral: true,
		});
		return;
	}

	if (specific !== undefined && interaction.user.id !== specific) {
		interaction.reply({
			embeds: [embeds.error(`Only <@${specific}> can accept this challenge`)],
			ephemeral: true,
		});
		return;
	}

	interaction.deferUpdate();

	const user = await interaction.guild.members.fetch(userId);

	const channelId = await db.get(`${interaction.guildId}-draft_channel`);

	const channel = await interaction.guild?.channels.fetch(channelId);

	const thread = await channel.threads.create({
		name: `${user.user.username}-vs-${interaction.user.username}`,
		reason: `A duel between ${user.user.username} vs ${interaction.user.username} will take place in this thread`,
	});

	const embed = new EmbedBuilder()
		.setTitle("Awaiting Manager")
		.setDescription(
			`Your gauntlet will start shortly.\nPlease wait for a manager to manage your game and ping one if needed.`,
		)
		.setThumbnail(interaction.client.user.displayAvatarURL())
		.setColor(0xffffff);

	const draftButton = new ButtonBuilder()
		.setCustomId(`start_draft-${user.user.id}-${interaction.user.id}`)
		.setLabel("Manage Game")
		.setStyle(ButtonStyle.Success);

	const draftRow = new ActionRowBuilder().addComponents(draftButton);

	await thread.send(`${user.user} vs ${interaction.user}`);
	await thread.send({ embeds: [embed], components: [draftRow] });

	const row = interaction.message.components[0];
	row.components = row.components.map((button) =>
		ButtonBuilder.from(button).setDisabled(true),
	);

	await interaction.message.edit({ components: [row] });

	await db.set(`${interaction.guildId}-${user.id}-in_game`, true);
	await db.set(`${interaction.guildId}-${interaction.user.id}-in_game`, true);

	return true;
};
