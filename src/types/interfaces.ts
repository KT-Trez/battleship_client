interface CheckPathResponse {
	available: boolean;
	correctPath: { x: number, y: number }[];
	takenPath: { x: number, y: number }[];
}

interface CreateBoardEvent extends CustomEvent {
	detail: {
		height: number;
		width: number;
	}
}

interface ToggleShipsInputEvent extends CustomEvent {
	detail: {
		inputFun: Function;
	}
}

interface ShipPlacer {
	horizontal: boolean;
	length: number | null;
	preview: HTMLTableCellElement[];
	shipsLeft: { length: number; quantity: number }[];
}