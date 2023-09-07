export interface F1RaceResult {
	MRData: MRData;
}

interface MRData {
	xmlns: string;
	series: string;
	url: string;
	limit: string;
	offset: string;
	total: string;
	RaceTable: RaceTable;
}

interface RaceTable {
	season: string;
	round: string;
	Races: Race[];
}

interface Race {
	season: string;
	round: string;
	url: string;
	raceName: string;
	Circuit: Circuit;
	date: string;
	time: string;
	Results: Result[];
}

interface Result {
	number: string;
	position: string;
	positionText: string;
	points: string;
	Driver: Driver;
	Constructor: Constructor;
	grid: string;
	laps: string;
	status: string;
	Time?: Time;
	FastestLap?: FastestLap;
}

interface FastestLap {
	rank: string;
	lap: string;
	Time: Time2;
	AverageSpeed: AverageSpeed;
}

interface AverageSpeed {
	units: string;
	speed: string;
}

interface Time2 {
	time: string;
}

interface Time {
	millis: string;
	time: string;
}

interface Constructor {
	constructorId: string;
	url: string;
	name: string;
	nationality: string;
}

interface Driver {
	driverId: string;
	permanentNumber: string;
	code: string;
	url: string;
	givenName: string;
	familyName: string;
	dateOfBirth: string;
	nationality: string;
}

interface Circuit {
	circuitId: string;
	url: string;
	circuitName: string;
	Location: Location;
}

interface Location {
	lat: string;
	long: string;
	locality: string;
	country: string;
}
