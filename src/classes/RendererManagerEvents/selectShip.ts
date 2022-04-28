export default function selectShip(event: MouseEvent & { target: HTMLDivElement }, shipData: { length: number, quantity: number }) {
	const ship = this.shipsPlacer.shipsLeft.find((ship: { length: number, quantity: number }) => ship.length === shipData.length);

	if (ship.quantity <= 0) {
		event.target.onclick = null;
		return;
	}

	this.shipsPlacer.length = shipData.length;
}