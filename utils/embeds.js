import { EmbedBuilder } from "discord.js";

/**
 * @function success Embed Builder for the common success message
 * @param {string} message The message for the embed
 * @returns {EmbedBuilder} The embed with the success message
 * */
export const success = (message) =>
	new EmbedBuilder().setDescription(`${message}`).setColor(0xffffff);

/**
 * @function error Embed Builder for the common error message
 * @param {string} message The message for the embed
 * @returns {EmbedBuilder} The embed with the error message
 * */
export const error = (message) =>
	new EmbedBuilder().setDescription(`:no_entry: ${message}`).setColor(0xffffff);
