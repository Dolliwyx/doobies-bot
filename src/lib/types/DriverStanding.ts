export interface F1DriverStanding {
	MRData: MRData;
}

interface MRData {
	xmlns: string;
	series: string;
	url: string;
	limit: string;
	offset: string;
	total: string;
	StandingsTable: StandingsTable;
}

interface StandingsTable {
	season: string;
	StandingsLists: StandingsList[];
}

interface StandingsList {
	season: string;
	round: string;
	DriverStandings: DriverStanding[];
}

interface DriverStanding {
	position: string;
	positionText: string;
	points: string;
	wins: string;
	Driver: Driver;
	Constructors: Constructor[];
}

interface Constructor {
	constructorId: string;
	url: string;
	name: string;
	nationality: string;
}

interface Driver {
	driverId: string;
	permanentNumber?: string;
	code: string;
	url: string;
	givenName: string;
	familyName: string;
	dateOfBirth: string;
	nationality: string;
}
