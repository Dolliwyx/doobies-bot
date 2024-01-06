// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import { ApplicationCommandRegistries, RegisterBehavior, container } from '@sapphire/framework';
import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-subcommands/register';
// import '@sapphire/plugin-hmr/register';
import { setup } from '@skyra/env-utilities';
import * as colorette from 'colorette';
import { inspect } from 'util';
import { srcDir } from '#lib/common/constants';
import { QueueManager } from '#lib/structures/QueueManager';

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Read env var
setup(new URL('.env', srcDir));

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colorette
colorette.createColors({ useColor: true });

// Initialize queue manager
container.queue = new QueueManager();
