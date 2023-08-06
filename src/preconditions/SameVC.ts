import { Precondition } from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';

export class UserPrecondition extends Precondition {
	public override chatInputRun(interaction: CommandInteraction) {
		const guildPlayer = this.container.queue.get(interaction.guildId!)!;
		if (!guildPlayer) return this.error({ message: 'There is no music playing in this server.' });
		if ((interaction.member as GuildMember).voice.channelId !== guildPlayer.voiceChannel?.id)
			return this.error({ message: 'You must be in the same voice channel to use this command.' });
        return this.ok();
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		SameVC: never;
	}
}