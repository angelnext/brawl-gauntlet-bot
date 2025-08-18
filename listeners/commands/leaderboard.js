import { EmbedBuilder } from "discord.js";
import { Pagination } from "pagination.djs";
import { db } from "../../utils/database.js";
import { getRankIcon } from "../../utils/ranks.js";

/** @type { SlashSubcommand<boolean> } */
export const run = async (interaction) => {
	const leaderboards = {
		gauntletLeaderboard,
		gamesPlayedLeaderboard,
		managersLeaderboard,
	};

	const type = /** @type { keyof leaderboards } */ (
		interaction.options.getString("type") || "gauntletLeaderboard"
	);

	await interaction.deferReply();

	await leaderboards[type](interaction, undefined);

	return true;
};

/** @type { SlashOption } */
const gauntletLeaderboard = async (interaction) => {
	const users = /** @type { Users } */ (
		(await db.get(`${interaction.guildId}.users`)) || {}
	);

	const pagination = new Pagination(interaction, {
		limit: 10,
		idle: 86400000,
	});

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

	const embeds = [];
	let temporal = [];

	for (const i in positionings) {
		const p = positionings[i];
		temporal.push(p);

		if ((Number(i) + 1) % 10 === 0) {
			const newEmbed = new EmbedBuilder()
				.setTitle("Season Leaderboard")
				.setColor(0xffffff)
				.setFields(
					temporal.flatMap(({ member, user }) => {
						const { elo = 0, winstreak = 0, seasonGames } = user;
						const rank = getRankIcon(elo);

						const winrate =
							(100 * (seasonGames?.won || 0)) / (seasonGames?.played || 0);

						const ind = positionings.findIndex(
							(po) => po.member?.id === member?.id,
						);

						if ((ind + 1) % 2 === 0) {
							return [
								{
									name: `${ind + 1}. ${member?.displayName}`,
									value: `ELO: ${elo}\nRank: ${rank}\nWinstreak: ${winstreak}\nGames Played: ${seasonGames?.played || 0}\nWin Rate: ${Math.round(
										Number.isNaN(winrate) ? 0 : winrate,
									)}%`,
									inline: true,
								},
								{ name: "", value: "" },
							];
						}

						return {
							name: `${ind + 1}. ${member?.displayName}`,
							value: `ELO: ${elo}\nRank: ${rank}\nWinstreak: ${winstreak}\nGames Played: ${seasonGames?.played || 0}\nWin Rate: ${Math.round(
								Number.isNaN(winrate) ? 0 : winrate,
							)}%`,
							inline: true,
						};
					}),
				);
			embeds.push(newEmbed);

			temporal = [];
		}
	}

	embeds.push(
		new EmbedBuilder()
			.setTitle("Season Leaderboard")
			.setColor(0xffffff)
			.setFields(
				temporal.flatMap(({ member, user }) => {
					const { elo = 0, winstreak = 0, seasonGames } = user;
					const rank = getRankIcon(elo);

					const winrate =
						(100 * (seasonGames?.won || 0)) / (seasonGames?.played || 0);

					const ind = positionings.findIndex(
						(po) => po.member?.id === member?.id,
					);

					if ((ind + 1) % 2 === 0) {
						return [
							{
								name: `${ind + 1}. ${member?.displayName}`,
								value: `ELO: ${elo}\nRank: ${rank}\nWinstreak: ${winstreak}\nGames Played: ${seasonGames?.played || 0}\nWin Rate: ${Math.round(
									Number.isNaN(winrate) ? 0 : winrate,
								)}%`,
								inline: true,
							},
							{ name: "", value: "" },
						];
					}

					return {
						name: `${ind + 1}. ${member?.displayName}`,
						value: `ELO: ${elo}\nRank: ${rank}\nWinstreak: ${winstreak}\nGames Played: ${seasonGames?.played || 0}\nWin Rate: ${Math.round(
							Number.isNaN(winrate) ? 0 : winrate,
						)}%`,
						inline: true,
					};
				}),
			),
	);

	pagination.setEmbeds(embeds, (embed, index, array) =>
		embed.setFooter({ text: `Page: ${index + 1}/${array.length}` }),
	);

	pagination.render();
};

/** @type { SlashOption } */
const gamesPlayedLeaderboard = async (interaction) => {
	const users = /** @type { Users } */ (
		(await db.get(`${interaction.guildId}.users`)) || {}
	);

	const positionings = (
		await Promise.all(
			Object.entries(users)
				.sort((a, b) => {
					const eloA = a[1].totalGames?.played || 0;
					const eloB = b[1].totalGames?.played || 0;

					return eloB - eloA;
				})
				.slice(0, 20)
				.map(async (p) => ({
					member: await interaction.guild?.members
						.fetch(p[0])
						.catch(() => null),
					user: p[1],
				})),
		)
	).filter((p) => !!p.member);

	await interaction.editReply({
		embeds: [
			new EmbedBuilder()
				.setTitle("Games Played Leaderboard")
				.setColor(0xffffff)
				.setDescription(
					positionings
						.map(({ member, user }, i) => {
							const { highestElo = 0, totalGames, highestWinstreak = 0 } = user;

							const totalWinrate =
								(100 * (totalGames?.won || 0)) / (totalGames?.played || 0);

							const rank = getRankIcon(highestElo);

							return `**${i + 1}. ${member?.displayName}**Total Games Played: ${user.totalGames?.played}\nHighest ELO: ${highestElo}\nHighest Rank: ${rank}\nHighest Winstreak: ${highestWinstreak}\nCareer Win Rate: ${Math.round(
								Number.isNaN(totalWinrate) ? 0 : totalWinrate,
							)}%`;
						})
						.join("\n") || "No Games Played yet!",
				),
		],
	});
};

/** @type { SlashOption } */
const managersLeaderboard = async (interaction) => {
	const managers = /** @type { Managers } */ (
		(await db.get(`${interaction.guildId}.managers`)) || {}
	);

	const positionings = (
		await Promise.all(
			Object.entries(managers)
				.sort((a, b) => {
					const gamesA = a[1].games || 0;
					const gamesB = b[1].games || 0;

					return gamesB - gamesA;
				})
				.map(async (p) => ({
					member: await interaction.guild?.members
						.fetch(p[0])
						.catch(() => null),
					manager: p[1],
				})),
		)
	).filter((p) => !!p.member);

	const embed = new EmbedBuilder()
		.setTitle("Manager Leaderboard")
		.setColor(0xffffff)
		.setDescription(
			positionings
				.map((p, i) => {
					const { member, manager } = p;

					return `${i + 1}. ${member?.displayName}: ${manager.games} ${manager.games === 1 ? "game" : "games"} managed`;
				})
				.join("\n") || "No games have been played yet!",
		);

	await interaction.editReply({ embeds: [embed] });
};
