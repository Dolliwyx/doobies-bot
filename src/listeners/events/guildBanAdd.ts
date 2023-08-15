import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { EmbedBuilder, Events, GuildBan } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.GuildBanAdd
})
export class UserEvent extends Listener {
	public async run(data: GuildBan) {
		if (data.guild.id !== '1031124797083631636') return;
		const channel = await this.container.client.channels.fetch('1128700342599700540');
		if (!channel?.isTextBased()) return;
		return channel.send({
			embeds: [
				new EmbedBuilder()
					.setColor('Red')
					.setAuthor({ name: data.user.tag, iconURL: data.user.displayAvatarURL() })
					.addFields(
						{
							name: 'ID',
							value: data.user.id,
							inline: true
						},
						{ name: 'Reason', value: data.reason ?? 'No reason provided.', inline: true }
					)
			]
		});
	}
}
