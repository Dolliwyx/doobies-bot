import { Resolvers, SapphireClient, container } from '@sapphire/framework';
import { bold, underscore, type Guild, type TextChannel, type VoiceBasedChannel } from 'discord.js';
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
		const player = await this.shoukaku.joinVoiceChannel({
			guildId: channel.guildId,
			channelId: channel.id!,
			shardId: 0,
			deaf: true,
			mute: false
		});

		player
			.on('start', async (data) => {
				const [{ requester }] = this.queue;
				return this.textChannel!.send({
					content: `Now playing: ${bold(data.track.info.title)} by ${underscore(
						data.track.info.author
					)} [Requested by: ${await this.resolveUser(requester)}]`,
					allowedMentions: { parse: [] }
				});
			})
			.on('stuck', (data) => container.logger.error('PLAYER STUCK', data))
			.on('exception', (data) => container.logger.error('PLAYER ERROR', data))
			.on('end', async (data) => {
				if (data.reason === 'loadFailed') {
					await this.textChannel!.send({ content: `Failed to load track: ${data.track.info.title}. Skipping...` });
					return this.skip();
				}
				return this.skip();
			})
			.on('closed', async () => {
				await this.disconnect();
				return this.textChannel?.send({ content: 'I am disconnected from the voice channel.' });
			})
			.on('exception', async (data) => {
				return this.textChannel?.send({
					content: `An error occured while playing the track: ${data.exception.message} (TYPE: ${data.type}))`
				});
			});

		return player;
	}

	public async play() {
		const [song] = this.queue;
		if (this.paused) return this.resume();
		await this.player?.playTrack({ track: song.encoded, options: { volume: this.volume } }).catch(async () => await this.play());
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

	private async resolveUser(id: string) {
		const result = await Resolvers.resolveUser(id);
		return result.isOk() ? result.unwrap() : null;
	}
}
