import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { GatewayIntentBits, Message, Partials } from 'discord.js';

export class DoobieClient extends SapphireClient {
	public constructor() {
		super({
			defaultPrefix: 'd!',
			regexPrefix: /^(hey +)?doobie[,! ]/i,
			typing: true,
			loadMessageCommandListeners: true,
			shards: 'auto',
			logger: {
				level: LogLevel.Debug
			},
			intents: [
				GatewayIntentBits.DirectMessageReactions,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.GuildModeration,
				GatewayIntentBits.GuildEmojisAndStickers,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.MessageContent
			],
			partials: [Partials.Channel]
		});
	}

	public override async login(token?: string) {
		this.logger.info('Readying database...');
		container.settings.init();
		container.settings.getDb.on('error', (err) => this.logger.error(`An error occured! ${err}`));

		return super.login(token);
	}

	public override async destroy() {
		this.logger.info('Disconnecting from database...');
		await container.settings._disconnect();

		return super.destroy();
	}

	public override fetchPrefix = async (message: Message) => {
		const guildSettings = await container.settings.getGuildSetting(message.guild!.id);
		const prefix = guildSettings.prefix ?? this.options.defaultPrefix;

		return prefix as string;
	};
}
