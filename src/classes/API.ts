import config from '../config';
import SocketService from './Socket';


console.log('Loaded: API.ts');

/**
 * API for Warships Online game.
 */
export default class API {
	/** Interface that dispatches game's events to frontend. */
	readonly events: EventTarget = new EventTarget();

	/** Status of a client in lobby. */
	private isClientReady = false;
	// todo: docs
	private readonly shipsCount: number;
	private shipsPlaced: number;
	private shotsFired = 0;
	private socketListenersEnabled = false;

	constructor() {
		this.shipsCount = 0;
		this.shipsPlaced = 0;

		// count all ships fragments
		// todo: move information about all ships quantity to server
		for (const shipData of config.ShipsList)
			this.shipsCount += shipData.quantity;

		// save class instance as 'this' context
		this.registerShip = this.registerShip.bind(this);
		this.registerShot = this.registerShot.bind(this);
		this.toggleIsClientReady = this.toggleIsClientReady.bind(this);
		// todo: secure all SocketService calls in case of incorrect data
	}

	/**
	 * Creates and dispatches event using class's EventTarget property.
	 * @param {string} name - event's name
	 * @param {object?} data - possible additional data that will be added to the event.
	 * @private
	 */
	private createAndDispatchEvent(name: string, data?: object) {
		const event = new CustomEvent(name, {
			detail: data ?? null
		});
		this.events.dispatchEvent(event);
	}

	// todo: docs
	checkPath(x: number, y: number, horizontally: boolean, length: number): Promise<PlacementData> {
		return new Promise(resolve => {
			SocketService.getInstance().emit('checkPath', parseInt(sessionStorage.getItem('roomID')), {
				x,
				y
			}, horizontally, length, response => {
				resolve(response);
			});
		});
	}

	/**
	 * ???
	 */
	// todo: docs
	startGame() {
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

	// todo: docs
	registerShip(x: number, y: number, horizontally: boolean, length: number) {
		SocketService.getInstance().emit('registerShip', parseInt(sessionStorage.getItem('roomID')), {
			x,
			y
		}, horizontally, length, status => {
			if (status) {
				this.shipsPlaced++;

				if (this.shipsPlaced === this.shipsCount)
					this.createAndDispatchEvent('ships-placed', {
						toggleReadyStatusFun: this.toggleIsClientReady
					});
			} else
				console.error('Couldn\'t register ship');
		});
	}

	// todo: docs
	registerShot(x: number, y: number) {
		this.shotsFired++;
		SocketService.getInstance().emit('registerShot', parseInt(sessionStorage.getItem('roomID')), {x, y}, hasHit => {
			console.log(hasHit);
		});
	}

	/**
	 * Toggles client's status in lobby.
	 * @returns {boolean} isClientReady - whether is client currently ready or not.
	 */
	toggleIsClientReady() {
		this.isClientReady = !this.isClientReady;
		SocketService.getInstance().emit('changeStatus', parseInt(sessionStorage.getItem('roomID')), this.isClientReady);
		return this.isClientReady;
	}

	/**
	 * Turns on/off all socket's incoming events.
	 * @private
	 */
	private toggleSocketListeners() {
		// todo: pass interfaces as args
		this.socketListenersEnabled = !this.socketListenersEnabled;

		// dispatched when one of the players wins
		const gameEndedFunction = (playerID: string) => {
			this.createAndDispatchEvent('game-ended', {
				winner: playerID
			});
		};
		// dispatched when game starts
		const gameStartedFunction = (players: Client[]) => {
			this.createAndDispatchEvent('game-started', {
				players
			});
		};
		// dispatched when there is new turn
		const nextTurnFunction = (playerID: string, startedAt: Date, duration: number) => {
			this.createAndDispatchEvent('game-next_turn', {
				leadPlayerID: playerID,
				turnUptime: {
					duration,
					startedAt
				}
			})
		};
		// dispatched when shot has been fired
		const shotFunction = (playerID: string, result: 'hit' | 'miss', coordinates: Coordinates, enemiesIDs: string[]) => {
			this.createAndDispatchEvent('game-shot', {
				coordinates,
				result,
				shooterID: playerID,
				victimsIDs: enemiesIDs
			})
		};

		// turn on/off all socket events
		if (this.socketListenersEnabled) {
			SocketService.getInstance().on('gameStarted', gameStartedFunction);
			SocketService.getInstance().on('nextTurn', nextTurnFunction);
			SocketService.getInstance().on('shot', shotFunction);
			SocketService.getInstance().on('win', gameEndedFunction);
		} else {
			SocketService.getInstance().off('gameStarted', gameStartedFunction);
			SocketService.getInstance().off('nextTurn', nextTurnFunction);
			SocketService.getInstance().off('shot', shotFunction);
			SocketService.getInstance().off('win', gameEndedFunction);
		}
	}
}