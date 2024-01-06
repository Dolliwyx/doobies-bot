import type { ArrayString } from '@skyra/env-utilities';
import type { Setting } from '#lib/structures/Setting';
import type { Shoukaku } from 'shoukaku';
import type { QueueManager } from '#lib/structures/QueueManager';
import type { UserSettings } from '#lib/types/UserSettings';
import type { GuildSettings } from '#lib/types/GuildSettings';

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

declare module 'shoukaku' {
	interface Track {
		requester: string;
	}

	interface Playlist {
		requester: string;
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		settings: {
			users: Setting<UserSettings>;
			guilds: Setting<GuildSettings>;
		};
		shoukaku: Shoukaku;
		queue: QueueManager;
	}
}
