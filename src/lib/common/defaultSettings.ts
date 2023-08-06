export const defaultUserSettings: UserSettings = {
	money: {
		balance: 0,
		lastClaimedDaily: 0
	},
	pet: {
		name: 'Doobie',
		level: 1,
		exp: 0,
		expToNextLevel: 0,
		cosmetics: {
			owned: {
				hats: [],
				eyewears: [],
				outfits: [],
				sets: []
			},
			equipped: {
				hat: '',
				eyewear: '',
				outfit: '',
				sets: ''
			}
		}
	},
	music: {
		djs: []
	}
};

export const defaultGuildSettings: GuildSettings = {
	prefix: '!!',
	welcome: {
		enabled: false,
		channelId: '',
		message: ''
	}
};

export interface GuildSettings {
	prefix: string;
	welcome: Partial<Welcome>;
}

export interface Welcome {
	enabled: boolean;
	channelId: string;
	message: string;
}

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