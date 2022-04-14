import config from '../config';
import SocketService from './Socket';


export default class Engine {
	readonly eventsInterface: EventTarget = new EventTarget();
	private readonly shipsCount: number;
	private shipsPlaced: number;

	constructor() {
		this.shipsCount = 0;
		this.shipsPlaced = 0;

		for (const shipData of config.ShipsList)
			this.shipsCount += shipData.quantity;
	}

	private buildAndDispatchEvent(name: string, data?: object) {
		const event = new CustomEvent(name, {
			detail: data ?? null
		});
		this.eventsInterface.dispatchEvent(event);
	}

	private checkPath(x: number, y: number, horizontally: boolean, length: number): Promise<CheckPathResponse> {
		return new Promise(resolve => {
			SocketService.getInstance().emit('checkPath', parseInt(sessionStorage.getItem('roomID')), x, y, horizontally, length, response => {
				resolve(response);
			});
		});
	}

	init() {
		this.buildAndDispatchEvent('createBoard', {
			height: 10,
			width: 10
		});
		this.buildAndDispatchEvent('toggleShipsInput', {
			checkPathFun: this.checkPath,
			registerShipFun: this.registerShip
		});

		this.buildAndDispatchEvent('createShipsSelect');
	}

	private registerShip(x: number, y: number, horizontally: boolean, length: number) {
		SocketService.getInstance().emit('registerShip', parseInt(sessionStorage.getItem('roomID')), x, y, horizontally, length);
		// todo: fix 'this' context
		//this.shipsPlaced++;
	}
}