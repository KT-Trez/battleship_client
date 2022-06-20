import config from '../config';
import DOM from './DOM';
import API from './API';
import Renderer from './Renderer';
import gameEnded from './RendererManagerEvents/gameEnded';
import gameInit from './RendererManagerEvents/gameInit';
import gameStarted from './RendererManagerEvents/gameStarted';
import selectShip from './RendererManagerEvents/selectShip';
import SocketService from './Socket';


console.log('Loaded: RendererManager.ts');

export default class RendererManager {
	private board: {
		height: number,
		width: number
	};
	private currentPlayerID: string | null;
	private readonly engine: API;
	private readonly renderer: Renderer;
	private readonly shipsPlacer: ShipPlacer;
	private shipsPlacement: boolean;

	constructor(engine: API) {
		this.currentPlayerID = null;
		this.engine = engine;
		this.renderer = new Renderer();
		this.shipsPlacement = false;

		// todo: add new class for ship placement management
		this.shipsPlacer = {
			allowed: false,
			horizontal: false,
			length: null,
			preview: [],
			shipsLeft: []
		};

		this.initListeners();
	}

	assignBoardDimensions(height: number, width: number) {
		this.board = {
			height,
			width
		};
	}

	clearDisplay() {
		const display = document.getElementById('js-display');
		const children = Array.from(display.children);
		for (let i = 0; i < children.length; i++)
			children[i].remove();
	}

	clearShipPreview() {
		for (const shipTile of this.shipsPlacer.preview)
			shipTile.classList.remove('ship-preview--collision', 'ship-preview--correct', 'ship-preview--incorrect');
		this.shipsPlacer.preview = [];
	}

	private colorPath(pathArr: { x: number, y: number }[], colorClassName: string) {
		for (const placementData of pathArr) {
			const tileDOM = document.querySelector<HTMLTableCellElement>(`[data-x='${placementData.x}'][data-y='${placementData.y}']`);
			tileDOM.classList.add(colorClassName);
			this.shipsPlacer.preview.push(tileDOM);
		}
	}

	createShipsSelect() {
		const shipsContainerDOM = document.createElement('div');
		shipsContainerDOM.classList.add('ships-container');

		for (const shipData of config.ShipsList) {
			this.shipsPlacer.shipsLeft.push({
				length: shipData.length,
				quantity: shipData.quantity
			});

			const ship = document.createElement('div');
			Object.assign(ship, {
				className: 'ship-select js-ship-' + shipData.length,
				onclick: (event: MouseEvent & { target: HTMLDivElement }) => selectShip.apply(this, [event, shipData])
			});

			shipsContainerDOM.appendChild(ship);

			DOM.createDynamicElement('p', {
				innerText: shipData.quantity + 'x'
			}, ship, 'ship-' + shipData.length);
		}

		const buttonsContainerDOM = DOM.newCreateElement('div', 'select-buttons', null, shipsContainerDOM);
		const placeRandomButtonDOM = DOM.newCreateElement('button', 'select-button', 'Umieść losowo', buttonsContainerDOM);
		placeRandomButtonDOM.onclick = () => {
			// todo: move all sockets to engine
			SocketService.getInstance().emit('registerShipsRandom', parseInt(sessionStorage.getItem('roomID')), forceArr => {
				this.renderer.renderStartButton(this.engine.toggleIsClientReady);
				this.colorPath(forceArr, 'ship--ally');
			});
		};

		document.getElementById('js-display').appendChild(shipsContainerDOM);
	}

	initListeners() {
		this.engine.events
			.addEventListener('createShipsSelect', () => this.createShipsSelect());

		this.engine.events.addEventListener('game-init', event => gameInit.call(this, event));

		this.engine.events.addEventListener('game-started', event => gameStarted.call(this, event));

		this.engine.events
			.addEventListener('ships-placed', () => this.renderer.renderStartButton(this.engine.toggleIsClientReady));

		this.engine.events.addEventListener('game-shot', (event: GameShot) => {
				this.renderer.renderTileShot(event.detail.shooterID, event.detail.coordinates.x, event.detail.coordinates.y, event.detail.result, event.detail.victimsIDs);
			});

		this.engine.events.addEventListener('game-next_turn', (event: GameNextTurn) => {
				this.currentPlayerID = event.detail.leadPlayerID;
				this.renderer.renderTurn(event.detail.leadPlayerID, event.detail.turnUptime.startedAt, event.detail.turnUptime.duration);
			});

		this.engine.events.addEventListener('game-win', event => gameEnded.call(this, event));
	}

	async renderShipPreview(x: number, y: number) {
		if (!this.shipsPlacer.length)
			return
		if ((y + this.shipsPlacer.length > this.board.height && !this.shipsPlacer.horizontal) || (x + this.shipsPlacer.length > this.board.width && this.shipsPlacer.horizontal))
			return;

		const placementResponse = await this.engine.checkPath(x, y, this.shipsPlacer.horizontal, this.shipsPlacer.length);
		this.shipsPlacer.allowed = placementResponse.isPlacementAvailable;

		this.colorPath(placementResponse.tilesContactingObstacles, 'ship-preview--collision')
		this.colorPath(placementResponse.tilesWithCorrectPlacement, 'ship-preview--correct');
		this.colorPath(placementResponse.tilesAlreadyTaken, 'ship-preview--incorrect');
	}
}