import { ModOnly } from '#lib/decorators/ModOnly';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { EmbedBuilder, inlineCode, time, type Message, userMention } from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	description: 'Show a tag in this server',
	subcommands: [
		{ name: 'show', chatInputRun: 'interactionShow', default: true },
		{ name: 'info', chatInputRun: 'interactionInfo' },
		{ name: 'create', messageRun: 'messageCreate' },
		{ name: 'delete', messageRun: 'messageDelete' },
		{ name: 'edit', messageRun: 'messageEdit' }
	]
})
export class UserCommand extends Subcommand {
	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('show')
						.setDescription('Show the selected tag and send it to the channel')
						.addStringOption((option) =>
							option.setName('name').setDescription('The name of the tag').setRequired(true).setAutocomplete(true)
						)
						.addUserOption((option) => option.setName('user').setDescription('The user to show the tag for'))
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('info')
						.setDescription('View information about a tag')
						.addStringOption((option) =>
							option.setName('name').setDescription('The name of the tag').setRequired(true).setAutocomplete(true)
						)
				)
		);
	}

	public async interactionShow(interaction: Subcommand.ChatInputCommandInteraction) {
		const tagName = interaction.options.getString('name', true);
		const targetUser = interaction.options.getUser('user');

		const { tags } = await this.container.settings.getGuildSetting(interaction.guildId!);
		if (!tags.length) return interaction.reply({ content: 'There are no tags in this server.', ephemeral: true });

		const tag = tags.find((t) => t?.name === tagName);
		if (!tag) return interaction.reply({ content: `There is no tag with the name ${inlineCode(tagName)}`, ephemeral: true });

		const content = targetUser ? `${targetUser}\n\n${tag.content}` : tag.content;
		return interaction.reply({ content, allowedMentions: { users: targetUser ? [targetUser.id] : undefined } });
	}

	public async interactionInfo(interaction: Subcommand.ChatInputCommandInteraction) {
		const tagName = interaction.options.getString('name', true);

		const { tags } = await this.container.settings.getGuildSetting(interaction.guildId!);
		if (!tags.length) return interaction.reply({ content: 'There are no tags in this server.', ephemeral: true });

		const tag = tags.find((t) => t?.name === tagName);
		if (!tag) return interaction.reply({ content: `There is no tag with the name ${inlineCode(tagName)}`, ephemeral: true });

		tag.createdAt = Math.floor(tag.createdAt / 1000);
		tag.updatedAt = Math.floor(tag.updatedAt / 1000);

		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setAuthor({ name: tag.name, iconURL: interaction.guild?.iconURL()! })
					.addFields(
						{ name: 'Created by', value: userMention(tag.author), inline: true },
						{ name: 'Created at:', value: `${time(tag.createdAt, 'f')} (${time(tag.createdAt, 'R')})`, inline: true },
						{ name: 'Last updated:', value: `${time(tag.updatedAt, 'f')} (${time(tag.updatedAt, 'R')})`, inline: true }
					)
					.setFooter({ text: `Requested by ${interaction.user.username}` })
					.setTimestamp()
			]
		});
	}

	@ModOnly()
	public async messageCreate(message: Message, args: Args) {
		const tagName = await args.pick('string');
		if (!tagName) return message.reply('You must provide a tag name.');
		const tagContent = await args.rest('string');
		if (!tagContent) return message.reply('You must provide a tag content.');

		const { tags } = await this.container.settings.getGuildSetting(message.guildId!);
		if (tags.some((t) => t?.name.toLowerCase() === tagName.toLowerCase()))
			return message.reply(`There is already a tag with the name ${inlineCode(tagName)}`);

		const tag = { name: tagName, content: tagContent, author: message.author.id, createdAt: Date.now(), updatedAt: Date.now() };
		await this.container.settings.setGuildSetting(message.guildId!, { tags: [...tags, tag] });

		return message.reply(`Successfully created the tag ${inlineCode(tagName)}`);
	}

	@ModOnly()
	public async messageDelete(message: Message, args: Args) {
		const tagName = await args.pick('string');
		if (!tagName) return message.reply('You must provide a tag name.');

		const { tags } = await this.container.settings.getGuildSetting(message.guildId!);
		if (!tags.some((t) => t?.name === tagName)) return message.reply(`There is no tag with the name ${inlineCode(tagName)}`);

		await this.container.settings.setGuildSetting(message.guildId!, {
			tags: tags.filter((t) => t?.name.toLowerCase() !== tagName.toLowerCase())
		});

		return message.reply(`Successfully deleted the tag ${inlineCode(tagName)}`);
	}

	@ModOnly()
	public async messageEdit(message: Message, args: Args) {
		const tagName = await args.pick('string');
		if (!tagName) return message.reply('You must provide a tag name.');
		const tagContent = await args.rest('string');
		if (!tagContent) return message.reply('You must provide a tag content.');

		const { tags } = await this.container.settings.getGuildSetting(message.guildId!);
		if (!tags.some((t) => t?.name.toLowerCase() === tagName.toLowerCase()))
			return message.reply(`There is no tag with the name ${inlineCode(tagName)}`);

		const tag = tags.find((t) => t?.name.toLowerCase() === tagName.toLowerCase())!;
		tag.content = tagContent;
		tag.updatedAt = Date.now();

		await this.container.settings.setGuildSetting(message.guildId!, { tags: tags.filter((t) => t?.name !== tagName).concat(tag) });

		return message.reply(`Successfully edited the tag ${inlineCode(tagName)}`);
	}

	public override async autocompleteRun(interaction: Subcommand.AutocompleteInteraction) {
		const { tags } = await this.container.settings.getGuildSetting(interaction.guildId!);
		if (!tags.length) return;
		const subcommand = interaction.options.getSubcommand(true);
		const option = interaction.options.getFocused(true);
		if (['show', 'info'].includes(subcommand) && option.name === 'name') {
			return interaction.respond(tags.map((tag) => ({ name: `🔗 ${tag!.name}`, value: tag!.name })));
		}
	}
}
