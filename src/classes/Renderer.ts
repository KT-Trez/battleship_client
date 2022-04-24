import config from '../config';
import DOM from './DOM';
import Engine from './Engine';
import SocketService from './Socket';


export default class Renderer {
	private board: {
		height: number,
		width: number
	};
	private readonly engine: Engine;
	private readonly shipsPlacer: ShipPlacer;
	private shipsPlacement: boolean;

	constructor(engine: Engine) {
		this.engine = engine;
		this.shipsPlacement = false;

		this.shipsPlacer = {
			allowed: false,
			horizontal: false,
			length: null,
			preview: [],
			shipsLeft: []
		};

		this.initListeners();
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
		const shipsContainer = document.createElement('div');
		Object.assign(shipsContainer, {
			className: 'ships-container'
		});

		for (const shipData of config.ShipsList) {
			this.shipsPlacer.shipsLeft.push({
				length: shipData.length,
				quantity: shipData.quantity
			});

			const ship = document.createElement('div');
			Object.assign(ship, {
				className: 'js-ship-' + shipData.length,
				onclick: (event: MouseEvent & { target: HTMLDivElement }) => {
					const ship = this.shipsPlacer.shipsLeft.find(ship => ship.length === shipData.length);

					if (ship.quantity <= 0) {
						event.target.onclick = null;
						return;
					}

					this.shipsPlacer.length = shipData.length;
				}
			});

			shipsContainer.appendChild(ship);

			DOM.createDynamicElement('p', {
				innerText: shipData.quantity + 'x'
			}, ship, 'ship-' + shipData.length);
		}

		document.getElementById('js-display').appendChild(shipsContainer);
	}

	initListeners() {
		this.engine.eventsInterface
			.addEventListener('createBoard', (event: CreateBoardEvent) => {
				this.clearDisplay();
				this.renderBoard(event.detail.height, event.detail.width);
			});

		this.engine.eventsInterface
			.addEventListener('toggleShipsInput', (event: ToggleShipsInputEvent) => this.toggleShipsInput(event.detail.checkPathFun, event.detail.registerShipFun));

		this.engine.eventsInterface
			.addEventListener('createShipsSelect', () => this.createShipsSelect());

		this.engine.eventsInterface
			.addEventListener('game-started', () => {
				this.clearDisplay();

				const navDOM = DOM.createElement('nav', {}, document.getElementById('js-display'));

				// todo:  render players list
				//for (const navDOMElement of navDOM) {
				//
				//}
				DOM.createDynamicElement('p', {}, navDOM, 'info-turn');

				// timer & room ID
				const infoContainerDOM = DOM.execute('div;;info', navDOM);

				DOM.createDynamicElement('p', {
					className: 'info-timer'
				}, infoContainerDOM, 'info-timer');

				const roomIDDOM = DOM.execute('p;;info-id;;ID:', infoContainerDOM);
				DOM.execute(`span;;info-id--highlight;;${sessionStorage.getItem('roomID')}`, roomIDDOM);
				//	todo: handle rest of the boards
			});

		this.engine.eventsInterface
			.addEventListener('ships-placed', (event: ShipsPlacedEvent) => {
				DOM.createElement('button', {
					className: 'board-button--ready',
					innerText: 'Gotów',
					onclick: (clickEvent: MouseEvent & { target: HTMLButtonElement }) => {
						event.detail.toggleReadyStatusFun();
						clickEvent.target.innerText = 'Anuluj';
					}
				}, document.getElementById('js-display'));
			});
	}

	toggleShipsInput(checkPathFun: Function, registerShipFun: Function) {
		const clientFields = Array.from(document.getElementsByClassName('js-client-' + SocketService.getInstance().id)) as HTMLTableCellElement[];
		if (!this.shipsPlacement)
			for (let i = 0; i < clientFields.length; i++) { //noinspection JSUnusedGlobalSymbols
				Object.assign(clientFields[i], {
					onclick: async (event: MouseEvent & { target: HTMLTableCellElement }) => {
						if (this.shipsPlacer.length <= 0)
							return;

						const shipLength = this.shipsPlacer.length;

						const placementCheck = (await checkPathFun(parseInt(event.target.dataset.x), parseInt(event.target.dataset.y), this.shipsPlacer.horizontal, this.shipsPlacer.length));
						if (!placementCheck.available)
							return;

						registerShipFun(parseInt(event.target.dataset.x), parseInt(event.target.dataset.y), this.shipsPlacer.horizontal, this.shipsPlacer.length);

						this.shipsPlacer.shipsLeft.map(ship => {
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

						console.log(this.shipsPlacer.shipsLeft)
						DOM.updateDynamicElement('ship-' + shipLength, {
							innerText: this.shipsPlacer.shipsLeft.find(ship => ship.length === shipLength).quantity + 'x'
						});
						this.colorPath(placementCheck.correctPath, 'ship--ally');
						this.clearShipPreview();
					},
					oncontextmenu: async (event: MouseEvent & { target: HTMLTableCellElement }) => {
						event.preventDefault();
						this.shipsPlacer.horizontal = !this.shipsPlacer.horizontal;

						this.clearShipPreview();
						await this.renderShipPreview(parseInt(event.target.dataset.x), parseInt(event.target.dataset.y), checkPathFun);
					},
					onmouseout: () => {
						this.clearShipPreview();
					},
					onmouseover: async (event: MouseEvent & { target: HTMLTableCellElement }) => {
						await this.renderShipPreview(parseInt(event.target.dataset.x), parseInt(event.target.dataset.y), checkPathFun);
					}
				});
			}
		else
			for (let i = 0; i < clientFields.length; i++)
				Object.assign(clientFields[i], {
					onclick: null
				});
		this.shipsPlacement = !this.shipsPlacement;
	}

	renderBoard(height: number, width: number) {
		this.board = {
			height,
			width
		};
		const board = document.createElement('table');

		for (let i = 0; i < height; i++) {
			const row = document.createElement('tr');

			for (let j = 0; j < width; j++) {
				const cell = document.createElement('td');
				cell.setAttribute('data-x', j.toString());
				cell.setAttribute('data-y', i.toString());

				Object.assign(cell, {
					className: 'board-cell js-client-' + SocketService.getInstance().id
				});

				row.appendChild(cell);
			}

			board.appendChild(row);
		}

		document.getElementById('js-display').appendChild(board);
	}

	async renderShipPreview(x: number, y: number, checkPathFun: Function) {
		if (!this.shipsPlacer.length)
			return
		if ((y + this.shipsPlacer.length > this.board.height && !this.shipsPlacer.horizontal) || (x + this.shipsPlacer.length > this.board.width && this.shipsPlacer.horizontal))
			return;

		const placementResponse = await checkPathFun(x, y, this.shipsPlacer.horizontal, this.shipsPlacer.length);
		this.shipsPlacer.allowed = placementResponse.available;

		this.colorPath(placementResponse.adjoinTilesArr, 'ship-preview--collision')
		this.colorPath(placementResponse.correctPath, 'ship-preview--correct');
		this.colorPath(placementResponse.takenPath, 'ship-preview--incorrect');
	}
}