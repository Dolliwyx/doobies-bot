export type UserSettings = {
	money: Money;
	pet: Pet;
	music: Music;
}

interface Money {
	balance: number;
	lastClaimedDaily: number;
}

interface Pet {
	name: string;
	level: number;
	exp: number;
	expToNextLevel: number;
	cosmetics: Cosmetic;
}

interface Cosmetic {
	owned: OwnedCosmetics;
	equipped: EquippedCosmetics;
}

interface OwnedCosmetics {
	hats: string[];
	eyewears: string[];
	outfits: string[];
	sets: string[];
}

interface EquippedCosmetics {
	hat: string;
	eyewear: string;
	outfit: string;
	sets: string;
}

interface Music {
	djs: string[];
}
