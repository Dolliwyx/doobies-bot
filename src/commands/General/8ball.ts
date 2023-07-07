import { ApplyOptions } from '@sapphire/decorators';
import { Command, type ChatInputCommand, Args } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { eightBallAnswers } from '../../lib/common/constants';

@ApplyOptions<Command.Options>({
	description: 'Ask the mighty 8ball a question.'
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) => option.setName('question').setDescription('The question to ask the 8ball.').setRequired(true))
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const question = interaction.options.getString('question', true);
		const answer = eightBallAnswers[Math.floor(Math.random() * eightBallAnswers.length)];
		return interaction.reply({ content: `❓ ${question}\n\n💡 ${answer}` });
	}

	public override async messageRun(message: Message, args: Args) {
		const question = args.rest('string');
		if (!question) return message.reply('You must provide a question to ask the 8ball.');
		return message.reply({ content: eightBallAnswers[Math.floor(Math.random() * eightBallAnswers.length)] });
	}
}
