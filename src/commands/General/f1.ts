import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { Stopwatch } from '@sapphire/stopwatch';
import { bold, EmbedBuilder, inlineCode, time, type APIEmbedField, type TimestampStylesString } from 'discord.js';
import { fetch } from 'undici';
import type { F1ConstructorStanding, F1DriverStanding, F1RaceResult, F1Schedule } from '#lib/types/index';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';

const API_URL = 'https://ergast.com/api/f1';

@ApplyOptions<Subcommand.Options>({
	description: 'View races, drivers, and more on the F1 motorsport.',
	subcommands: [
		{ name: 'nextrace', chatInputRun: 'interactionNextRace' },
		{ name: 'lastrace', chatInputRun: 'interactionLastRace' },
		{ name: 'standings', chatInputRun: 'interactionStandings' },
		{ name: 'schedule', chatInputRun: 'interactionSchedule' },
		{ name: 'results', chatInputRun: 'interactionResults' }
	]
})
export class UserCommand extends Subcommand {
	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand((subcommand) => subcommand.setName('nextrace').setDescription('Display information about the next race'))
				.addSubcommand((subcommand) => subcommand.setName('lastrace').setDescription('View the results of the last race'))
				.addSubcommand((subcommand) =>
					subcommand
						.setName('standings')
						.setDescription('View the driver and constructor standings of a given or current season')
						.addNumberOption((option) => option.setName('season').setDescription('The season year').setMinValue(1950).setMaxValue(2023))
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('schedule')
						.setDescription('View the schedule of a given or current season')
						.addNumberOption((option) => option.setName('season').setDescription('The season year').setMinValue(1950).setMaxValue(2023))
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('results')
						.setDescription('View the result of a specific race')
						.addNumberOption((option) => option.setName('round').setDescription('The round number').setRequired(true))
						.addNumberOption((option) => option.setName('season').setDescription('The season year').setMinValue(1950).setMaxValue(2023))
				)
		);
	}

	public async interactionNextRace(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const timer = new Stopwatch();
		const data = (await fetch(`${API_URL}/current/next.json`).then((res) => res.json())) as F1Schedule;
		if (!data) return interaction.editReply('No data found.');
		const {
			MRData: {
				RaceTable: { Races, round, season }
			}
		} = data;
		const [race] = Races;

		const fields: APIEmbedField[] = [
			{
				name: 'Circuit',
				value: race.Circuit.circuitName,
				inline: true
			},
			{
				name: 'Location',
				value: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
				inline: true
			},
			{ name: 'Time', value: this.parseTime(race.date, race.time ?? null) }
		];
		if (race.FirstPractice)
			fields.push({
				name: 'Schedule',
				value: race.ThirdPractice
					? [
							`${bold('First Practice')}: ${this.parseTime(race.FirstPractice.date, race.FirstPractice.time)}`,
							`${bold('Second Practice')}: ${this.parseTime(race.SecondPractice.date, race.SecondPractice.time)}`,
							`${bold('Third Practice')}: ${this.parseTime(race.ThirdPractice.date, race.ThirdPractice.time)}`,
							`${bold('Qualifying')}: ${this.parseTime(race.Qualifying.date, race.Qualifying.time)}`
					  ].join('\n')
					: [
							`${bold('First Practice')}: ${this.parseTime(race.FirstPractice.date, race.FirstPractice.time)}`,
							`${bold('Qualifying')}: ${this.parseTime(race.Qualifying.date, race.Qualifying.time)}`,
							`${bold('Second Practice')}: ${this.parseTime(race.SecondPractice.date, race.SecondPractice.time)}`,
							`${bold('Sprint')}: ${this.parseTime(race.Sprint.date, race.Sprint.time)}`
					  ].join('\n')
			});
		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor('#f00808')
					.setThumbnail('https://cdn-icons-png.flaticon.com/512/2418/2418779.png')
					.setTitle(`Season ${season} Round ${round}: ${race.raceName}`)
					.addFields(fields)
					.setFooter({
						text: `Powered by Ergast API | Took ${timer.stop()}`
					})
			]
		});
	}

	public async interactionLastRace(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const stopwatch = new Stopwatch();
		const data = (await fetch(`${API_URL}/current/last/results.json`).then((res) => res.json())) as F1RaceResult;
		if (!data) return interaction.editReply('No data found.');
		const {
			MRData: {
				RaceTable: { Races, round, season }
			}
		} = data;
		const [race] = Races;

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor('#f00808')
					.setThumbnail('https://cdn-icons-png.flaticon.com/512/2418/2418779.png')
					.setTitle(`Season ${season} Round ${round}: ${race.raceName}`)
					.addFields(
						{
							name: 'Circuit',
							value: race.Circuit.circuitName,
							inline: true
						},
						{
							name: 'Location',
							value: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
							inline: true
						},
						{ name: 'Time', value: this.parseTime(race.date, race.time), inline: true },
						{
							name: 'Results',
							value: race.Results.map(
								(r) =>
									`${inlineCode(r.position.padStart(2, '0'))}. ${bold(`${r.Driver.givenName} ${r.Driver.familyName}`)} (${
										r.Constructor.name
									}) [${
										r.status === 'Finished' ? inlineCode(r.Time?.time!) : r.status.includes('Lap') ? r.status : `DNF, ${r.status}`
									}]`
							).join('\n')
						}
					)
					.setFooter({
						text: `Powered by Ergast API | Took ${stopwatch.stop()}`
					})
			]
		});
	}

	public async interactionStandings(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const timer = new Stopwatch();
		const year = interaction.options.getNumber('season') ?? 'current';
		const driverStandings = (await fetch(`${API_URL}/${year}/driverStandings.json`).then((res) => res.json())) as F1DriverStanding;
		const constructorStandings = (await fetch(`${API_URL}/${year}/constructorStandings.json`).then((res) => res.json())) as F1ConstructorStanding;
		const {
			MRData: {
				StandingsTable: { season, StandingsLists: drivers }
			}
		} = driverStandings;

		const {
			MRData: {
				StandingsTable: { StandingsLists: constructors }
			}
		} = constructorStandings;

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor('#f00808')
					.setThumbnail('https://cdn-icons-png.flaticon.com/512/2418/2418779.png')
					.setTitle(`Season ${season} Standings`)
					.setDescription(
						[
							'### Driver Standings\n',
							drivers.length
								? drivers[0].DriverStandings.map(
										(d) =>
											`${inlineCode(d.position.padStart(2, '0'))} ${bold(`${d.Driver.givenName} ${d.Driver.familyName}`)} (${
												d.Constructors[0].name
											}) - ${bold(d.points)} points`
								  ).join('\n')
								: 'No data found.',
							constructors.length
								? `### Constructor Standings\n${constructors[0].ConstructorStandings.map(
										(c) => `${inlineCode(c.position.padStart(2, '0'))} ${bold(c.Constructor.name)} - ${bold(c.points)} points`
								  ).join('\n')}`
								: ''
						].join('\n')
					)
					.setFooter({
						text: `Powered by Ergast API | Took ${timer.stop()}`
					})
			]
		});
	}

	public async interactionSchedule(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const year = interaction.options.getNumber('season') ?? 'current';
		const timer = new Stopwatch();
		const data = (await fetch(`${API_URL}/${year}.json`).then((res) => res.json())) as F1Schedule;
		if (!data.MRData.RaceTable.Races.length) return interaction.editReply('No data found.');
		const {
			MRData: {
				RaceTable: { season, Races }
			}
		} = data;

		const paginatedMessage = new PaginatedMessage({
			template: new EmbedBuilder()
				.setColor('#f00808')
				.setThumbnail('https://cdn-icons-png.flaticon.com/512/2418/2418779.png')
				.setAuthor({
					name: `Season ${season} Schedule`
				})
				.setFooter({
					text: `Powered by Ergast API | Took ${timer.stop()}`
				})
		});

		for (const race of Races) {
			const fields: APIEmbedField[] = [
				{
					name: 'Circuit',
					value: race.Circuit.circuitName,
					inline: true
				},
				{
					name: 'Location',
					value: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
					inline: true
				},
				{ name: 'Time', value: this.parseTime(race.date, race.time ?? null) }
			];
			if (race.FirstPractice)
				fields.push({
					name: 'Schedule',
					value: race.ThirdPractice
						? [
								`${bold('First Practice')}: ${this.parseTime(race.FirstPractice.date, race.FirstPractice.time)}`,
								`${bold('Second Practice')}: ${this.parseTime(race.SecondPractice.date, race.SecondPractice.time)}`,
								`${bold('Third Practice')}: ${this.parseTime(race.ThirdPractice.date, race.ThirdPractice.time)}`,
								`${bold('Qualifying')}: ${this.parseTime(race.Qualifying.date, race.Qualifying.time)}`
						  ].join('\n')
						: [
								`${bold('First Practice')}: ${this.parseTime(race.FirstPractice.date, race.FirstPractice.time)}`,
								`${bold('Qualifying')}: ${this.parseTime(race.Qualifying.date, race.Qualifying.time)}`,
								`${bold('Second Practice')}: ${this.parseTime(race.SecondPractice.date, race.SecondPractice.time)}`,
								`${bold('Sprint')}: ${this.parseTime(race.Sprint.date, race.Sprint.time)}`
						  ].join('\n')
				});
			paginatedMessage.addPageEmbed((embed) => embed.setTitle(race.raceName).addFields(fields));
		}

		return paginatedMessage.run(interaction, interaction.user);
	}

	public async interactionResults(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const round = interaction.options.getNumber('round', true);
		const year = interaction.options.getNumber('season') ?? 'current';
		const stopwatch = new Stopwatch();
		const data = (await fetch(`${API_URL}/${year}/${round}/results.json`)
			.then((res) => res.json())
			.catch(() => null)) as F1RaceResult;
		if (!data || !data.MRData.RaceTable.Races.length) return interaction.editReply('Invalid round number.');
		const {
			MRData: {
				RaceTable: { season, Races }
			}
		} = data;

		const [race] = Races;

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor('#f00808')
					.setThumbnail('https://cdn-icons-png.flaticon.com/512/2418/2418779.png')
					.setTitle(`Season ${season} Round ${round}: ${race.raceName}`)
					.setDescription(
						[
							`${bold('Circuit')}: ${race.Circuit.circuitName}`,
							`${bold('Location')}: ${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
							`${bold('Time')}: ${this.parseTime(race.date, race.time ?? null)}`,
							`${bold('Results')}:\n${race.Results.map(
								(r) =>
									`${inlineCode(r.position.padStart(2, '0'))} ${bold(`${r.Driver.givenName} ${r.Driver.familyName}`)} (${
										r.Constructor.name
									}) [${
										r.status === 'Finished' ? inlineCode(r.Time?.time!) : r.status.includes('Lap') ? r.status : `DNF, ${r.status}`
									}]`
							).join('\n')}`
						].join('\n')
					)
					.setFooter({
						text: `Powered by Ergast API | Took ${stopwatch.stop()}`
					})
			]
		});
	}

	public parseTime(raceDate: string, raceTime: string | null, style: TimestampStylesString = 'F') {
		return time(new Date(`${raceDate}${raceTime ? `T${raceTime}` : ''}`), raceTime ? style : 'D');
	}
}
