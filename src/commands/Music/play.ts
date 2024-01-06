import type { DoobiePlayer } from '#lib/structures/DoobiePlayer.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum, Resolvers } from '@sapphire/framework';
import { type GuildMember, TextChannel, type VoiceBasedChannel, bold, underscore } from 'discord.js';
import { LoadType, type Playlist, type Track } from 'shoukaku';

@ApplyOptions<Command.Options>({
	description: 'Play a song',
	aliases: ['p'],
	runIn: [CommandOptionsRunTypeEnum.GuildText, CommandOptionsRunTypeEnum.GuildVoice]
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) => option.setName('query').setDescription('The song or link to play').setRequired(true))
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.reply({ content: 'Searching...' });

		const guildPlayer = this.container.queue.add(interaction.guild!, interaction.user)!;
		let query = interaction.options.getString('query', true);

		const {
			music: { djs }
		} = await this.container.settings.users.get(guildPlayer.owner);

		if (guildPlayer.owner !== interaction.user.id && !djs?.includes(interaction.user.id))
			return interaction.editReply({
				content: 'The owner of this music session does not have you as a DJ. Have them add you using `/dj add`!'
			});

		if (guildPlayer.voiceChannel && (interaction.member as GuildMember).voice.channelId !== guildPlayer.voiceChannel?.id)
			return interaction.editReply({ message: 'You must be in the same voice channel to use this command.' });

		try {
			new URL(query);
		} catch (error) {
			query = `spsearch:${query}`;
		}

		const member = interaction.member as GuildMember;
		if (!member.voice.channelId) return interaction.editReply({ content: 'You must be in a voice channel to use this command.' });

		if (!guildPlayer.player) await this.join(guildPlayer, member.voice.channel!);

		if (member.voice.channelId !== guildPlayer.voiceChannel!.id)
			return interaction.editReply({ content: 'You must be in the same voice channel to use this command.' });

		const node = guildPlayer.player!.node;
		if (!node) {
			this.container.logger.error('No available nodes.');
			return interaction.editReply({ content: 'No available nodes. Try again later.' });
		}

		let res = await node?.rest.resolve(query);

		if (res?.loadType === LoadType.ERROR) {
			const maxRetries = 3;
			await interaction.editReply({ content: `Found no results, retrying...` });
			for (let retry = 0; retry < maxRetries; retry++) {
				res = await node?.rest.resolve(query);
				if (!res || [LoadType.ERROR, LoadType.EMPTY].includes(res.loadType)) continue;
				else break;
			}
		}

		if (!res || [LoadType.ERROR, LoadType.EMPTY].includes(res.loadType))
			return interaction.editReply({ content: 'No results were found for your query.' });
	
		if (!guildPlayer.textChannel) {
			guildPlayer.textChannel = interaction.channel as TextChannel | VoiceBasedChannel;
			await guildPlayer.textChannel.send({ content: `Connected and bound to ${guildPlayer.textChannel}` });
		}

		let track: Track | Playlist;

		switch (res.loadType) {
			case LoadType.SEARCH:
				[track] = res.data;
				track.requester = interaction.user.id;
				guildPlayer.queue.push(track);
				await interaction.editReply({ content: `Added to queue: ${bold(track.info.title)} by ${underscore(track.info.author)}` });
				break;
			case LoadType.TRACK:
				track = res.data;
				track.requester = interaction.user.id;
				guildPlayer.queue.push(track);
				await interaction.editReply({ content: `Added to queue: ${bold(track.info.title)} by ${underscore(track.info.author)}` });
				break;
			case LoadType.PLAYLIST:
				track = res.data;
				for (const resolvedTrack of track.tracks) resolvedTrack.requester = interaction.user.id;
				guildPlayer.queue.push(...track.tracks);
				await interaction.editReply({ content: `Added playlist to queue: ${bold(track.info.name)}` });
				break;
			default:
				return interaction.editReply({ content: 'Something went wrong with your query. Please try again' });
		}

		if (guildPlayer.isPlaying) return;
		return guildPlayer.play();
	}

	public async join(guildPlayer: DoobiePlayer, channel: VoiceBasedChannel) {
		const player = await guildPlayer.join(channel);

		player
			.on('start', async (data) => {
				const [{ requester }] = guildPlayer.queue;
				return guildPlayer.textChannel!.send({
					content: `Now playing: ${bold(data.track.info.title)} by ${underscore(
						data.track.info.author
					)} [Requested by: ${await this.resolveUser(requester)}]`,
					allowedMentions: { parse: [] }
				});
			})
			.on('stuck', (data) => this.container.logger.error('PLAYER STUCK', data))
			.on('exception', (data) => this.container.logger.error('PLAYER ERROR', data))
			.on('end', async (data) => {
				if (data.reason === 'loadFailed') {
					await guildPlayer.textChannel!.send({ content: `Failed to load track: ${data.track.info.title}. Skipping...` });
					guildPlayer.skip();
					await guildPlayer.play();
				}
				if (['stopped', 'replaced'].includes(data.reason)) return;
				guildPlayer.skip();
				await guildPlayer.play();
			})
			.on('closed', async () => {
				await guildPlayer.disconnect();
				await guildPlayer.textChannel?.send({ content: 'I am disconnected from the voice channel.' });
			})
			.on('exception', async (data) => {
				await guildPlayer.textChannel?.send({
					content: `An error occured while playing the track: ${data.exception.message} (TYPE: ${data.type}))`
				});
			});
	}

	private async resolveUser(id: string) {
		const result = await Resolvers.resolveUser(id);
		return result.isOk() ? result.unwrap() : null;
	}

	/* public override async messageRun(message: Message, args: Args) {
		const guildPlayer = this.container.queue.add(message.guild!)!;
		let query = await args.rest('string');
		if (!query) return message.reply('You must provide a song to play.');
		try {
			new URL(query);
		} catch (error) {
			query = `spsearch:${query}`;
		}

		const node = guildPlayer.getIdealNode();
		if (!node) {
			this.container.logger.error('No available nodes.');
			return send(message, { content: 'No available nodes. Try again later.', reply: { messageReference: message } });
		}

		const res = await node?.rest.resolve(query);
		if (!res || [LoadType.ERROR, LoadType.EMPTY].includes(res.loadType))
			return send(message, { content: 'No results were found for your query.', reply: { messageReference: message } });

		const member = message.member as GuildMember;
		if (!member.voice.channelId)
			return send(message, { content: 'You must be in a voice channel to use this command.', reply: { messageReference: message } });
		if (!guildPlayer.voiceChannel) await guildPlayer.join(member.voice.channel!);
		if (!guildPlayer.textChannel) {
			guildPlayer.textChannel = message.channel as TextChannel | VoiceBasedChannel;
			await guildPlayer.textChannel.send({ content: `Connected and bound to ${guildPlayer.textChannel}` });
		}

		let track: Track | Playlist;

		if (res.loadType === LoadType.PLAYLIST) {
			track = res.data;
			for (const resolvedTrack of track.tracks) resolvedTrack.requester = message.author.id;
			guildPlayer.queue.push(...track.tracks);
			await send(message, { content: `Added to queue: ${track.info.name}`, reply: { messageReference: message } });
		} else if (res.loadType === LoadType.TRACK) {
			track = res.data;
			track.requester = message.author.id;
			guildPlayer.queue.push(track);
			await send(message, { content: `Added to queue: ${track.info.title}`, reply: { messageReference: message } });
		} else if (res.loadType === LoadType.SEARCH) {
			[track] = res.data;
			track.requester = message.author.id;
			guildPlayer.queue.push(track);
			await send(message, { content: `Added to queue: ${track.info.title}`, reply: { messageReference: message } });
		}

		if (guildPlayer.isPlaying) return;
		return guildPlayer.play();
	} */
}
