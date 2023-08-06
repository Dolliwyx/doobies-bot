import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { AttachmentBuilder, EmbedBuilder, Events, GuildMember, bold, type TextBasedChannel } from 'discord.js';
import { getImage } from '#lib/utils';
import { assetDir } from '#lib/common/constants';
import { Canvas, loadFont, loadImage } from 'canvas-constructor/napi-rs';
import { request } from 'undici';

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
			middleY = height / 2;

		const background = await getImage(new URL('images/defaultBanner.jpg', assetDir).pathname);
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
			.setColor('#E3F2FF')
			.setTextAlign('center')
			.printCircle(250, middleY, 200)
			.printCircularImage(avatar, 250, middleY, 185)
			.setColor('#ffffff')
			.setShadowColor('#000000')
			.setShadowBlur(5)
			.setTextFont('bold 120px Bubbleboddy Fat')
			.printText('WELCOME', 825, 245)
			.process((canvas) => {
				let fontSize = 100;
				while (canvas.measureText(member.user.username.toUpperCase()).width > canvas.width - 450) canvas.setTextSize((fontSize -= 10));
				canvas.setTextSize((fontSize -= 10));
				return canvas.printText(member.user.username.toUpperCase(), 825, 350);
			})
			.process((canvas) => {
				let fontSize = 70;
				while (canvas.measureText(`You are our ${memberCount + suffix} member!`).width > canvas.width - 450)
					canvas.setTextSize((fontSize -= 10));
				canvas.setTextSize((fontSize -= 10));
				return canvas.printText(`You are our ${memberCount + suffix} member!`, 825, 440);
			})
			.webpAsync(100);

			const attachment = new AttachmentBuilder(await canvas, { name: 'welcome.webp' });

			const embed = new EmbedBuilder()
				.setColor('#E3F2FF')
				.setImage('attachment://welcome.webp')
				.setDescription([`${bold("welcome to doobies")}\n`,
				"check out the server rules over at <#1031459803949707355> and get yourself some roles over at <#1031459841333526578>!\n",
				"thank you for joining and we hope you have a great stay"].join('\n'))

		return (member.guild.channels.cache.get(guildSettings.welcome.channelId) as TextBasedChannel).send({ content: `hey ${member.user}!`,embeds: [embed], files: [attachment]})
		//return (member.guild.channels.cache.get(guildSettings.welcome.channelId) as TextBasedChannel).send({ content: `Welcome to ${bold(member.guild.name)}, ${member.user}!`, files: [attachment] });
	}
}
