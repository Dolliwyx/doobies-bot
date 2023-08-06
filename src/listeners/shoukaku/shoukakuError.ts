import { ApplyOptions } from "@sapphire/decorators";
import { Listener, container } from "@sapphire/framework";

@ApplyOptions<Listener.Options>({
    event: 'error',
    emitter: container.shoukaku
})
export class ShoukakuListener extends Listener {
    public override run(_: unknown, error: Error) {
        this.container.logger.error(`LAVALINK: ${error}`);
    }
}