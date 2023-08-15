import { ApplyOptions } from "@sapphire/decorators";
import { Listener, container } from "@sapphire/framework";
import { RESTEvents, type RateLimitData } from "discord.js";

@ApplyOptions<Listener.Options>({
    emitter: container.client.rest,
    event: RESTEvents.RateLimited
})
export class UserEvent extends Listener {
    public run(data: RateLimitData) {
        this.container.logger.error(`[RATELIMIT] ${data.method} ${data.route} ${data.timeToReset}ms`)
    }
}