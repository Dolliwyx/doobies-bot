export const defaultUserSettings: UserSettings = {
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
	pet: Partial<Pet>;
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
