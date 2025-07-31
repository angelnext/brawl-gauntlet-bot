import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	Events,
} from "discord.js";
import { embeds } from "../../utils/embeds.js"

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith("eval_confirm")) return;

  if (!interaction.member.roles.cache.has("1262159706047119401")) {
    interaction.reply({ embeds: [embeds.error("You aren't a Gauntlet Manager and therefore cannot evaluate a game")], ephemeral: true })
    return;
  }

	const [_, winner, loser, sweep] = interaction.customId.split("-");  

  const embed = new EmbedBuilder()
    .setTitle("Confirm Results")
    .setDescription(`
      **Winner:** <@${winner}>
      **Sweep:** ${sweep}
    `)
    .setColor(0xffffff)  

  const yesButton = new ButtonBuilder()
    .setCustomId(`eval_proceed-${winner}-${loser}-${sweep}`)
    .setLabel("Yes, Evaluate")
    .setStyle(ButtonStyle.Danger)

  const noButton = new ButtonBuilder()
    .setCustomId(`eval_button-${winner}-${loser}-${interaction.id}`)
    .setLabel("No, I want to make changes")
    .setStyle(ButtonStyle.Danger)

  const selectRow = new ActionRowBuilder().addComponents(yesButton, noButton)

  await interaction.reply({ embeds: [embed], components: [selectRow] })

  const row = interaction.message.components[0]
  row.components = row.components.map(button => ButtonBuilder.from(button).setDisabled(true))

  await interaction.message.edit({ components: [row] })

	return true;
};
