import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { EmbedBuilder, bold, underscore } from 'discord.js';
import { chunk } from '@sapphire/utilities';
import { shuffleArray } from '#lib/utils';
import { DJOnly } from '#lib/decorators/DJOnly';

@ApplyOptions<Subcommand.Options>({
	description: 'View and manage your current music queue.',
	subcommands: [
		{ name: 'view', default: true, chatInputRun: 'interactionView' },
		{ name: 'clear', chatInputRun: 'interactionClear' },
		{ name: 'remove', chatInputRun: 'interactionRemove' },
		{ name: 'shuffle', chatInputRun: 'interactionShuffle' }
	],
	preconditions: ['SameVC', 'GuildVoiceOnly']
})
export class UserCommand extends Subcommand {
	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand((subcommand) => subcommand.setName('view').setDescription('View your current music queue.'))
				.addSubcommand((subcommand) => subcommand.setName('clear').setDescription('Clear your current music queue.'))
				.addSubcommand((subcommand) => subcommand.setName('shuffle').setDescription('Shuffle your current music queue.'))
				.addSubcommand((subcommand) =>
					subcommand
						.setName('remove')
						.setDescription('Remove a song from your current music queue.')
						.addNumberOption((option) => option.setName('index').setDescription('The index of the song to remove.').setRequired(true))
				)
		);
	}

	public async interactionView(interaction: Subcommand.ChatInputCommandInteraction) {
		const guildPlayer = await this.container.queue.get(interaction.guildId!);
		if (!guildPlayer) return interaction.reply({ content: 'There is no music playing in this server.' });

		const { queue } = guildPlayer;
		if (queue.length > 10) {
			const pages = chunk(queue, 15);
			const paginatedMessage = new PaginatedMessage({
				template: new EmbedBuilder().setColor('Random').setAuthor({ name: 'Current music queue', iconURL: interaction.guild?.iconURL()! })
			});
			let pageMultiplier = 0;
			for (const page of pages) {
				paginatedMessage.addPageEmbed((embed) =>
					embed
						.setDescription(
							page
								.map(
									(song, index) => `${index + 1 + 10 * pageMultiplier}. ${bold(song.info.title)} by ${underscore(song.info.author)}`
								)
								.join('\n')
						)
						.setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL()! })
				);
				pageMultiplier++;
			}

			return paginatedMessage.run(interaction, interaction.user);
		}

		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setAuthor({ name: 'Current music queue', iconURL: interaction.guild?.iconURL()! })
					.setColor('Random')
					.setDescription(
						queue.map((song, index) => `${index + 1}. ${bold(song.info.title)} by ${underscore(song.info.author)}`).join('\n')
					)
					.setFooter({ text: `1/1 • Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL()! })
			]
		});
	}

	@DJOnly()
	public async interactionClear(interaction: Subcommand.ChatInputCommandInteraction) {
		const guildPlayer = await this.container.queue.get(interaction.guildId!)!;

		if (!guildPlayer) return interaction.reply({ content: 'There is no music playing in this server.', ephemeral: true });
		guildPlayer.queue = [];
		return interaction.reply({ content: 'The queue has been cleared.' });
	}

	@DJOnly()
	public async interactionRemove(interaction: Subcommand.ChatInputCommandInteraction) {
		const index = interaction.options.getNumber('index', true);
		const guildPlayer = await this.container.queue.get(interaction.guildId!)!;

		if (!guildPlayer) return interaction.reply({ content: 'There is no music playing in this server.', ephemeral: true });

		const songToBeRemoved = guildPlayer.queue[index - 1];

		guildPlayer.queue.splice(index - 1, 1);

		return interaction.reply({ content: `Removed ${bold(songToBeRemoved.info.title)} from the queue.` });
	}

	@DJOnly()
	public async interactionShuffle(interaction: Subcommand.ChatInputCommandInteraction) {
		const guildPlayer = await this.container.queue.get(interaction.guildId!)!;

		if (!guildPlayer) return interaction.reply({ content: 'There is no music playing in this server.', ephemeral: true });

		if (guildPlayer.queue.length < 3)
			return interaction.reply({ content: 'There are not enough songs in the queue to shuffle.', ephemeral: true });

		const currentTrack = guildPlayer.queue.shift()!;
		guildPlayer.queue = shuffleArray(guildPlayer.queue);
		guildPlayer.queue.unshift(currentTrack);

		return interaction.reply({ content: 'The queue has been shuffled.' });
	}
}
