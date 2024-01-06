import type { UserSettings, GuildSettings } from '#lib/types/index';

export const User: UserSettings = {
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

export const Guild: GuildSettings = {
	prefix: '!!',
	welcome: {
		enabled: false,
		channelId: '',
		message: ''
	},
	tags: []
};
