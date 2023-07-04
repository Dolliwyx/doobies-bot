import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { version as discordVersion } from 'discord.js';
import { version as sapphireVersion } from '@sapphire/framework';
import { DurationFormatter } from '@sapphire/time-utilities';
import { loadavg, uptime } from 'os';
import { codeBlock } from '@sapphire/utilities';

@ApplyOptions<Command.Options>({
	description: 'Show statistics about the bot'
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return interaction.reply({
			content: codeBlock(
				'asciidoc',
				[
					`= STATISTICS =`,
					`• Users     ::  ${this.container.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}`,
					`• Guilds    ::  ${this.container.client.guilds.cache.size.toLocaleString()}`,
					`• Channels  ::  ${this.container.client.channels.cache.size.toLocaleString()}`,
					`• Version   ::  v${discordVersion}`,
					`• Node JS   ::  ${process.version}`,
					`• Sapphire     ::  ${sapphireVersion}`,
					'',
					`= UPTIME =`,
					`• Host      ::  ${new DurationFormatter().format(uptime() * 1000)}`,
					`• Total     ::  ${new DurationFormatter().format(process.uptime() * 1000)}`,
					`• Client    ::  ${new DurationFormatter().format(this.container.client.uptime!)}`,
					'',
					`= USAGE =`,
					`• CPU Load  ::  ${Math.round(loadavg()[0] * 1000) / 100}%`,
					`• RAM +Node ::  ${Math.round(100 * (process.memoryUsage().heapTotal / 1048576)) / 100}MB`,
					`• RAM Used  ::  ${Math.round(100 * (process.memoryUsage().heapUsed / 1048576)) / 100}MB`
				].join('\n')
			)
		});
	}
}
