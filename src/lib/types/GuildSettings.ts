export interface GuildSettings {
	prefix: string;
	welcome: Welcome;
	tags: Tag[];
}

interface Welcome {
	enabled: boolean;
	channelId: string;
	message: string;
}

interface Tag {
	name: string;
	content: string;
	author: string;
	createdAt: number;
	updatedAt: number;
}
