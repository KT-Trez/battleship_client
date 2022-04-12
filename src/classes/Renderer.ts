import config from '../config';
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
				onclick: () => {
					const ship = this.shipsPlacer.shipsLeft.find(ship => ship.length === shipData.length);

					if (ship.quantity <= 0)
						return;

					this.shipsPlacer.length = shipData.length;
					ship.quantity--;
				}
			});

			shipsContainer.appendChild(ship);
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
			.addEventListener('toggleShipsInput', (event: ToggleShipsInputEvent) => this.toggleShipsInput(event.detail.inputFun));
		this.engine.eventsInterface
			.addEventListener('createShipsSelect', () => this.createShipsSelect());
	}

	toggleShipsInput(inputFun: Function) {
		const clientFields = Array.from(document.getElementsByClassName('js-client-' + SocketService.getInstance().id)) as HTMLTableCellElement[];
		if (!this.shipsPlacement)
			for (let i = 0; i < clientFields.length; i++)
				Object.assign(clientFields[i], {
					onclick: async (event: MouseEvent & {target: HTMLTableCellElement}) => {
						if (this.shipsPlacer.length <= 0)
							return;

						const boardFree = (await this.engine.checkPath(parseInt(event.target.dataset.x), parseInt(event.target.dataset.y), this.shipsPlacer.horizontal, this.shipsPlacer.length)).available;
						if (!boardFree)
							return;

						this.engine.registerShip(parseInt(event.target.dataset.x), parseInt(event.target.dataset.y), this.shipsPlacer.horizontal, this.shipsPlacer.length);
					},
					oncontextmenu: (event: MouseEvent) => {
						event.preventDefault();
						this.shipsPlacer.horizontal = !this.shipsPlacer.horizontal;
					},
					onmouseout: () => {
						for (const shipTile of this.shipsPlacer.preview)
							shipTile.style.backgroundColor = 'initial';
						this.shipsPlacer.preview = [];
					},
					onmouseover: async (event: MouseEvent & { target: HTMLTableCellElement }) => {
						if (!this.shipsPlacer.length)
							return
						if (parseInt(event.target.dataset.y) + this.shipsPlacer.length > this.board.height || parseInt(event.target.dataset.x) + this.shipsPlacer.length > this.board.width)
							return;

						const placementResponse = await this.engine.checkPath(parseInt(event.target.dataset.x), parseInt(event.target.dataset.y), this.shipsPlacer.horizontal, this.shipsPlacer.length);

						for (const placementData of placementResponse.correctPath) {
							const tileDOM = document.querySelector<HTMLTableCellElement>(`[data-x='${placementData.x}'][data-y='${placementData.y}']`);
							tileDOM.style.backgroundColor = 'red';

							this.shipsPlacer.preview.push(tileDOM);
						}

					}
				});
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
}