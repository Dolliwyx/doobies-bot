import { createFunctionPrecondition } from '@sapphire/decorators';
import { UserError } from '@sapphire/framework';
import { envParseArray } from '@skyra/env-utilities';
import type { Message } from 'discord.js';

export function ModOnly(): MethodDecorator {
	return createFunctionPrecondition(async (message: Message) => {
		if (
			!envParseArray('OWNERS').includes(message.author.id) ||
			!message.member?.permissions.toArray().some((perms) => ['ADMINISTRATOR', 'MANAGE_GUILD', 'MODERATE_MEMBERS'].includes(perms))
		) {
			throw new UserError({ message: 'You must be an moderator to use this command.', identifier: 'PermissionsMissing' });
		}
		return true;
	});
}
