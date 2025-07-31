import {
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
	Events,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { embeds } from "../../utils/embeds.js"

export const on = Events.InteractionCreate;

export const run = async (interaction) => {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith("eval_button")) return;

  if (!interaction.member.roles.cache.has("1262159706047119401")) {
    interaction.reply({ embeds: [embeds.error("You aren't a Gauntlet Manager and therefore cannot evaluate a game")], ephemeral: true })
    return;
  }

	const [_, draftee1, draftee2] = interaction.customId.split("-");

  const d1 = await interaction.guild.members.fetch(draftee1)
  const d2 = await interaction.guild.members.fetch(draftee2)  

  const embed = new EmbedBuilder().setDescription("Select Winner").setColor(0xffffff) 
  const select = new StringSelectMenuBuilder()
    .setCustomId(`eval_select-${draftee1}-${draftee2}-${interaction.id}`)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(d1.user.username)
        .setValue(`${draftee1}-${interaction.id}-${Date.now()}`),
      new StringSelectMenuOptionBuilder()
        .setLabel(d2.user.username)
        .setValue(`${draftee2}-${interaction.id}-${Date.now()}`)
    )

  const selectRow = new ActionRowBuilder().addComponents(select)

  await interaction.reply({ embeds: [embed], components: [selectRow] })

  const row = interaction.message.components[0]
  row.components = row.components.map(button => ButtonBuilder.from(button).setDisabled(true))

  await interaction.message.edit({ components: [row] })

	return true;
};
