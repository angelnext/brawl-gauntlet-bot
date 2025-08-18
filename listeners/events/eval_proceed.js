import { ButtonBuilder, Events, time, TimestampStyles } from "discord.js";
import * as embeds from "../../utils/embeds.js";
import { db } from "../../utils/database.js";
import { LOG_CHANNEL, MANAGER_ROLE } from "../../utils/consts.js";
import { getRankText } from "../../utils/ranks.js";
import { setAllButtonsToDisabled } from "../../utils/buttons.js";

export const on = Events.InteractionCreate;

/** @type {ButtonEvent} */
export const run = async (interaction) => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("eval_proceed")) return;

  if (!interaction.member.roles.cache.has(MANAGER_ROLE)) {
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

  const { winner, loser, sweep, manager } = /** @type { Duel } */ (
    (await db.get(`${interaction.guildId}.duels.${interaction.channelId}`)) ||
    {}
  );

  await db.set(`${interaction.guildId}.users.${winner}.inGame`, false);
  await db.set(`${interaction.guildId}.users.${loser}.inGame`, false);

  const winnerUser = /** @type {DbUser} */ (
    await db.get(`${interaction.guildId}.users.${winner}`)
  );
  const loserUser = /** @type {DbUser} */ (
    await db.get(`${interaction.guildId}.users.${loser}`)
  );

  const playedGames = winnerUser?.seasonGames?.played || 0;

  const { elo: winnerElo = 0, winstreak = 0, highestElo = 0 } = winnerUser;
  const { elo: loserElo = 0 } = loserUser;

  const playedBoost =
    playedGames >= 100
      ? 30
      : playedGames >= 75
        ? 25
        : playedGames >= 60
          ? 20
          : playedGames >= 45
            ? 15
            : playedGames >= 30
              ? 10
              : playedGames >= 15
                ? 5
                : 0;
  const newBoost = loserElo <= 100 ? 20 : 0;

  const difference = Math.round((winnerElo - loserElo) / 10);
  const differenceBoost =
    difference >= 70 ? 70 : difference <= -70 ? -70 : difference;

  const lostBase = 80 - differenceBoost;
  const lost = Math.round(
    ((sweep ? (lostBase * 120) / 100 : lostBase) * (100 - newBoost)) / 100,
  );

  const winnerBase = 100 - differenceBoost;
  const winnerNew = Math.round(
    ((sweep ? (winnerBase * 120) / 100 : winnerBase) *
      (100 + playedBoost) *
      (100 + (winstreak > 5 ? 5 : winstreak))) /
    (100 * 100),
  );

  const milestones = [200, 400, 700, 1000, 1500, 2000];

  /**
   * @function getMilestone
   * @param { number} elo
   * @returns { number } The milestone that belongs to that elo
   */
  const getMilestone = (elo) =>
    Math.max(...milestones.filter((m) => elo >= m), 0);

  /**
   * @function loseElo
   * @param { number} oldElo
   * @param { number} amountToLose
   * @returns { number } The new elo to add to database
   */
  const loseElo = (oldElo, amountToLose) => {
    const currentMilestone = getMilestone(oldElo);
    const tentativeNewElo = oldElo - amountToLose;

    // If loss drops below current milestone, floor it at the milestone
    const newElo = Math.max(tentativeNewElo, currentMilestone);

    return newElo;
  };

  const currentLostElo = loseElo(loserElo, lost);

  await db.set(`${interaction.guildId}.users.${loser}.elo`, currentLostElo);

  const currentElo = await db.add(
    `${interaction.guildId}.users.${winner}.elo`,
    winnerNew,
  );

  if (currentElo > highestElo) {
    await db.set(
      `${interaction.guildId}.users.${winner}.highestElo`,
      currentElo,
    );
  }

  await db.add(`${interaction.guildId}.users.${winner}.seasonGames.played`, 1);
  await db.add(`${interaction.guildId}.users.${winner}.seasonGames.won`, 1);

  await db.add(`${interaction.guildId}.users.${winner}.totalGames.played`, 1);
  await db.add(`${interaction.guildId}.users.${winner}.totalGames.won`, 1);

  await db.add(`${interaction.guildId}.users.${loser}.seasonGames.played`, 1);
  await db.add(`${interaction.guildId}.users.${loser}.totalGames.played`, 1);

  await db.set(`${interaction.guildId}.users.${loser}.highestWinstreak`, 0);

  const newWinstreak = await db.add(
    `${interaction.guildId}.users.${winner}.winstreak`,
    1,
  );

  const highestWinstreak = await db.get(
    `${interaction.guildId}.users.${winner}.highestWinstreak`,
  );

  if (newWinstreak > highestWinstreak) {
    await db.set(
      `${interaction.guildId}.users.${winner}.highestWinstreak`,
      newWinstreak,
    );
  }

  const now = new Date();
  now.setSeconds(now.getSeconds() + 5);

  await interaction.editReply({
    content: `Done!, <@${winner}> won ${winnerNew} amount of ELO and <@${loser
      }> lost ${loserElo - currentLostElo} amount of ELO. Thread will auto-delete ${time(now, TimestampStyles.RelativeTime)}`,
  });

  const row = setAllButtonsToDisabled(interaction.message.components[0]);

  await interaction.message.edit({ components: [row] });

  try {
    const finalMessageChannel =
			/** @type {import("discord.js").TextChannel} */ (
        await interaction.guild?.channels.fetch(LOG_CHANNEL, { cache: true })
      );

    await finalMessageChannel?.send(
      `<@${winner}> won against <@${loser}> (+${winnerNew}, ${loserElo - currentLostElo})`,
    );

    await db.delete(`${interaction.guildId}.duels.${interaction.channelId}`);

    const hasRankedUp =
      milestones.filter(
        (milestone) => winnerElo < milestone && currentElo >= milestone,
      ).length > 0;

    if (hasRankedUp) {
      finalMessageChannel?.send(
        `<@${winner}> has ranked up to ${getRankText(currentElo)}`,
      );
    }

    setTimeout(async () => {
      await interaction.channel?.delete(
        "The duel in this thread has already ended",
      );
    }, 5_000);
  } catch (err) {
    console.error(err);
  }

  await db.add(`${interaction.guildId}.managers.${manager}.games`, 1);

  return true;
};
