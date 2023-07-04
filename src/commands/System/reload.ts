import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Stopwatch } from '@sapphire/stopwatch';
import type { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	aliases: ['r'],
	description: 'Reloads a piece, or all pieces of a given type.',
	preconditions: ['OwnerOnly']
})
export class UserCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const params = await args.rest('string').catch(() => null);
		if (!params) return send(message, 'Please provide a piece type and/or name.');

		const stopwatch = new Stopwatch();

		if (params === 'all') {
			await this.reloadAll();
			return send(message, `Reloaded all pieces. (Took: ${stopwatch.stop()})`);
		}

		const store = this.locateStore(params);

		if (store) {
			await store.loadAll();
			return send(message, `Reloaded all ${store.name}. (Took: ${stopwatch.stop()})`);
		}

		const piece = this.locatePiece(params);
		if (piece) {
			await piece.reload();
			return send(message, `Reloaded ${piece.name}. (Took: ${stopwatch.stop()})`);
		} else {
			return send(message, 'Could not find that piece.');
		}
	}

	private locatePiece(params: string) {
		for (const store of this.container.stores.values()) {
			const piece = store.get(params);
			if (piece) return piece;
		}
		return null;
	}

	private locateStore(params: string) {
		for (const store of this.container.stores.values()) if (store.name === params) return store;
		return null;
	}

	private async reloadAll() {
		return this.container.stores.mapValues(async (store) => await store.loadAll());
	}
}
