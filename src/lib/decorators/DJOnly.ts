import { createFunctionPrecondition } from '@sapphire/decorators';
import { UserError, container } from '@sapphire/framework';
import type { Interaction } from 'discord.js';

export function DJOnly(): MethodDecorator {
	return createFunctionPrecondition(async (interaction: Interaction) => {
		const guildPlayer = container.queue.get(interaction.guildId!);
		if (!guildPlayer) return true;
		const {
			music: { djs }
		} = await container.settings.getUserSetting(guildPlayer.owner);
		if (guildPlayer.owner !== interaction.user.id && !djs?.includes(interaction.user.id)) {
			throw new UserError({
				message: 'The owner of this music session does not have you as a DJ. Have them add you using `/dj add`!',
				identifier: 'PermissionsMissing'
			});
		}
		return true;
	});
}
