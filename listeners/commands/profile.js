import { EmbedBuilder } from "discord.js";
import { db } from "../../utils/database.js";
import { toOrdinal } from "../../utils/numbers.js";
import { getRankText } from "../../utils/ranks.js";

/** @type { SlashCommand } */
export const run = async (interaction) => {
	await interaction.deferReply();

	const user = interaction.options.getUser("user") ?? interaction.user;

	const users = /** @type { Users } */ (
		(await db.get(`${interaction.guildId}.users`)) || {}
	);

	const {
		elo = 0,
		highestElo = 0,
		highestPosition = 0,
		seasonGames,
		totalGames,
		tournament,
	} = users?.[user.id] || {};

	const positionings = (
		await Promise.all(
			Object.entries(users)
				.sort((a, b) => {
					const eloA = a[1].elo || 0;
					const eloB = b[1].elo || 0;

					return eloB - eloA;
				})
				.map(async (p) => ({
					member: await interaction.guild?.members
						.fetch(p[0])
						.catch(() => null),
					user: p[1],
				})),
		)
	).filter((p) => !!p.member);

	const rank = getRankText(elo);
	const highestRank = getRankText(highestElo);

	const seasonWinrate =
		(100 * (seasonGames?.won || 0)) / (seasonGames?.played || 0);
	const totalWinrate =
		(100 * (totalGames?.won || 0)) / (totalGames?.played || 0);

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
				value: toOrdinal(
					positionings.findIndex(({ member }) => member?.id === user.id) + 1,
				),
				inline: true,
			},
			{ name: "Rank", value: rank, inline: true },
			{ name: " ", value: " " },
			{
				name: "Played Games",
				value: `${seasonGames?.played || 0}`,
				inline: true,
			},
			{ name: "Won Games", value: `${seasonGames?.won || 0}`, inline: true },
			{
				name: "Win Rate",
				value: `${Math.round(Number.isNaN(seasonWinrate) ? 0 : seasonWinrate)}%`,
				inline: true,
			},
		);

	const embed2 = new EmbedBuilder()
		.setTitle("Career Stats")
		.setColor(0xffffff)
		.setTimestamp(new Date())
		.setFields(
			{ name: "Highest ELO", value: `${highestElo}`, inline: true },
			{
				name: "Highest Placement",
				value: toOrdinal(highestPosition),
				inline: true,
			},
			{ name: "Highest Rank", value: highestRank, inline: true },
			{ name: " ", value: " " },
			{
				name: "Semi Finals Appearances",
				value: `${tournament?.semifinals || 0}`,
				inline: true,
			},
			{
				name: "Finals Appearances",
				value: `${tournament?.finals || 0}`,
				inline: true,
			},
			{
				name: "Won Tournaments",
				value: `${tournament?.semifinals || 0}`,
				inline: true,
			},
			{ name: " ", value: " " },
			{
				name: "Total Played Games",
				value: `${totalGames?.played || 0}`,
				inline: true,
			},
			{
				name: "Total Won Games",
				value: `${totalGames?.won || 0}`,
				inline: true,
			},
			{
				name: "Total Win Rate",
				value: `${Math.round(Number.isNaN(totalWinrate) ? 0 : totalWinrate)}%`,
				inline: true,
			},
		);

	await interaction.editReply({ embeds: [embed, embed2] });

	return true;
};
