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
		await this.guildSettings.set(guildId, {});
		return defaultGuildSettings
	}

	public async createUserSetting(userId: string): Promise<UserSettings> {
		await this.userSettings.set(userId, {});
		return defaultUserSettings
	}

	public async getGuildSetting(guildId: string): Promise<GuildSettings> {
		const guildSettings = (await this.guildSettings.get(guildId)) ?? (await this.createGuildSetting(guildId));
		return mergeDefault(defaultGuildSettings, guildSettings);
	}

	public async setGuildSetting(guildId: string, data: GuildSettings = {}): Promise<GuildSettings> {
		if (typeof data !== 'object') throw new Error('Data must be an object');
		const guildSettings = (await this.guildSettings.get(guildId)) ?? (await this.createGuildSetting(guildId));
		const updatedSettings = mergeDefault(guildSettings, data);
		await this.guildSettings.set(guildId, updatedSettings);
		return mergeDefault(defaultGuildSettings, updatedSettings);
	}

	public async getUserSetting(userId: string): Promise<UserSettings> {
		const userSettings = (await this.userSettings.get(userId)) ?? (await this.createUserSetting(userId));
		return mergeDefault(defaultUserSettings, userSettings);
	}

	public async setUserSetting(userId: string, data = {}): Promise<UserSettings> {
		if (typeof data !== 'object') throw new Error('Data must be an object');
		const userSettings = (await this.userSettings.get(userId)) ?? (await this.createUserSetting(userId));
		const updatedSettings = mergeDefault(userSettings, data);
		this.userSettings.set(userId, updatedSettings);
		return mergeDefault(defaultUserSettings, updatedSettings);
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
