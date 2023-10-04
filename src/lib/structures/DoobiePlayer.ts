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
			if (i === 2) {
				await this.textChannel?.send({ content: 'Failed to play the track. Skipping...' });
				return this.skip();
			}

			try {
				await this.player?.playTrack({ track: song.encoded, options: { volume: this.volume } });
				break;
			} catch (error) {
				container.logger.error(error);
				continue;
			}
		}
		this.isPlaying = true;
		return this.isPlaying;
	}

	public async stop() {
		await this.player?.stopTrack();
		this.isPlaying = false;
		return !this.isPlaying;
	}

	public async skip() {
		await this.player?.stopTrack();
		this.queue.shift();
		if (this.queue.length) {
			await this.play();
		} else {
			await this.textChannel?.send({ content: 'Queue is empty. Disconnecting after 5 minutes of inactivity.' });
			this.isPlaying = false;
			setTimeout(
				async () => {
					if (!this.queue.length) {
						await this.textChannel?.send({ content: 'Disconnected due to inactivity.' });
						await this.disconnect();
					}
				},
				1000 * 60 * 5
			);
		}
		return this.isPlaying;
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
