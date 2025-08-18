import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events,
} from "discord.js";
import * as embeds from "../../utils/embeds.js";
import { db } from "../../utils/database.js";
import { MANAGER_ROLE } from "../../utils/consts.js";
import { setAllButtonsToDisabled } from "../../utils/buttons.js";

export const on = Events.InteractionCreate;

/** @type {ButtonEvent} */
export const run = async (interaction) => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("eval_confirm")) return;

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

  const { winner } = /** @type { Duel } */ (
    await db.get(`${interaction.guildId}.duels.${interaction.channelId}`)
  );

  const [_, s] = interaction.customId.split("-");

  const sweep = s === "yes";

  await db.set(
    `${interaction.guildId}.duels.${interaction.channelId}.sweep`,
    sweep,
  );

  const embed = new EmbedBuilder()
    .setTitle("Confirm Results")
    .setDescription(`
      **Winner:** <@${winner}>
      **Sweep:** ${s}
    `)
    .setColor(0xffffff);

  const yesButton = new ButtonBuilder()
    .setCustomId(`eval_proceed-${interaction.id}`)
    .setLabel("Yes, Evaluate")
    .setStyle(ButtonStyle.Danger);

  const noButton = new ButtonBuilder()
    .setCustomId(`eval_button-${interaction.id}`)
    .setLabel("No, I want to make changes")
    .setStyle(ButtonStyle.Danger);

  const selectRow = new ActionRowBuilder().addComponents(yesButton, noButton);

  await interaction.reply({ embeds: [embed], components: [selectRow] });

  const row = setAllButtonsToDisabled(interaction.message.components[0]);

  await interaction.message.edit({ components: [row] });

  return true;
};
