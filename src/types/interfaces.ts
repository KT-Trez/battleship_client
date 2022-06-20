interface CheckPathResponse {
	available: boolean;
	adjoinTilesArr: { x: number, y: number }[];
	correctPath: { x: number, y: number }[];
	takenPath: { x: number, y: number }[];
}

interface Client {
	id: string;
	nick: string;
}

interface Coordinates {
	x: number;
	y: number;
}

interface ShipPlacer {
	allowed: boolean;
	horizontal: boolean;
	length: number | null;
	preview: HTMLTableCellElement[];
	shipsLeft: { length: number; quantity: number }[];
}

interface ShipData {
	length: number;
	quantity: number;
}

interface PlacementData {
	isPlacementAvailable: boolean;
	tilesAlreadyTaken: Coordinates[];
	tilesContactingObstacles: Coordinates[];
	tilesWithCorrectPlacement: Coordinates[];
}