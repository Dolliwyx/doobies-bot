import type { UserSettings } from '#lib/types/UserSettings';
import type { GuildSettings } from '#lib/types/GuildSettings';

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
	},
	tags: []
};
