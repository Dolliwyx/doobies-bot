export interface F1Schedule {
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
	FirstPractice: Practice;
	SecondPractice: Practice;
	ThirdPractice: Practice;
	Qualifying: Practice;
	Sprint: Practice;
}

interface Practice {
	date: string;
	time: string;
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
