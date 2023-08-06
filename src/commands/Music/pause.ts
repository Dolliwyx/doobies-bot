import { DJOnly } from "#lib/decorators/DJOnly";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";

@ApplyOptions<Command.Options>({
    description: 'Pause the current song',
    preconditions: ['SameVC', 'GuildVoiceOnly']
})
export class UserCommand extends Command {
    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) => builder.setName(this.name).setDescription(this.description));
    }

    @DJOnly()
    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const guildPlayer = this.container.queue.get(interaction.guildId!)!;

        if (!guildPlayer) return interaction.reply({ content: 'There is no music playing in this server.', ephemeral: true });

        await guildPlayer.pause();

        return  interaction.reply({ content: 'Paused the current song.' });
    }
}