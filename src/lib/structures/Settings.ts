import { mergeDefault } from '@sapphire/utilities';
import Keyv from 'keyv';
import { defaultGuildSettings, defaultUserSettings, type GuildSettings, type UserSettings } from '../common/defaultSettings';

export class Settings {
	public path: string;
	public userSettings!: Keyv;
	public guildSettings!: Keyv;
	public db!: Keyv;

	public constructor(path: string) {
		this.path = path;
		this.userSettings;
		this.guildSettings;
	}

	public init() {
		this.db = new Keyv(this.path, { adapter: 'sqlite' });
		this.userSettings = new Keyv(this.path, { namespace: 'userSettings', adapter: 'sqlite' });
		this.guildSettings = new Keyv(this.path, { namespace: 'guildSettings', adapter: 'sqlite' });
	}

	public async createGuildSetting(guildId: string): Promise<GuildSettings> {
		return this.setGuildSetting(guildId);
	}

	public async createUserSetting(userId: string): Promise<UserSettings> {
		return this.setUserSetting(userId);
	}

	public async getGuildSetting(guildId: string): Promise<GuildSettings> {
		const guildSettings = (await this.guildSettings.get(guildId)) ?? (await this.createGuildSetting(guildId));
		const settings = mergeDefault(defaultGuildSettings, guildSettings);
        return settings;
	}

	public async setGuildSetting(guildId: string, data: GuildSettings = {}): Promise<GuildSettings> {
		if (typeof data !== 'object') throw new Error('Data must be an object');
		await this.guildSettings.set(guildId, data);
		const settings = mergeDefault(defaultGuildSettings, data);
        return settings;
	}

	public async getUserSetting(userId: string): Promise<UserSettings> {
		const userSettings = (await this.userSettings.get(userId)) ?? (await this.createUserSetting(userId));
		const settings = mergeDefault(defaultUserSettings, userSettings);
        return settings;
    }

	public async setUserSetting(userId: string, data = {}): Promise<UserSettings> {
		if (typeof data !== 'object') throw new Error('Data must be an object');
		await this.userSettings.set(userId, data);
		const settings = mergeDefault(defaultUserSettings, data);
        return settings;
    }

	public async resetGuildSetting(guildId: string) {
		return this.guildSettings.set(guildId, {});
	}

	public async resetUserSetting(userId: string) {
		return this.userSettings.set(userId, {});
	}

	public async deleteGuildSetting(guildId: string) {
		return this.guildSettings.delete(guildId);
	}

	public async deleteUserSetting(userId: string) {
		return this.userSettings.delete(userId);
	}

	public get getDb() {
		return this.db;
	}

	public async _disconnect() {
		await this.db.disconnect();
		await this.userSettings.disconnect();
		await this.guildSettings.disconnect();
	}
}
