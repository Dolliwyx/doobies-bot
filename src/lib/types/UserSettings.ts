export interface UserSettings {
	money: Partial<Money>;
	pet: Partial<Pet>;
	music: Partial<Music>;
}

export interface Money {
	balance: number;
	lastClaimedDaily: number;
}

export interface Pet {
	name: string;
	level: number;
	exp: number;
	expToNextLevel: number;
	cosmetics: Partial<Cosmetic>;
}

export interface Cosmetic {
	owned: Partial<OwnedCosmetics>;
	equipped: Partial<EquippedCosmetics>;
}

export interface OwnedCosmetics {
	hats: string[];
	eyewears: string[];
	outfits: string[];
	sets: string[];
}

export interface EquippedCosmetics {
	hat: string;
	eyewear: string;
	outfit: string;
	sets: string;
}

export interface Music {
	djs: string[];
}
