import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	description: 'Gawing🤸ganto🤸ang🤸text🤸ng🤸beshy🤸ko'
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) => option.setName('text').setDescription('Text to transform').setRequired(true))
		);
	}
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const text = interaction.options.getString('text', true);
        const transformedText = text.split(' ').join('🤸');

        return interaction.reply({ content: transformedText });
    };
}
