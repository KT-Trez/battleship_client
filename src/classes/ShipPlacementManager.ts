import API from './API';


console.log('Loaded: ShipPlacementManager.ts');

// todo: introduce ShipPlacementManager to RendererManager
export default class ShipPlacementManager {
	private api: API;

	isCorrect: boolean;
	private isHorizontal: boolean;
	private readonly shipLength: number;

	constructor(api: API, shipLength: number) {
		this.api = api;
		this.isHorizontal = false;
		this.shipLength = shipLength;
	}

	async checkPlacement(x: number, y: number) {
		const placementInfo = await this.api.checkPath(x, y, this.isHorizontal, this.shipLength);
		this.isCorrect = placementInfo.isPlacementAvailable;
		return placementInfo;
	}

	changeShipAxis() {
		this.isHorizontal = !this.isHorizontal;
	}

	async placeShip(x: number, y: number, shipsLeftArr: ShipData[]) {
		// check if placement is correct
		await this.checkPlacement(x, y);
		if (!this.isCorrect)
			return;

		// register ship and lower its quantity
		this.api.registerShip(x, y, this.isHorizontal, this.shipLength);
		shipsLeftArr.map(ship => {
			if (ship.length === this.shipLength)
				return {
					...ship,
					quantity: ship.quantity--
				};
			else
				return ship;
		});
	}
}