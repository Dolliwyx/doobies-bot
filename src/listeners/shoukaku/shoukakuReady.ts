import { ApplyOptions } from '@sapphire/decorators';
import { Listener, container } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: 'ready',
	emitter: container.shoukaku,
	once: true
})
export class ShoukakuListener extends Listener {
	public override run(name: string) {
		this.container.logger.info(`Lavalink Node: ${name} is now ready`);
	}
}
