import DOM from '../DOM';


export default async function boardCellClick(event: MouseEvent & { target: HTMLTableCellElement }) {
	if (this.shipsPlacer.length <= 0)
		return;

	const shipLength = this.shipsPlacer.length;
	const chosenShip = this.shipsPlacer.shipsLeft.find((ship: { length: number, quantity: number }) => ship.length === this.shipsPlacer.length);

	const placementCheck = await this.engine.checkPath(parseInt(event.target.dataset.x), parseInt(event.target.dataset.y), this.shipsPlacer.horizontal, this.shipsPlacer.length);
	if (!placementCheck.available)
		return;

	this.engine.registerShip(parseInt(event.target.dataset.x), parseInt(event.target.dataset.y), this.shipsPlacer.horizontal, this.shipsPlacer.length);

	this.shipsPlacer.shipsLeft.map((ship: { quantity: number; length: number }) => {
		if (ship.length === this.shipsPlacer.length)
			return {
				...ship,
				length: ship.quantity--
			};
		else
			return ship;
	});
	Object.assign(this.shipsPlacer, {
		allowed: false,
		horizontal: false,
		length: null
	});

	DOM.updateDynamicElement('ship-' + shipLength, {
		innerText: this.shipsPlacer.shipsLeft.find((ship: { length: number, quantity: number }) => ship.length === shipLength).quantity + 'x'
	});
	if (chosenShip.quantity === 0)
		document.getElementsByClassName('js-ship-' + shipLength).item(0).classList.add('ship-select--used');
	this.colorPath(placementCheck.correctPath, 'ship--ally');
	this.clearShipPreview();
}