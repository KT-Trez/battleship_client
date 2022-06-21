import moment from 'moment';
import DOM from './DOM';
import SocketService from './Socket';


console.log('Loaded: Renderer.ts');

export default class Renderer {
	private turnInterval: NodeJS.Timer;

	renderBoard(height: number, width: number, forceID: string, parent?: HTMLElement) {
		const board = DOM.newCreateElement('table', 'board');
		const cellsArr = [];

		for (let i = 0; i < height; i++) {
			const row = document.createElement('tr');

			for (let j = 0; j < width; j++) {
				const cell = DOM.newCreateElement('td', ['board-tile', `js-client-${forceID}`]);

				cell.setAttribute('data-x', j.toString());
				cell.setAttribute('data-y', i.toString());

				row.appendChild(cell);
				cellsArr.push(cell);
			}

			board.appendChild(row);
		}

		if (parent)
			parent.appendChild(board);

		return {
			board,
			cells: cellsArr
		};
	}

	renderHeader() {
		const headerDOM = DOM.newCreateElement('header', 'header');

		// players container
		const playersContainerDOM = DOM.newCreateElement('div', 'players-container', null, headerDOM);
		playersContainerDOM.id = 'js-players'; // todo: check if it's useful anywhere

		// current player info & turn feedback
		DOM.createDynamicElement('p', {
			className: 'header-item turn-feedback'
		}, headerDOM, 'info-turn');

		// game info
		const infoDOM = DOM.newCreateElement('div', 'turn-info', null, headerDOM);
		DOM.createDynamicElement('p', {
			className: 'header-item info-entry'
		}, infoDOM, 'info-timer');
		const roomIDDOM = DOM.newCreateElement('p', ['header-item', 'info-entry'], 'ID:', infoDOM);
		DOM.newCreateElement('span', 'info-entry--bold', sessionStorage.getItem('roomID'), roomIDDOM);

		document.getElementById('js-display').appendChild(headerDOM);
	}

	renderPlayers(players: Client[]) {
		for (const player of players) {
			const playerDOM = DOM.newCreateElement('p', ['header-item', 'player'], player.nick, document.getElementById('js-players'));
			playerDOM.id = 'js-' + player.id;
		}
	}

	renderStartButton(toggleReadyStatusFun: Function) {
		DOM.createElement('button', {
			className: 'select-button select-button--ready',
			id: 'js-action--ready',
			innerText: 'Gotów',
			onclick: (clickEvent: MouseEvent & { target: HTMLButtonElement }) => {
				const isReady = toggleReadyStatusFun();
				clickEvent.target.innerText = isReady ? 'Anuluj' : 'Gotów';
			}
		}, document.getElementsByClassName('select-buttons').item(0));
	}

	renderTileShot(shooterID: string, x: number, y: number, type: 'hit' | 'miss', damagedPlayersIDs: string[]) {
		for (const damagedPlayerID of damagedPlayersIDs) {
			const playerTiles = Array.from(document.getElementsByClassName(`js-client-${damagedPlayerID}`)) as HTMLTableCellElement[];
			const tile = playerTiles.find(tile => parseInt(tile.dataset.x) === x && parseInt(tile.dataset.y) === y);

			Object.assign(tile, {
				onclick: null
			});
			tile.classList.add(type === 'hit' ? 'ship--hit' : 'ship--miss');
		}
	}

	renderShips(coordinatesArr: Coordinates[]) {
		for (const coordinate of coordinatesArr) {
			const tile = document.querySelector(`[data-x='${coordinate.x}'][data-y='${coordinate.y}']`);
			tile.classList.add('ship--ally')
		}
	}

	renderTurn(clientID: string, statedAt: Date, duration: number) {
		// current player highlight
		const playersDOM = Array.from(document.getElementsByClassName('player'));
		for (const element of playersDOM)
			element.classList.remove('player--current');

		const currentPlayerDOM = document.getElementById('js-' + clientID);
		currentPlayerDOM.classList.add('player--current');

		// feedback information
		// todo: add visible change
		const feedback = clientID === SocketService.getInstance().id ? 'Your turn!' : 'Enemy\'s turn';
		DOM.updateDynamicElement('info-turn', {
			innerText: feedback
		});

		// clock
		clearInterval(this.turnInterval);
		this.turnInterval = setInterval(() => {
			const futureDate = new Date(statedAt).getTime() + duration;
			const timeLeft = moment.duration(futureDate - new Date().getTime(), 'millisecond');

			const doubleDigitTime = (time: number) => {
			  if (time.toString().length === 1)
				  return '0' + time;
			  return time;
			};

			DOM.updateDynamicElement('info-timer', {
				innerText: doubleDigitTime(timeLeft.hours()) + ':' + doubleDigitTime(timeLeft.minutes()) + ':' + doubleDigitTime(timeLeft.seconds())
			});
		}, 500);
	}
}