import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Duration, DurationFormatter } from '@sapphire/time-utilities';
import { bold, type GuildMemberRoleManager } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Timeout a user for a specified amount of time.',
	requiredUserPermissions: ['ModerateMembers'],
	requiredClientPermissions: ['ModerateMembers']
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((option) => option.setName('user').setDescription('The user to timeout').setRequired(true))
				.addStringOption((option) => option.setName('time').setDescription('The amount of time to timeout the user for').setRequired(true))
				.addStringOption((option) => option.setName('reason').setDescription('The reason for timing out the user').setRequired(false))
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const user = interaction.options.getUser('user', true);
		const member = await interaction.guild!.members.fetch(user.id);
		const time = interaction.options.getString('time', true);
		const { offset: duration } = new Duration(time);
		const reason = interaction.options.getString('reason');

		if (!duration) return interaction.reply({ content: 'Invalid duration provided.', ephemeral: true });
		if (duration > 2419200000) return interaction.reply({ content: 'Timeout duration cannot exceed 28 days.', ephemeral: true });

		if (member.roles.highest.position >= (interaction.member!.roles as GuildMemberRoleManager).highest.position)
			return interaction.reply({ content: 'You cannot timeout this user.', ephemeral: true });
		if (member.roles.highest.position >= interaction.guild!.members.me!.roles.highest.position)
			return interaction.reply({ content: 'I cannot timeout this user.', ephemeral: true });

		if (member.id === interaction.guild!.ownerId) return interaction.reply({ content: 'You cannot timeout the owner.', ephemeral: true });
		if (member.id === interaction.user.id) return interaction.reply({ content: 'You cannot timeout yourself.', ephemeral: true });
		if (member.id === this.container.client.user!.id) return interaction.reply({ content: 'You cannot timeout me.', ephemeral: true });
		if (!member.moderatable) return interaction.reply({ content: 'I cannot timeout this user.', ephemeral: true });
		if (member.isCommunicationDisabled()) return interaction.reply({ content: 'This user is already timed out.', ephemeral: true });

		await member.timeout(duration, `Timeout by ${interaction.user.tag}. Reason: ${reason ?? 'No reason provided.'}`);

		return interaction.reply({ content: `Timed out ${user.tag} for ${bold(new DurationFormatter().format(duration))}.`, ephemeral: true });
	}
}
