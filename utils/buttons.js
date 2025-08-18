import { ActionRowBuilder } from "@discordjs/builders";
import { ButtonBuilder } from "discord.js";

/**
 * @function setAllButtonsToDisabled
 * @param { import("discord.js").TopLevelComponent } row
 * @returns The new row with all disabled buttons
 */
export const setAllButtonsToDisabled = (row) => {
  const r = /** @type {ActionRowBuilder<ButtonBuilder>} */ (/** @type {*} */ (row))
  const newRow = {
    data: r.data,
    components: r.components.map((button) =>
      ButtonBuilder.from(button).setDisabled(true),
    ),
  };
  return newRow;
};
