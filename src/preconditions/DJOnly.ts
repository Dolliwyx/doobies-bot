import { Precondition } from '@sapphire/framework';
import { userMention, type Interaction, type Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public override async chatInputRun(interaction: Interaction) {
		const guildPlayer = this.container.queue.get(interaction.guildId!);
		if (!guildPlayer) return this.ok();
		const {
			music: { djs }
		} = await this.container.settings.users.get(guildPlayer.owner);

		if (guildPlayer.owner !== interaction.user.id && !djs?.includes(interaction.user.id)) {
			return this.error({
				message: `The owner of this music session ${userMention(
					guildPlayer.owner
				)} does not have you as a DJ. Have them add you using \`/dj add\`!`,
				identifier: 'PermissionsMissing'
			});
		}
		return this.ok();
	}

	public override async messageRun(message: Message) {
		const guildPlayer = this.container.queue.get(message.guildId!)!;
		if (!guildPlayer) return this.ok();
		const {
			music: { djs }
		} = await this.container.settings.users.get(guildPlayer.owner);

		if (guildPlayer.owner !== message.author.id && !djs?.includes(message.author.id)) {
			return this.error({
				message: 'The owner of this music session does not have you as a DJ. Have them add you using `/dj add`!',
				identifier: 'PermissionsMissing'
			});
		}
		return this.ok();
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		DJOnly: never;
	}
}
