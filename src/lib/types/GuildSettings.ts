export interface GuildSettings {
	prefix: string;
	welcome: Partial<Welcome>;
	tags: Partial<Tag[]>;
}

export interface Welcome {
	enabled: boolean;
	channelId: string;
	message: string;
}

export interface Tag {
	name: string;
	content: string;
	author: string;
	createdAt: number;
	updatedAt: number;
}
