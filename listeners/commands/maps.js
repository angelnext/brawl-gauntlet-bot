import { join } from "node:path";
import {
	AttachmentBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { db } from "../../utils/database.js";
import * as embeds from "../../utils/embeds.js";

export const on = new SlashCommandBuilder()
	.setName("maps")
	.addSubcommand((subcommand) =>
		subcommand.setName("list").setDescription("Lists all of the maps"),
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName("remove")
			.setDescription("Removes one map or all of them if you don't pass a name")
			.addStringOption((option) =>
				option.setName("name").setDescription("The name of the map"),
			),
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName("add")
			.setDescription(
				"Add one or multiple maps separated by commas, example: map1,map2,map3",
			)
			.addStringOption((option) =>
				option
					.setName("maps")
					.setDescription("The map or maps you want to add")
					.setRequired(true),
			),
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName("graphic")
			.setDescription("A visual representation of the maps"),
	)
	.setDescription("Map manager");

/** @type {SlashCommand}  */
export const run = async (interaction) => {
	const subcommands = {
		list,
		remove,
		add,
		graphic,
	};

	const subcommand = /** @type { keyof subcommands } */ (
		interaction.options.getSubcommand(true)
	);

	return subcommands[subcommand]?.(interaction);
};

/** @type {SlashSubcommand<boolean>}  */
const list = async (interaction) => {
	const maps = /** @type {Maps} */ (
		(await db.get(`${interaction.guildId}.maps`)) || []
	);

	interaction.reply({
		content:
			maps?.length !== 0
				? `The current maps in rotation are ${new Intl.ListFormat("en").format(
						maps,
					)}`
				: "No maps in rotation yet",
		ephemeral: true,
	});

	return true;
};

/** @type {SlashSubcommand<boolean>}  */
const remove = async (interaction) => {
	if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
		await interaction.reply({
			embeds: [embeds.error("This command can only be used by Administrators")],
			ephemeral: true,
		});
		return true;
	}

	const map = interaction.options.getString("name");

	if (!map) {
		await db.delete(`${interaction.guildId}.maps`);
		await interaction.reply({
			content: "Removed every map off the rotation",
			ephemeral: true,
		});
		return true;
	}

	await db.pull(`${interaction.guildId}.maps`, map);

	await interaction.reply({
		content: `Removed the map "${map}" off the rotation`,
		ephemeral: true,
	});

	return true;
};

/** @type {SlashSubcommand<boolean>}  */
const add = async (interaction) => {
	if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
		await interaction.reply({
			embeds: [embeds.error("This command can only be used by Administrators")],
			ephemeral: true,
		});
		return true;
	}

	const maps = interaction.options.getString("maps", true)?.split(",");

	const currentMaps = /** @type {Maps} */ (
		(await db.get(`${interaction.guildId}.maps`)) ?? []
	);

	if (currentMaps.length >= 5) {
		await interaction.reply({
			content: "There's can only be 5 maps in rotation",
			ephemeral: true,
		});
		return true;
	}

	await db.push(`${interaction.guildId}.maps`, ...maps);

	await interaction.reply({
		content: `Added the maps ${new Intl.ListFormat("en").format(maps)}`,
		ephemeral: true,
	});

	return true;
};

/** @type {SlashSubcommand<boolean>}  */
const graphic = async (interaction) => {
	const attachment = new AttachmentBuilder(join(process.cwd(), "maps.png"));

	await interaction.reply({ files: [attachment] });

	return true;
};
