import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	description: 'Manage who you trust in your music session.',
	subcommands: [
		{ name: 'add', default: true, chatInputRun: 'interactionAdd' },
		{ name: 'remove', chatInputRun: 'interactionRemove' },
		{ name: 'list', chatInputRun: 'interactionList' },
		{ name: 'clear', chatInputRun: 'interactionClear' }
	]
})
export class UserCommand extends Subcommand {
	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('add')
						.setDescription('Add a user to your DJ list.')
						.addUserOption((option) => option.setName('user').setDescription('The user to add.').setRequired(true))
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('remove')
						.setDescription('Remove a user from your DJ list.')
						.addUserOption((option) => option.setName('user').setDescription('The user to remove.').setRequired(true))
				)
				.addSubcommand((subcommand) => subcommand.setName('list').setDescription('List your DJ list.'))
				.addSubcommand((subcommand) => subcommand.setName('clear').setDescription('Clear all DJ list.'))
		);
	}

	public async interactionAdd(interaction: Subcommand.ChatInputCommandInteraction) {
		const trustedUser = interaction.options.getUser('user', true);
		if (trustedUser.id === interaction.user.id) return interaction.reply({ content: 'You cannot add yourself.', ephemeral: true });
		if (trustedUser.bot) return interaction.reply({ content: 'You cannot add bots.', ephemeral: true });

		const {
			music: { djs }
		} = await this.container.settings.getUserSetting(interaction.user.id);

		if (djs?.includes(trustedUser.id)) return interaction.reply({ content: 'This user is already in your list.', ephemeral: true });

		djs?.push(trustedUser.id);

		await this.container.settings.setUserSetting(interaction.user.id, { music: { djs } });
		return interaction.reply({ content: `Added ${trustedUser} to your DJ list.`, allowedMentions: { parse: [] } });
	}

	public async interactionRemove(interaction: Subcommand.ChatInputCommandInteraction) {
		const trustedUser = interaction.options.getUser('user', true);
		const {
			music: { djs }
		} = await this.container.settings.getUserSetting(interaction.user.id);

		if (!djs?.includes(trustedUser.id)) return interaction.reply({ content: 'This user is not in your list.', ephemeral: true });

		const newTrusted = djs.filter((id) => id !== trustedUser.id);

		await this.container.settings.setUserSetting(interaction.user.id, { music: { djs: newTrusted } });
		return interaction.reply({ content: `Removed ${trustedUser} from your DJ list.`, allowedMentions: { parse: [] } });
	}

	public async interactionList(interaction: Subcommand.ChatInputCommandInteraction) {
		const {
			music: { djs }
		} = await this.container.settings.getUserSetting(interaction.user.id);
		if (!djs?.length) return interaction.reply({ content: 'You have no DJs.', ephemeral: true });
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setAuthor({ name: 'My DJs', iconURL: interaction.user.avatarURL()! })
					.setDescription(djs.map((id) => `<@${id}>`).join('\n'))
					.setFooter({ text: 'These users can control your music session.' })
			]
		});
	}

	public async interactionClear(interaction: Subcommand.ChatInputCommandInteraction) {
		await this.container.settings.setUserSetting(interaction.user.id, { music: { djs: [] } });
		return interaction.reply({ content: 'Cleared your DJ list.', ephemeral: true });
	}
}
