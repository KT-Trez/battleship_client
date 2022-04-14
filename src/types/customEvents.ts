interface CreateBoardEvent extends CustomEvent {
	detail: {
		height: number;
		width: number;
	}
}

interface ToggleShipsInputEvent extends CustomEvent {
	detail: {
		checkPathFun: Function;
		registerShipFun: Function;
	}
}