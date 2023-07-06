export const defaultUserSettings: UserSettings = {
	money: 0,
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

export interface Owned {
	hats?: string[];
	eyewears?: string[];
	outfits?: string[];
	sets?: string[];
}

export interface Equipped {
	hat?: string;
	eyewear?: string;
	outfit?: string;
	sets?: string;
}

export interface Cosmetic {
	owned?: Owned;
	equipped?: Equipped;
}

export interface Pet {
	name?: string;
	level?: number;
	exp?: number;
	expToNextLevel?: number;
	cosmetics?: Cosmetic;
}

export interface UserSettings {
	money?: number;
	pet?: Pet;
}

export interface Welcome {
	enabled?: boolean;
	channelId?: string;
	message?: string;
}

export interface GuildSettings {
	prefix?: string;
	welcome?: Welcome;
}