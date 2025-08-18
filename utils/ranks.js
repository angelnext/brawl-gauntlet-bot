/**
 * @function getRankIcon
 * @param { number } elo
 * @returns { string } The rank emoji
 * */
export const getRankIcon = (elo) => {
	if (elo >= 2000) return "<:god:1310729948897476679>";
	if (elo >= 1500) return "<:mythical:1310729943428370512>";
	if (elo >= 1000) return "<:legendary:1310729946414448740>";
	if (elo >= 700) return "<:mythic:1310745459735920771>";
	if (elo >= 400) return "Gold <:gold:1310729947618218066>";
	if (elo >= 200) return "<:silver:1310729940760531015>";
	return "<:bronze:1310729890340929636>";
};

/**
 * @function getRankText
 * @param { number } elo
 * @returns { string } The rank emoji and name
 * */
export const getRankText = (elo) => {
	if (elo >= 2000) return "God <:god:1310729948897476679>";
	if (elo >= 1500) return "Mythical <:mythical:1310729943428370512>";
	if (elo >= 1000) return "Legendary <:legendary:1310729946414448740>";
	if (elo >= 700) return "Mythic <:mythic:1310745459735920771>";
	if (elo >= 400) return "Gold <:gold:1310729947618218066>";
	if (elo >= 200) return "Silver <:silver:1310729940760531015>";
	return "Bronze <:bronze:1310729890340929636>";
};
