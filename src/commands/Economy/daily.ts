import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { dailyCooldown } from '../../lib/common/constants';
import { inlineCode, time } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Get your daily reward'
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => builder.setName(this.name).setDescription(this.description));
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const userSettings = await this.container.settings.getUserSetting(interaction.user.id);
		const lastClaim = userSettings.money?.lastClaimedDaily ?? Date.now();
		if (Date.now() - lastClaim < dailyCooldown) {
			const timeLeft = Math.round((lastClaim + dailyCooldown) / 1000);
			return interaction.reply({ content: `You can claim your daily reward in ${time(timeLeft, 'R')}` });
		}
		const dailyAmount = 1000;
		const newBalance = userSettings.money?.balance! + dailyAmount;

		await this.container.settings.setUserSetting(interaction.user.id, { money: { balance: newBalance, lastClaimedDaily: Date.now() } });
		return interaction.reply({ content: `${inlineCode('💰')} You claimed your daily reward of ${dailyAmount} coins!` });
	}
}
