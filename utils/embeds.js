import { EmbedBuilder } from "discord.js";

export const embeds = {
	success: (message) =>
		new EmbedBuilder().setDescription(`${message}`).setColor(0xffffff),
	error: (message) =>
		new EmbedBuilder()
			.setDescription(`:no_entry: ${message}`)
			.setColor(0xffffff),
};
