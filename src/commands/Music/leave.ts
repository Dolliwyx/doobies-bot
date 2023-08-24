import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	description: 'Leave the voice channel',
	preconditions: ['SameVC', 'DJOnly'],
	runIn: [CommandOptionsRunTypeEnum.GuildText, CommandOptionsRunTypeEnum.GuildVoice]
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => builder.setName(this.name).setDescription(this.description));
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const guildPlayer = this.container.queue.get(interaction.guildId!)!;
		if (!guildPlayer) return interaction.reply({ content: 'There is no music playing in this server.', ephemeral: true });

		await guildPlayer.disconnect();

		return interaction.reply({ content: 'Left the voice channel.' });
	}
}
