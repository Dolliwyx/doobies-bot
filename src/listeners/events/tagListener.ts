import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.MessageCreate
})
export class UserEvent extends Listener<typeof Events.MessageCreate> {
	public override async run(message: Message) {
		let tag = '';
		const prefix = (await this.container.client.fetchPrefix(message)) as string;
		if (message.content.startsWith(prefix)) {
			tag = message.content.slice(prefix.length).trim().split(' ')[0];
		} else if (this.container.client.options.regexPrefix!.test(message.content)) {
			tag = message.content.replace(this.container.client.options.regexPrefix!, '').trim().split(' ')[0];
		}
		const { tags } = await this.container.settings.getGuildSetting(message.guildId!);
		const reoslvedTag = tags.find((t) => t?.name.toLowerCase() === tag.toLowerCase()) ?? null;
		if (!reoslvedTag) return;
		return message.reply(reoslvedTag.content);
	}
}
