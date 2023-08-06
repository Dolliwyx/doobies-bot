import { URL } from 'node:url';

export const rootDir = new URL('../../../', import.meta.url);
export const srcDir = new URL('src/', rootDir);
export const assetDir = new URL('assets/', srcDir);

export const RandomLoadingMessage = ['Computing...', 'Thinking...', 'Cooking some food', 'Give me a moment', 'Loading...'];

export const dailyCooldown = 86400000;

export const eightBallAnswers = [
    'It is certain.',
    'It is decidedly so.',
    'Without a doubt.',
    'Yes - definitely.',
    'You may rely on it.',
    'As I see it, yes.',
    'Most likely.',
    'Outlook good.',
    'Yes.',
    'Signs point to yes.',
    'Reply hazy, try again.',
    'Ask again later.',
    'Better not tell you now...',
    'No',
    'My sources say no.',
    'Outlook not so good...',
    'Very doubtful.',
    'Maybe',
    'I don\'t know',
    'I don\'t think so',
    'I don\'t know, maybe',
    'I don\'t know, maybe not'
];