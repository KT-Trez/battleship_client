interface CreateBoardEvent extends CustomEvent {
	detail: {
		height: number;
		width: number;
	}
}

interface ShipsPlacedEvent extends CustomEvent {
	detail: {
		toggleReadyStatusFun: Function;
	}
}

interface ToggleShipsInputEvent extends CustomEvent {
	detail: {
		checkPathFun: Function;
		registerShipFun: Function;
	}
}