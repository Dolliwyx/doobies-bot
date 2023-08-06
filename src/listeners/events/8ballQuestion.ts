import { Events, Listener, container } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { eightBallAnswers } from '#lib/common/constants';
import { ApplyOptions } from '@sapphire/decorators';

const regexPrefix = container.client.options.regexPrefix!;

@ApplyOptions<Listener.Options>({
	event: Events.MessageCreate
})
export class UserEvent extends Listener<typeof Events.MessageCreate> {
	public override async run(message: Message) {
		if (!regexPrefix.test(message.content)) return;
		if (!message.content.endsWith('?')) return;
		return message.reply(eightBallAnswers[Math.floor(Math.random() * eightBallAnswers.length)]);
	}
}
