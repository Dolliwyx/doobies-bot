import { createFunctionPrecondition } from '@sapphire/decorators';
import { UserError } from '@sapphire/framework';
import { envParseArray } from '@skyra/env-utilities';
import type { Message } from 'discord.js';

export function AdminOnly(): MethodDecorator {
	return createFunctionPrecondition(async (message: Message) => {
		if (
			!envParseArray('OWNERS').includes(message.author.id) ||
			!message.member?.permissions.toArray().some((perms) => perms.includes('ADMINISTRATOR'))
		) {
			throw new UserError({ message: 'You must be an administrator to use this command.', identifier: 'PermissionsMissing' });
		}
		return true;
	});
}
