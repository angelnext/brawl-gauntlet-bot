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
	if (!interaction.isStringSelectMenu()) return;
	if (!interaction.customId.startsWith("eval_select")) return;

  if (!interaction.member.roles.cache.has("1262159706047119401")) {
    interaction.reply({ embeds: [embeds.error("You aren't a Gauntlet Manager and therefore cannot evaluate a game")], ephemeral: true })
    return;
  }

	const [_, draftee1, draftee2] = interaction.customId.split("-"); 

  const loser = interaction.values[0].split("-")[0] === draftee1 ? draftee2 : draftee1

  const embed = new EmbedBuilder().setDescription("Was it a sweep?").setColor(0xffffff)
  const yesButton = new ButtonBuilder()
    .setCustomId(`eval_confirm-${interaction.values[0].split("-")[0]}-${loser}-yes`)
    .setLabel("Yes")
    .setStyle(ButtonStyle.Primary)
  const noButton = new ButtonBuilder()
    .setCustomId(`eval_confirm-${interaction.values[0].split("-")[0]}-${loser}-no`)
    .setLabel("No")
    .setStyle(ButtonStyle.Secondary)

  const selectRow = new ActionRowBuilder().addComponents(yesButton, noButton)

  await interaction.reply({ embeds: [embed], components: [selectRow] })

  await interaction.message.edit({ components: [], embeds: [new EmbedBuilder().setColor(0xffffff).setDescription(`Selected <@${interaction.values[0].split("-")[0]}> as winner`)] })

	return true;
};

