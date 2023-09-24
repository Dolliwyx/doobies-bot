import '#lib/setup';
import { container } from '@sapphire/framework';
import { DoobieClient } from '#lib/structures/DoobieClient';
import { Shoukaku, Connectors } from 'shoukaku';

const client = new DoobieClient();

container.shoukaku = new Shoukaku(
	new Connectors.DiscordJS(client),
	[
		{
			name: 'Lavalink',
			url: `${process.env.LAVALINK_URL}:${process.env.LAVALINK_PORT}`,
			auth: process.env.LAVALINK_AUTH
		}
	],
	{
		restTimeout: 10,
		reconnectInterval: 3,
		reconnectTries: 2
	}
);

const main = async () => {
	try {
		client.logger.info('Logging in');
		await client.login();
		client.logger.info('logged in');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();
