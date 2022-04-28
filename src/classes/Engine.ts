import config from '../config';
import SocketService from './Socket';


console.log('Loaded: Engine.ts');

export default class Engine {
	readonly eventsInterface: EventTarget = new EventTarget();

	private readyStatus = false;
	private readonly shipsCount: number;
	private shipsPlaced: number;
	private shotsFired = 0;
	private socketListenersEnabled = false;

	constructor() {
		this.shipsCount = 0;
		this.shipsPlaced = 0;

		for (const shipData of config.ShipsList)
			this.shipsCount += shipData.quantity;

		this.registerShip = this.registerShip.bind(this);
		this.toggleReadyStatus = this.toggleReadyStatus.bind(this);
		// todo: secure all SocketService calls in case of incorrect data
	}

	private createAndDispatchEvent(name: string, data?: object) {
		const event = new CustomEvent(name, {
			detail: data ?? null
		});
		this.eventsInterface.dispatchEvent(event);
	}

	checkPath(x: number, y: number, horizontally: boolean, length: number): Promise<CheckPathResponse> {
		return new Promise(resolve => {
			SocketService.getInstance().emit('checkPath', parseInt(sessionStorage.getItem('roomID')), x, y, horizontally, length, response => {
				resolve(response);
			});
		});
	}

	init() {
		this.createAndDispatchEvent('game-init', {
			board: {
				height: 10,
				width: 10
			}
		});

		// todo: move to game init in renderer
		this.createAndDispatchEvent('createShipsSelect');

		this.toggleSocketListeners();
	}

	registerShip(x: number, y: number, horizontally: boolean, length: number) {
		SocketService.getInstance().emit('registerShip', parseInt(sessionStorage.getItem('roomID')), x, y, horizontally, length);
		this.shipsPlaced++;

		if (this.shipsPlaced === this.shipsCount)
			this.createAndDispatchEvent('ships-placed', {
				toggleReadyStatusFun: this.toggleReadyStatus
			});
	}

	private registerShot(x: number, y: number) {
		this.shotsFired++;
		SocketService.getInstance().emit('registerShot', parseInt(sessionStorage.getItem('roomID')), x, y);
	}

	toggleReadyStatus() {
		this.readyStatus = !this.readyStatus;
		SocketService.getInstance().emit('startGame', parseInt(sessionStorage.getItem('roomID')), this.readyStatus);
	}

	private toggleSocketListeners() {
		this.socketListenersEnabled = !this.socketListenersEnabled;

		const gameStartedFun = (playersIDs: string[]) => {
			console.log(playersIDs);
			this.createAndDispatchEvent('game-started', {
				playersIDs,
				registerShotFun: this.registerShot
			});
		};
		const hitFun = (shooterID: string, x: number, y: number, enemiesIDs: string[]) => {
			this.createAndDispatchEvent('tile-hit', {
				coordinates: {
					x,
					y
				},
				enemiesIDs,
				shooterID
			});
		};
		const missFun = (shooterID: string, x: number, y: number) => {
			this.createAndDispatchEvent('tile-miss', {
				coordinates: {
					x,
					y
				},
				shooterID
			})
		};
		const nextTurnFun = (playerID: string, startedAt: Date, duration: number) => {
			console.log(playerID, startedAt, duration);
			this.createAndDispatchEvent('turn', {
				playerID,
				uptime: {
					duration,
					startedAt
				}
			})
		};
		const winFun = (playerID: string) => {
			this.createAndDispatchEvent('game-win', {
				playerID
			});
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