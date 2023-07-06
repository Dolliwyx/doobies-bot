export const defaultUserSettings: UserSettings = {
	money: 0,
	pet: {
		name: 'Doobie',
		level: 1,
		exp: 0,
		expToNextLevel: 0,
		cosmetics: {
			owned: {
				hat: [],
				glasses: [],
				outfit: [],
				sets: []
			},
			equipped: {
				hat: '',
				glasses: '',
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
	hat: String[];
	glasses: String[];
	outfit: String[];
	sets: String[];
}

export interface Equipped {
	hat: string;
	glasses: string;
	outfit: string;
	sets: string;
}

export interface Cosmetic {
	owned: Owned;
	equipped: Equipped;
}

export interface Pet {
	name: string;
	level: number;
	exp: number;
	expToNextLevel: number;
	cosmetics: Cosmetic;
}

export interface UserSettings {
	money: number;
	pet: Pet;
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