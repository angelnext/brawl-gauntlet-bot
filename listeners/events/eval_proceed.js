import { ButtonBuilder, Events, time, TimestampStyles } from "discord.js";
import { embeds } from "../../utils/embeds.js";
import { db } from "../../utils/database.js";

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith("eval_proceed")) return;

	if (!interaction.member.roles.cache.has("1262159706047119401")) {
		interaction.reply({
			embeds: [
				embeds.error(
					"You aren't a Gauntlet Manager and therefore cannot evaluate a game",
				),
			],
			ephemeral: true,
		});
		return;
	}

	await interaction.deferReply();

	const [_, w, l, s] = interaction.customId.split("-");

	const winner = await interaction.guild.members.fetch(w);
	const loser = await interaction.guild.members.fetch(l);

	await db.set(`${interaction.guildId}-${w}-in_game`, false);
	await db.set(`${interaction.guildId}-${l}-in_game`, false);

	const sweep = s === "yes";

	const highestELO =
		(await db.get(`${interaction.guildId}-${winner.id}-max_elo`)) || 0;

	const winnerELO =
		(await db.get(`${interaction.guildId}-elo.${winner.id}`)) || 0;
	const loserELO =
		(await db.get(`${interaction.guildId}-elo.${loser.id}`)) || 0;

	const lastPos =
		(await db.get(`${interaction.guildId}-${winner.id}-last_pos`)) || 32;

	const top16boost =
		lastPos <= 2
			? 20
			: lastPos <= 4
				? 15
				: lastPos <= 8
					? 10
					: lastPos <= 16
						? 5
						: 0;

	const playedGames =
		(await db.get(`${interaction.guildId}-games_played.${winner.id}`)) || 0;

	const playedBoost =
		playedGames <= 15
			? 5
			: playedGames <= 30
				? 10
				: playedGames <= 45
					? 15
					: playedGames <= 60
						? 20
						: playedGames <= 75
							? 25
							: 30;
	const newBoost = loserELO <= 100 ? 20 : 0;

	const difference = Math.round((winnerELO - loserELO) * 0.1);
	const differenceBoost =
		difference >= 70 ? 70 : difference <= -70 ? -70 : difference;

	const lostBase = 80 - differenceBoost;
	const lost = Math.round(
		((sweep ? (lostBase * 120) / 100 : lostBase) * (100 - newBoost)) / 100,
	);

	const winstreak =
		(await db.get(`${interaction.guildId}-winstreak.${winner.id}`)) || 0;

	const winnerBase = 100 - differenceBoost;
	const winnerNew = Math.round(
		((((((sweep ? (winnerBase * 120) / 100 : winnerBase) * (100 + top16boost)) /
			100) *
			(100 + playedBoost)) /
			100) *
			(100 + (winstreak > 5 ? 5 : winstreak))) /
			100,
	);

	if (loserELO >= 2000 && loserELO - lost < 2000) {
		await db.set(`${interaction.guildId}-elo.${loser.id}`, 2000);
	} else if (loserELO >= 1500 && loserELO - lost < 1500) {
		await db.set(`${interaction.guildId}-elo.${loser.id}`, 1500);
	} else if (loserELO >= 1200 && loserELO - lost < 1000) {
		await db.set(`${interaction.guildId}-elo.${loser.id}`, 1000);
	} else if (loserELO >= 900 && loserELO - lost < 700) {
		await db.set(`${interaction.guildId}-elo.${loser.id}`, 700);
	} else if (loserELO >= 600 && loserELO - lost < 400) {
		await db.set(`${interaction.guildId}-elo.${loser.id}`, 400);
	} else if (loserELO >= 300 && loserELO - lost < 200) {
		await db.set(`${interaction.guildId}-elo.${loser.id}`, 200);
	} else if (loserELO - lost >= 30) {
		await db.sub(`${interaction.guildId}-elo.${loser.id}`, lost);
	} else {
		await db.set(
			`${interaction.guildId}-elo.${loser.id}`,
			loserELO >= 30 ? 30 : loserELO,
		);
	}

	const currentELO = await db.add(
		`${interaction.guildId}-elo.${winner.id}`,
		winnerNew,
	);

	const currentLostELO = await db.get(`${interaction.guildId}-elo.${loser.id}`);

	if (currentELO > highestELO) {
		await db.set(`${interaction.guildId}-${winner.id}-max_elo`, currentELO);
	}

	await db.add(`${interaction.guildId}-games_played.${winner.id}`, 1);
	await db.add(`${interaction.guildId}-games_won.${winner.id}`, 1);
	const wk = await db.add(`${interaction.guildId}-winstreak.${winner.id}`, 1);
	await db.add(`${interaction.guildId}-total_games_played.${winner.id}`, 1);
	await db.add(`${interaction.guildId}-total_games_won.${winner.id}`, 1);

	await db.add(`${interaction.guildId}-total_games_played.${loser.id}`, 1);
	await db.add(`${interaction.guildId}-games_played.${loser.id}`, 1);
	await db.set(`${interaction.guildId}-winstreak.${loser.id}`, 0);
	const max_winstreak = await db.set(
		`${interaction.guildId}-max_winstreak.${winner.id}`,
		0,
	);

	if (wk > max_winstreak) {
		await db.set(`${interaction.guildId}-max_winstreak.${winner.id}`, wk);
	}

	const now = new Date();
	now.setSeconds(now.getSeconds() + 5);

	await interaction.editReply({
		content: `Done!, <@${winner.id}> won ${winnerNew} amount of ELO and <@${
			loser.id
		}> lost ${loserELO - currentLostELO} amount of ELO. Thread will auto-delete ${time(now, TimestampStyles.RelativeTime)}`,
	});

	const row = interaction.message.components[0];
	row.components = row.components.map((button) =>
		ButtonBuilder.from(button).setDisabled(true),
	);

	await interaction.message.edit({ components: [row] });

	try {
		const finalMessageChannel = await interaction.guild?.channels.fetch(
			"1262146766124613692",
		);
		await finalMessageChannel.send(
			`<@${winner.id}> won against <@${loser.id}> (+${winnerNew}, ${currentLostELO - loserELO})`,
		);
		setTimeout(async () => {
			await interaction.channel?.delete();
		}, 5_000);
	} catch (err) {
		console.error(err);
	}

	await db.add(`${interaction.guildId}-managers.${interaction.user?.id}`, 1);

	return true;
};
