import config from '../config';
import SocketService from './Socket';


export default class Engine {
	readonly eventsInterface: EventTarget = new EventTarget();

	private readyStatus = false;
	private readonly shipsCount: number;
	private shipsPlaced: number;
	private socketListenersEnabled = false;

	constructor() {
		this.shipsCount = 0;
		this.shipsPlaced = 0;

		for (const shipData of config.ShipsList)
			this.shipsCount += shipData.quantity;

		this.registerShip = this.registerShip.bind(this);
		this.toggleReadyStatus = this.toggleReadyStatus.bind(this);
	}

	private createAndDispatchEvent(name: string, data?: object) {
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
		this.createAndDispatchEvent('createBoard', {
			height: 10,
			width: 10
		});
		this.createAndDispatchEvent('toggleShipsInput', {
			checkPathFun: this.checkPath,
			registerShipFun: this.registerShip
		});

		this.createAndDispatchEvent('createShipsSelect');

		this.toggleSocketListeners();
	}

	private registerShip(x: number, y: number, horizontally: boolean, length: number) {
		SocketService.getInstance().emit('registerShip', parseInt(sessionStorage.getItem('roomID')), x, y, horizontally, length);
		this.shipsPlaced++;

		if (this.shipsPlaced === this.shipsCount)
			this.createAndDispatchEvent('ships-placed', {
				toggleReadyStatusFun: this.toggleReadyStatus
			});
	}

	private toggleReadyStatus() {
		this.readyStatus = !this.readyStatus;
		SocketService.getInstance().emit('startGame', parseInt(sessionStorage.getItem('roomID')), this.readyStatus);
	}

	private toggleSocketListeners() {
		this.socketListenersEnabled = !this.socketListenersEnabled;

		const gameStartedFun = () => {
			this.createAndDispatchEvent('game-started');
		};
		const hitFun = (shooterID: string, x: number, y: number, enemiesIDs: string[]) => {
		};
		const missFun = (shooterID: string, x: number, y: number) => {

		};
		const nextTurnFun = (playerID: string, startedAt: Date, duration: number) => {

		};
		const winFun = (playerID: string) => {

		};

		if (this.socketListenersEnabled) {
			SocketService.getInstance().on('gameStarted', gameStartedFun);
			SocketService.getInstance().on('hit', hitFun);
			SocketService.getInstance().on('miss', missFun);
			SocketService.getInstance().on('nextTurn', nextTurnFun);
			SocketService.getInstance().on('win', winFun);
		} else {
			SocketService.getInstance().off('hit', hitFun);
			SocketService.getInstance().off('gameStarted', gameStartedFun);
			SocketService.getInstance().off('miss', missFun);
			SocketService.getInstance().off('nextTurn', nextTurnFun);
			SocketService.getInstance().off('win', winFun);
		}
	}
}