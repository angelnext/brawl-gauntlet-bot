import {
	ChannelType,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { db } from "../../utils/database.js";

export const on = new SlashCommandBuilder()
	.setName("setchannel")
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setDescription("Sets the draft channel")
	.addChannelOption((option) =>
		option
			.setName("channel")
			.setDescription("The channel you want to set as the draft channel")
			.setRequired(true)
			.addChannelTypes(ChannelType.GuildText),
	);

export const run = async (interaction) => {
	const channel = interaction.options.getChannel("channel", true, [
		ChannelType.GuildText,
	]);

	await db.set(`${interaction.guildId}-draft_channel`, channel.id);

	await interaction.reply({
		content: `Set draft channel to <#${channel.id}>`,
		ephemeral: true,
	});

	return true;
};
