import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { type GuildMember, TextChannel, type VoiceBasedChannel, bold } from 'discord.js';
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
		} = await this.container.settings.getUserSetting(guildPlayer.owner);

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

		const node = guildPlayer.getIdealNode();
		if (!node) {
			this.container.logger.error('No available nodes.');
			return interaction.editReply({ content: 'No available nodes. Try again later.' });
		}

		const res = await node?.rest.resolve(query);

		if (res?.loadType === LoadType.ERROR) {
			const maxRetries = 3;
			for (let retry = 0; retry < maxRetries; retry++) {
				await interaction.editReply({ content: `Found no results, retrying... (${retry + 1}/${maxRetries})` });
				const res = await node?.rest.resolve(query);
				if (res || ![LoadType.ERROR, LoadType.EMPTY].includes(res!.loadType)) break;
			}
		}

		if (!res || [LoadType.ERROR, LoadType.EMPTY].includes(res.loadType))
			return interaction.editReply({ content: 'No results were found for your query.' });

		const member = interaction.member as GuildMember;
		if (!member.voice.channelId) return interaction.editReply({ content: 'You must be in a voice channel to use this command.' });

		if (!guildPlayer.voiceChannel) await guildPlayer.join(member.voice.channel!);

		if (member.voice.channelId !== guildPlayer.voiceChannel!.id)
			return interaction.editReply({ content: 'You must be in the same voice channel to use this command.' });
		if (!guildPlayer.textChannel) {
			guildPlayer.textChannel = interaction.channel as TextChannel | VoiceBasedChannel;
			await guildPlayer.textChannel.send({ content: `Connected and bound to ${guildPlayer.textChannel}` });
		}

		let track: Track | Playlist;

		if (res.loadType === LoadType.PLAYLIST) {
			track = res.data;
			for (const resolvedTrack of track.tracks) resolvedTrack.requester = interaction.user.id;
			guildPlayer.queue.push(...track.tracks);
			await interaction.editReply({ content: `Added to queue: ${bold(track.info.name)}` });
		} else if (res.loadType === LoadType.TRACK) {
			track = res.data;
			track.requester = interaction.user.id;
			guildPlayer.queue.push(track);
			await interaction.editReply({ content: `Added to queue: ${bold(track.info.title)}` });
		} else if (res.loadType === LoadType.SEARCH) {
			[track] = res.data;
			track.requester = interaction.user.id;
			guildPlayer.queue.push(track);
			await interaction.editReply({ content: `Added to queue: ${bold(track.info.title)}` });
		}

		if (guildPlayer.isPlaying) return;
		return guildPlayer.play();
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
