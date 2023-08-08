import { Resolvers, SapphireClient, container } from '@sapphire/framework';
import { bold, type Guild, type TextChannel, type VoiceBasedChannel } from 'discord.js';
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
					content: `Now playing: ${bold(data.track.info.title)} by ${data.track.info.author} [Requested by: ${await this.resolveUser(
						requester
					)}]`,
					allowedMentions: { parse: [] }
				});
			})
			.on('end', async (data) => {
				if (data.reason === 'loadFailed') {
					await this.textChannel!.send({ content: `Failed to load track: ${data.track.info.title}. Skipping...` });
					await this.skip();
				}
				if (data.reason === 'finished') {
					await this.textChannel!.send({ content: `Finished playing: ${bold(data.track.info.title)} by ${data.track.info.author}` });
					this.queue.shift();
					if (this.queue.length) {
						this.play();
					} else {
						await this.textChannel?.send({ content: 'Queue is empty.' });
						this.isPlaying = false;
						setTimeout(
							async () => {
								if (!this.queue.length) await this.disconnect();
							},
							1000 * 60 * 5
						);
					}
				}
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
		await this.player?.playTrack({ track: song.encoded, options: { volume: this.volume } });
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
			this.play();
		} else {
			this.isPlaying = false;
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
