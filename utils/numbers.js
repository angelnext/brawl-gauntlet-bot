/**
 * @function toOrdinal takes a number and turns it into an ordinal number in string format
 * @param {number} n The number you will turn into a ordinal string
 * @returns {string} The ordinal number in string format
 * */
export const toOrdinal = (n) => {
	if (n > 3 && n < 21) return `${n}th`;
	switch (n % 10) {
		case 1:
			return `${n}st`;
		case 2:
			return `${n}nd`;
		case 3:
			return `${n}rd`;
		default:
			return `${n}th`;
	}
};
