import { EmbedBuilder } from "discord.js";
import { db } from "../../utils/database.js";
import { toOrdinal } from "../../utils/numbers.js";

export const run = async (interaction) => {
	await interaction.deferReply();

	const user = interaction.options.getUser("user") ?? interaction.user;

	const elo = (await db.get(`${interaction.guildId}-elo.${user.id}`)) ?? 0;

	const playedGames =
		(await db.get(`${interaction.guildId}-games_played.${user?.id}`)) || 0;
	const wonGames =
		(await db.get(`${interaction.guildId}-games_won.${user?.id}`)) || 0;

	const totalPlayedGames =
		(await db.get(`${interaction.guildId}-total_games_played.${user?.id}`)) ||
		0;
	const totalWonGames =
		(await db.get(`${interaction.guildId}-total_games_won.${user?.id}`)) || 0;

	const highestELO =
		(await db.get(`${interaction.guildId}-${user.id}-max_elo`)) || 0;

	const all = (await db.get(`${interaction.guildId}-elo`)) ?? {};

	const positionings = (
		await Promise.all(
			Object.entries(all)
				.sort(([, a], [, b]) => b - a)
				.map(async (p) => [
					await interaction.guild.members.fetch(p[0]).catch(() => {}),
					p[1],
				]),
		)
	).filter((p) => !!p[0]);

	const highestPos =
		(await db.get(`${interaction.guildId}-${user.id}-max_position`)) ?? 0;

	const rank =
		elo >= 2000
			? "God <:god:1310729948897476679>"
			: elo >= 1500
				? "<:mythical:1310729943428370512>"
				: elo >= 1000
					? "Legendary <:legendary:1310729946414448740>"
					: elo >= 700
						? "Mythic <:mythic:1310745459735920771>"
						: elo >= 400
							? "Gold <:gold:1310729947618218066>"
							: elo >= 200
								? "Silver <:silver:1310729940760531015>"
								: "Bronze <:bronze:1310729890340929636>";

	const highestRank =
		highestELO >= 2000
			? "God <:god:1310729948897476679>"
			: highestELO >= 1500
				? "Mythical <:mythical:1310729943428370512>"
				: highestELO >= 1000
					? "Legendary <:legendary:1310729946414448740>"
					: highestELO >= 700
						? "Mythic <:mythic:1310745459735920771>"
						: highestELO >= 400
							? "Gold <:gold:1310729947618218066>"
							: highestELO >= 200
								? "Silver <:silver:1310729940760531015>"
								: "Bronze <:bronze:1310729890340929636>";

	const embed = new EmbedBuilder()
		.setAuthor({
			name: user.username,
			iconURL: user.displayAvatarURL(),
		})
		.setTitle("Season Stats")
		.setThumbnail(user.displayAvatarURL())
		.setColor(0xffffff)
		.setFields(
			{ name: "ELO", value: `${elo}`, inline: true },
			{
				name: "Placement",
				value: toOrdinal(positionings.findIndex(([u]) => u.id === user.id) + 1),
				inline: true,
			},
			{ name: "Rank", value: rank, inline: true },
			{ name: " ", value: " " },
			{ name: "Played Games", value: `${playedGames}`, inline: true },
			{ name: "Won Games", value: `${wonGames}`, inline: true },
			{
				name: "Win Rate",
				value: `${Math.round(
					Number.isNaN((100 * wonGames) / playedGames)
						? 0
						: (100 * wonGames) / playedGames,
				)}%`,
				inline: true,
			},
		);

	const embed2 = new EmbedBuilder()
		.setTitle("Career Stats")
		.setColor(0xffffff)
		.setTimestamp(new Date())
		.setFields(
			{ name: "Highest ELO", value: `${highestELO}`, inline: true },
			{
				name: "Highest Placement",
				value: toOrdinal(highestPos),
				inline: true,
			},
			{ name: "Highest Rank", value: highestRank, inline: true },
			{ name: " ", value: " " },
			{
				name: "Semi Finals Appearances",
				value: `${
					(await db.get(`${interaction.guildId}-${user.id}-a_semis`)) || 0
				}`,
				inline: true,
			},
			{
				name: "Finals Appearances",
				value: `${
					(await db.get(`${interaction.guildId}-${user.id}-a_finals`)) || 0
				}`,
				inline: true,
			},
			{
				name: "Won Tournaments",
				value: `${
					(await db.get(`${interaction.guildId}-${user.id}-a_winner`)) || 0
				}`,
				inline: true,
			},
			{ name: " ", value: " " },
			{
				name: "Total Played Games",
				value: `${totalPlayedGames}`,
				inline: true,
			},
			{ name: "Total Won Games", value: `${totalWonGames}`, inline: true },
			{
				name: "Total Win Rate",
				value: `${Math.round(
					Number.isNaN((100 * totalWonGames) / totalPlayedGames)
						? 0
						: (100 * totalWonGames) / totalPlayedGames,
				)}%`,
				inline: true,
			},
		);

	await interaction.editReply({ embeds: [embed, embed2] });

	return true;
};
