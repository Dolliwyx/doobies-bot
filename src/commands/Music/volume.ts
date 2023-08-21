import { DJOnly } from '#lib/decorators/DJOnly';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { bold } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Adjust the volume of the music player.',
	preconditions: ['SameVC', 'GuildVoiceOnly', 'GuildTextOnly']
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addNumberOption((option) =>
					option.setName('volume').setDescription('The volume to set the player to.').setMinValue(1).setMaxValue(100).setRequired(true)
				)
		);
	}

	@DJOnly()
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const volume = interaction.options.getNumber('volume', true);
        const guildPlayer = this.container.queue.get(interaction.guildId!)!;

        if (!guildPlayer) return interaction.reply({ content: 'There is no music playing in this server.', ephemeral: true });
        await guildPlayer.setVolume(volume);

        return interaction.reply({ content: `Set the volume to ${bold(volume.toString())}.` });
    }
}
