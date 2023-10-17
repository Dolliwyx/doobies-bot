import { SapphireClient, container } from '@sapphire/framework';
import { type Guild, type TextChannel, type VoiceBasedChannel } from 'discord.js';
import type { Shoukaku, Track } from 'shoukaku';

export class DoobiePlayer {
	client: SapphireClient;
	guild: Guild;
	queue: Track[];
	voiceChannel?: VoiceBasedChannel;
	textChannel?: TextChannel | VoiceBasedChannel;
	isPlaying: boolean;
	paused: boolean;
	volume: number;
	shoukaku: Shoukaku;
	owner: string;

	constructor(guild: Guild) {
		this.client = container.client;
		this.guild = guild;

		this.queue = [];
		this.voiceChannel;
		this.textChannel;
		this.isPlaying = false;
		this.paused = false;
		this.volume = 20;
		this.shoukaku = container.shoukaku;
		this.owner = '';
	}

	public async join(channel: VoiceBasedChannel) {
		this.voiceChannel = channel;
		return this.shoukaku.joinVoiceChannel({
			guildId: channel.guildId,
			channelId: channel.id!,
			shardId: 0,
			deaf: true,
			mute: false
		});
	}

	public async play() {
		const [song] = this.queue;
		if (this.paused) return this.resume();
		for (let i = 0; i < 3; i++) {
			try {
				await this.player?.playTrack({ track: song.encoded, options: { volume: this.volume } });
				this.isPlaying = true;
				break;
			} catch (error) {
				if (i === 2) {
					await this.textChannel?.send({ content: `Failed to play ${song.info.title}. Skipping...` });
					this.skip();
					await this.play();
					break;
				}
				container.logger.error(error);
				continue;
			}
		}
		return this.isPlaying;
	}

	public async stop() {
		await this.player?.stopTrack();
		this.isPlaying = false;
		return !this.isPlaying;
	}

	public skip() {
		if (!this.player) return;
		else this.queue.shift();
	}

	public async pause() {
		await this.player?.setPaused(true);
		this.paused = true;
		return this.paused;
	}

	public async resume() {
		await this.player?.setPaused(false);
		this.paused = false;
		return !this.paused;
	}

	public async disconnect() {
		container.queue.delete(this.guild.id);
		await this.player?.destroyPlayer();
		return this.shoukaku.leaveVoiceChannel(this.guild.id);
	}

	public async setVolume(volume: number) {
		const actualVol = Math.ceil(20 * (volume / 100));
		await this.player?.setGlobalVolume(actualVol);
		this.volume = actualVol;
		return this.volume;
	}

	public getIdealNode() {
		return this.shoukaku.getIdealNode();
	}

	public get player() {
		return this.shoukaku.players.get(this.guild.id) || null;
	}
}
