import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { bold, inlineCode } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Returns the balance of the user or yourself'
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((option) => option.setName('user').setDescription('The user to get the balance of'))
		);
	}

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user') ?? interaction.user;
        const userSettings = await this.container.settings.getUserSetting(user.id);
        const balance = userSettings.money?.balance ?? 0;
        return interaction.reply({ content: `${inlineCode('🪙')} ${bold(user.username)} has ${balance} coins!` });
    }
}
