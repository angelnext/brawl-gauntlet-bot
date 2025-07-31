import { EmbedBuilder } from "discord.js";
import { db } from "../../utils/database.js";
import { Pagination } from "pagination.djs";

export const run = async (interaction) => {
	const type = interaction.options.getString("type") || "gauntletLeaderboard";

	const leaderboards = {
		gauntletLeaderboard,
		gamesPlayedLeaderboard,
		managersLeaderboard,
	};

	await interaction.deferReply();

	await leaderboards[type](interaction);

	return true;
};

const gauntletLeaderboard = async (interaction) => {
	const all = (await db.get(`${interaction.guildId}-elo`)) ?? {};
	const pagination = new Pagination(interaction, {
		limit: 10,
		idle: 86400000,
	});

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

	const embeds = [];
	let temporal = [];

	for (const i in positionings) {
		const p = positionings[i];
		temporal.push(p);

		if ((Number(i) + 1) % 10 === 0) {
			embeds.push(
				new EmbedBuilder()
					.setTitle("Season Leaderboard")
					.setColor(0xffffff)
					.setFields(
						(
							await Promise.all(
								temporal.map(async (p) => {
									const [user, elo] = p;
									const rank =
										elo >= 2000
											? "<:god:1310729948897476679>"
											: elo >= 1500
												? "<:mythical:1310729943428370512>"
												: elo >= 1000
													? "<:legendary:1310729946414448740>"
													: elo >= 700
														? "<:mythic:1310745459735920771>"
														: elo >= 400
															? "<:gold:1310729947618218066>"
															: elo >= 200
																? "<:silver:1310729940760531015>"
																: "<:bronze:1310729890340929636>";

									const playedGames =
										(await db.get(
											`${interaction.guildId}-games_played.${user?.id}`,
										)) || 0;
									const wonGames =
										(await db.get(
											`${interaction.guildId}-games_won.${user?.id}`,
										)) || 0;
									const winstreak =
										(await db.get(
											`${interaction.guildId}-winstreak.${user?.id}`,
										)) || 0;

									const ind = positionings.findIndex(
										(po) => po[0].id === user.id,
									);

									if ((ind + 1) % 2 === 0) {
										return [
											{
												name: `${ind + 1}. ${user?.displayName}`,
												value: `ELO: ${elo}\nRank: ${rank}\nWinstreak: ${winstreak}\nGames Played: ${playedGames}\nWin Rate: ${Math.round(
													Number.isNaN((100 * wonGames) / playedGames)
														? 0
														: (100 * wonGames) / playedGames,
												)}%`,
												inline: true,
											},
											{ name: "", value: "" },
										];
									}

									return {
										name: `${ind + 1}. ${user?.displayName}`,
										value: `ELO: ${elo}\nRank: ${rank}\nWinstreak: ${winstreak}\nGames Played: ${playedGames}\nWin Rate: ${Math.round(
											Number.isNaN((100 * wonGames) / playedGames)
												? 0
												: (100 * wonGames) / playedGames,
										)}%`,
										inline: true,
									};
								}),
							)
						).flat(),
					),
			);

			temporal = [];
		}
	}

	embeds.push(
		new EmbedBuilder()
			.setTitle("Season Leaderboard")
			.setColor(0xffffff)
			.setFields(
				(
					await Promise.all(
						temporal.map(async (p) => {
							const [user, elo] = p;
							const rank =
								elo >= 2000
									? "<:god:1310729948897476679>"
									: elo >= 1500
										? "<:mythical:1310729943428370512>"
										: elo >= 1000
											? "<:legendary:1310729946414448740>"
											: elo >= 700
												? "<:mythic:1310745459735920771>"
												: elo >= 400
													? "<:gold:1310729947618218066>"
													: elo >= 200
														? "<:silver:1310729940760531015>"
														: "<:bronze:1310729890340929636>";

							const playedGames =
								(await db.get(
									`${interaction.guildId}-games_played.${user?.id}`,
								)) || 0;
							const wonGames =
								(await db.get(
									`${interaction.guildId}-games_won.${user?.id}`,
								)) || 0;
							const winstreak =
								(await db.get(
									`${interaction.guildId}-winstreak.${user?.id}`,
								)) || 0;

							const ind = positionings.findIndex((po) => po[0].id === user.id);

							if ((ind + 1) % 2 === 0) {
								return [
									{
										name: `${ind + 1}. ${user?.displayName}`,
										value: `ELO: ${elo}\nRank: ${rank}\nWinstreak: ${winstreak}\nGames Played: ${playedGames}\nWin Rate: ${Math.round(
											Number.isNaN((100 * wonGames) / playedGames)
												? 0
												: (100 * wonGames) / playedGames,
										)}%`,
										inline: true,
									},
									{ name: "", value: "" },
								];
							}

							return {
								name: `${ind + 1}. ${user?.displayName}`,
								value: `ELO: ${elo}\nRank: ${rank}\nWinstreak: ${winstreak}\nGames Played: ${playedGames}\nWin Rate: ${Math.round(
									Number.isNaN((100 * wonGames) / playedGames)
										? 0
										: (100 * wonGames) / playedGames,
								)}%`,
								inline: true,
							};
						}),
					)
				).flat(),
			),
	);

	pagination.setEmbeds(embeds, (embed, index, array) =>
		embed.setFooter({ text: `Page: ${index + 1}/${array.length}` }),
	);

	pagination.render();
};

const gamesPlayedLeaderboard = async (interaction) => {
	const all = (await db.get(`${interaction.guildId}-total_games_played`)) ?? {};

	const positionings = (
		await Promise.all(
			Object.entries(all)
				.sort(([, a], [, b]) => b - a)
				.slice(0, 33)
				.map(async (p) => [
					await interaction.guild.members.fetch(p[0]).catch(() => {}),
					p[1],
				]),
		)
	).filter((p) => !!p[0]);

	await interaction.editReply({
		embeds: [
			new EmbedBuilder()
				.setTitle("Games Played Leaderboard")
				.setColor(0xffffff)
				.setDescription(
					(
						await Promise.all(
							positionings.map(async (p, i) => {
								const [user] = p;
								const elo =
									(await db.get(`${interaction.guildId}-${user.id}-max_elo`)) ||
									0;

								const rank =
									elo >= 2000
										? "<:god:1310729948897476679>"
										: elo >= 1500
											? "<:mythical:1310729943428370512>"
											: elo >= 1200
												? "<:legendary:1310729946414448740>"
												: elo >= 900
													? "<:mythic:1310745459735920771>"
													: elo >= 600
														? "<:gold:1310729947618218066>"
														: elo >= 300
															? "<:silver:1310729940760531015>"
															: "<:bronze:1310729890340929636>";

								const playedGames =
									(await db.get(
										`${interaction.guildId}-total_games_played.${user?.id}`,
									)) || 0;
								const wonGames =
									(await db.get(
										`${interaction.guildId}-total_games_won.${user?.id}`,
									)) || 0;
								const winstreak =
									(await db.get(
										`${interaction.guildId}-max_winstreak.${user?.id}`,
									)) || 0;

								return `**${i + 1}. ${user?.displayName}**Total Games Played: ${playedGames}\nHighest ELO: ${elo}\nHighest Rank: ${rank}\nHighest Winstreak: ${winstreak}\nCareer Win Rate: ${Math.round(
									Number.isNaN((100 * wonGames) / playedGames)
										? 0
										: (100 * wonGames) / playedGames,
								)}%`;
							}),
						)
					).join("\n") || "No Games Played yet!",
				),
		],
	});
};

const managersLeaderboard = async (interaction) => {
	const all = (await db.get(`${interaction.guildId}-managers`)) ?? {};

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

	const embed = new EmbedBuilder()
		.setTitle("Manager Leaderboard")
		.setColor(0xffffff)
		.setDescription(
			(
				await Promise.all(
					positionings.map(async (p, i) => {
						const [user, games] = p;

						return `${i + 1}. ${user?.displayName}: ${games} ${games === 1 ? "game" : "games"} managed`;
					}),
				)
			).join("\n"),
		);

	if (positionings.length < 1) {
		embed.setDescription("No Games have been played yet!");
	}

	await interaction.editReply({ embeds: [embed] });
};
