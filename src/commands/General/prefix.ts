import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { inlineCode, type Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Get the prefix for this guild.',
	preconditions: ['GuildOnly']
})
export class UserCommand extends Command {
	public override async messageRun(message: Message) {
		// Get prefix from database
		const prefix = (await this.container.client.fetchPrefix(message)) as string;

		// Reply with prefix
		return send(message, `The prefix for this guild is ${inlineCode(prefix)}`);
	}
}
