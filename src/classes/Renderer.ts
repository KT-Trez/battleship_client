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
			className: 'turn-feedback'
		}, headerDOM, 'info-turn');

		// game info
		const infoDOM = DOM.newCreateElement('div', 'turn-info', null, headerDOM);
		DOM.createDynamicElement('p', {
			className: 'info-entry'
		}, infoDOM, 'info-timer');
		DOM.newCreateElement('p', 'info-entry', 'ID: ' + sessionStorage.getItem('roomID'), infoDOM);

		document.getElementById('js-display').appendChild(headerDOM);
	}

	renderPlayers(playersIDs: string[]) {
		for (const playerID of playersIDs) {
			const playerDOM = DOM.newCreateElement('p', 'player', playerID, document.getElementById('js-players'));
			playerDOM.id = 'js-' + playerID;
		}
	}

	renderStartButton(toggleReadyStatusFun: Function) {
		DOM.createElement('button', {
			className: 'select-button select-button--ready',
			innerText: 'Gotów',
			onclick: (clickEvent: MouseEvent & { target: HTMLButtonElement }) => {
				toggleReadyStatusFun();
				clickEvent.target.innerText = 'Anuluj';
			}
		}, document.getElementsByClassName('select-buttons').item(0));
	}

	renderTileShot(clientID: string, x: number, y: number, type: 'hit' | 'miss', enemiesIDs?: string[]) {
		for (const enemyID of enemiesIDs) {
			const tile = document.querySelector(`[class='js-client-${enemyID}'][data-x='${x}'][data-y='${y}']`);

			Object.assign(tile, {
				onclick: null
			});
			tile.classList.add(type === 'hit' ? 'ship--hit' : 'ship--miss');
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
			const timeLeft = new Date(futureDate - new Date().getTime());

			DOM.updateDynamicElement('info-timer', {
				innerText: moment(timeLeft).format('HH:mm:ss')
			});
		}, 500);
	}
}