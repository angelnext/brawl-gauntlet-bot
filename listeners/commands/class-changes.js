import {
	EmbedBuilder,
	PermissionsBitField,
	SlashCommandBuilder,
} from "discord.js";
import { db } from "../../utils/database.js";
import * as embeds from "../../utils/embeds.js";

export const on = new SlashCommandBuilder()
	.setName("class-changes")
	.addSubcommand((subcommand) =>
		subcommand
			.setName("list")
			.setDescription("Lists all of the brawlers with changed classes"),
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName("remove")
			.setDescription(
				"Removes one of the banned brawlers or all of them if you don't pass a name",
			)
			.addStringOption((option) =>
				option.setName("name").setDescription("The name of the brawler"),
			),
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName("add")
			.setDescription(
				"Add one or multiple brawlers to ban separated by commas, example: brawler1,brawler2,brawler3",
			)
			.addStringOption((option) =>
				option
					.setName("brawlers")
					.setDescription("The brawler or brawler you want to ban")
					.setRequired(true),
			),
	)
	.setDescription("Brawler Class Changes Manager");

/** @type { SlashCommand } */
export const run = async (interaction) => {
	const subcommands = {
		list,
		remove,
		add,
	};

	const subcommand = /** @type { keyof subcommands } */ (
		interaction.options.getSubcommand(true)
	);

	return subcommands[subcommand]?.(interaction);
};

/** @type { SlashSubcommand<boolean> } */
const list = async (interaction) => {
	const brawlers = /** @type { ChangedClassBrawlers } */ (
		(await db.get(`${interaction.guildId}.changedClassBrawlers`)) || []
	);

	interaction.reply({
		embeds: [
			new EmbedBuilder()
				.setAuthor({
					name: interaction.guild?.name,
					iconURL: interaction.guild?.iconURL(),
				})
				.setTitle("Brawlers with changed classes")
				.setColor(0xffffff)
				.setTimestamp(new Date())
				.setDescription(
					brawlers?.length !== 0
						? `${brawlers.map((b) => "- ".concat(b)).join("\n")}`
						: "No brawlers found!",
				),
		],
	});

	return true;
};

/** @type { SlashSubcommand<boolean> } */
const remove = async (interaction) => {
	if (
		!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)
	) {
		await interaction.reply({
			embeds: [embeds.error("This command can only be used by Administrators")],
			ephemeral: true,
		});
		return true;
	}

	const brawler = interaction.options.getString("name");

	if (!brawler) {
		await db.delete(`${interaction.guildId}.changedClassBrawlers`);
		await interaction.reply({
			content: "Removed every brawler off the list",
			ephemeral: true,
		});
		return true;
	}

	await db.pull(`${interaction.guildId}.changedClassBrawlers`, brawler);

	await interaction.reply({
		content: `Removed the brawler "${brawler}" off the list`,
		ephemeral: true,
	});

	return true;
};

/** @type { SlashSubcommand<boolean> } */
const add = async (interaction) => {
	if (
		!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)
	) {
		await interaction.reply({
			embeds: [embeds.error("This command can only be used by Administrators")],
			ephemeral: true,
		});
		return true;
	}

	const brawlers = interaction.options.getString("brawlers", true)?.split(",");

	await db.push(`${interaction.guildId}.changedClassBrawlers`, ...brawlers);

	await interaction.reply({
		content: `Added the brawlers ${new Intl.ListFormat("en").format(brawlers)}`,
		ephemeral: true,
	});

	return true;
};
