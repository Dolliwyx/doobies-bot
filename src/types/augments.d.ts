import type { ArrayString } from '@skyra/env-utilities';
import type { Settings } from '../lib/structures/Settings';
import type { Shoukaku } from 'shoukaku';
import type { QueueManager } from '../lib/structures/QueueManager';

declare module '@skyra/env-utilities' {
	interface Env {
		OWNERS: ArrayString;
		DISCORD_TOKEN: string;
		DATABASE_URL: string;
		SPOTIFY_CLIENTID: string;
		SPOTIFY_SECRET: string;
		LAVALINK_URL: string;
		LAVALINK_PORT: string;
		LAVALINK_AUTH: string;
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		settings: Settings;
	}
}
