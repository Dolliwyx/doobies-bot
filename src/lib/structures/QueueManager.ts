import { Collection, Guild, User } from 'discord.js';
import { DoobiePlayer } from '#lib/structures/DoobiePlayer';

export class QueueManager extends Collection<string, DoobiePlayer> {
	add(guild: Guild, owner: User) {
		if (!(guild instanceof Guild)) throw "Parameter 'guild' must be a Guild instance";
		if (this.has(guild.id)) return this.get(guild.id);
		const guildPlayer = new DoobiePlayer(guild);
		guildPlayer.owner = owner.id;
		this.set(guild.id, guildPlayer);
		return guildPlayer;
	}
}
