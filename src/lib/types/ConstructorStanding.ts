export interface F1ConstructorStanding {
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
	ConstructorStandings: ConstructorStanding[];
}

interface ConstructorStanding {
	position: string;
	positionText: string;
	points: string;
	wins: string;
	Constructor: Constructor;
}

interface Constructor {
	constructorId: string;
	url: string;
	name: string;
	nationality: string;
}
