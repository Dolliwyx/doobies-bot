import { createFunctionPrecondition } from '@sapphire/decorators';
import { UserError, container } from '@sapphire/framework';
import type { Message } from 'discord.js';

export function DJOnly(): MethodDecorator {
	return createFunctionPrecondition(async (message: Message) => {
		const guildPlayer = container.queue.get(message.guild!.id);
		if (!guildPlayer) return false;
		const {
			music: { djs }
		} = await container.settings.getUserSetting(guildPlayer.owner);
		if (guildPlayer.owner !== message.author.id && !djs?.includes(message.author.id)) {
			throw new UserError({ message: 'The owner of this music session does not have you as a DJ. Have them add you using `/dj add`!', identifier: 'PermissionsMissing' });
		}
		return true;
	});
}