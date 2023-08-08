import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Stops the music, and clears the queue.',
	preconditions: ['SameVC', 'GuildVoiceOnly']
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => builder.setName(this.name).setDescription(this.description));
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildPlayer = this.container.queue.get(interaction.guildId!)!;

		const {
			music: { djs }
		} = await this.container.settings.getUserSetting(guildPlayer.owner);

		if (guildPlayer.owner !== interaction.user.id && !djs?.includes(interaction.user.id))
			return interaction.editReply({
				content: 'The owner of this music session does not have you as a DJ. Have them add you using `/dj add`!'
			});

		if (!guildPlayer) return interaction.reply({ content: 'There is no music playing in this server.', ephemeral: true });
		if ((interaction.member as GuildMember).voice.channelId !== guildPlayer.voiceChannel?.id)
			return interaction.reply({ content: 'You must be in the same voice channel to use this command.', ephemeral: true });
		await guildPlayer.stop();
		guildPlayer.queue = [];
		return interaction.reply({ content: 'Stopped the music and cleared the queue.' });
	}
}
