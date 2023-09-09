import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { AttachmentBuilder, EmbedBuilder, Events, GuildMember, channelMention, type TextBasedChannel, formatEmoji } from 'discord.js';
import { assetDir } from '#lib/common/constants';
import { Canvas, loadFont, loadImage } from 'canvas-constructor/napi-rs';
import { request } from 'undici';
import { fileURLToPath } from 'url';

loadFont(new URL('fonts/bubbleboddy.fat.ttf', assetDir).pathname, 'Bubbleboddy Fat');

@ApplyOptions<Listener.Options>({
	event: Events.GuildMemberAdd
})
export class UserEvent extends Listener {
	public override async run(member: GuildMember) {
		const guildSettings = await this.container.settings.getGuildSetting(member.guild.id);
		if (!(guildSettings.welcome?.enabled && guildSettings.welcome?.channelId)) return;
		const width = 1200,
			height = 514,
			middleY = height / 2,
			middleX = width / 2;

		const background = await loadImage(fileURLToPath(new URL('images/defaultBanner_v2.jpg', assetDir)));
		const memberCount = member.guild.memberCount.toLocaleString();

		// Use proper suffix for memberCount unless it's 11, 12, or 13
		const suffix =
			memberCount.endsWith('11') || memberCount.endsWith('12') || memberCount.endsWith('13')
				? 'th'
				: memberCount.endsWith('1')
				? 'st'
				: memberCount.endsWith('2')
				? 'nd'
				: memberCount.endsWith('3')
				? 'rd'
				: 'th';

		const { body } = await request(member.displayAvatarURL({ extension: 'webp', size: 4096 }));
		const avatar = await loadImage(await body.arrayBuffer());

		const canvas = new Canvas(width, height)
			.printImage(background, 0, 0, width, height)
			.setColor('#2673A4')
			.printCircle(middleX, middleY + 30, 115)
			.printCircularImage(avatar, middleX, middleY + 30, 110)
			.setColor('#ffffff')
			.setTextAlign('center')
			.setTextFont('90px Bubbleboddy Fat')
			.setShadowColor('#2d739e')
			.setShadowBlur(15)
			.process((canvas) => {
				let fontSize = 80,
					yOffset = 0;
				while (canvas.measureText(member.user.username.toUpperCase()).width > canvas.width) {
					yOffset += 5;
					canvas.setTextSize((fontSize -= 10));
				}
				canvas.setTextSize((fontSize -= 10));
				return canvas.printText(member.user.username.toUpperCase(), middleX, middleY - 100 + yOffset);
			})
			.process((canvas) => {
				let fontSize = 70;
				while (canvas.measureText(`you are our ${memberCount + suffix} member!`).width > canvas.width) {
					canvas.setTextSize((fontSize -= 10));
				}
				canvas.setTextSize((fontSize -= 10));
				return canvas.printText(`you are our ${memberCount + suffix} member!`, middleX, middleY + 200);
			})
			.webpAsync(100);

		const attachment = new AttachmentBuilder(await canvas, { name: 'welcome.webp' });

		const embed = new EmbedBuilder()
			.setColor('#E3F2FF')
			.setImage('attachment://welcome.webp')
			.setDescription(
				[
					`hey ${member}!\n`,
					`${formatEmoji('1148486696946651228')} check out the server rules over at ${channelMention('1031459803949707355')}`,
					`${formatEmoji('1148486696946651228')} come get your roles over at ${channelMention('1031459841333526578')}`,
					`${formatEmoji('1148486696946651228')} also check ${channelMention('1031459274548842566')} and ${channelMention(
						'1101476414479409172'
					)} for any updates!`,
					`\nthanks for joining doobies, hope you have a great stay! ${formatEmoji('1039799358318727238')}`
				].join('\n')
			);

		return (member.guild.channels.cache.get(guildSettings.welcome.channelId) as TextBasedChannel).send({
			embeds: [embed],
			files: [attachment]
		});
		//return (member.guild.channels.cache.get(guildSettings.welcome.channelId) as TextBasedChannel).send({ content: `Welcome to ${bold(member.guild.name)}, ${member.user}!`, files: [attachment] });
	}
}
