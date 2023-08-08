export const hats: Cosmetic[] = [
	{
		name: 'Default Glasses',
		price: 0,
		description: 'Default glasses for your pet doobie.',
		path: 'images/glasses/default.png'
	}
];

export const eyewears: Cosmetic[] = [];

export const outfits: Cosmetic[] = [];

export const sets: Cosmetic[] = [
	{
		name: 'Easter Set',
		price: 3000,
		description: 'Easter set for your pet doobie.',
		path: 'images/sets/easter.png',
		exclusive: false
	},
	{
		name: 'Christmas Set',
		price: 3000,
		description: 'Christmas set for your pet doobie.',
		path: 'images/sets/christmas.png',
		exclusive: false
	},
	{
		name: 'Mexican Set',
		price: 3000,
		description: 'Mexican set for your pet doobie.',
		path: 'images/sets/mexican.png',
		exclusive: false
	},
	{
		name: 'Summer Set',
		price: 3000,
		description: 'Summer set for your pet doobie.',
		path: 'images/sets/summer.png',
		exclusive: false
	}
];

export interface Cosmetic {
	name?: string;
	price?: number;
	description?: string;
	path?: string;
	exclusive?: boolean;
}
