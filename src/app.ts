import './css/board.css';
import './css/body.css';
import './css/fonts.css';
import './css/header.css';
import './css/master.css';
import './css/ships.css';
import Engine from './classes/Engine';
import RendererManager from './classes/RendererManager';
import SocketService from './classes/Socket';
import config from './config';


console.log('Loaded: app.ts');


window.addEventListener('DOMContentLoaded', () => {
	const socket = SocketService.getInstance();
	const createGame = () => {
		const game = new Engine();
		new RendererManager(game);
		game.init();
	};

	// sections
	const modeSelectSectionDOM = document.getElementById('js-mode-select');
	const modeTypeSelectionDOM = document.getElementById('js-mode-type-select');
	const actionSelectionDOM = document.getElementById('js-action');

	// 'js-mode' handling
	document.getElementById('js-mode-select--multi').onclick = () => {
		setTimeout(() => {
			modeSelectSectionDOM.classList.add('js-hide');
			modeTypeSelectionDOM.classList.remove('js-hide');
		}, config.Menu.TransitionDuration);
	};
	document.getElementById('js-mode-select--solo').onclick = () => {
		// todo: implement solo mode
	};

	// 'js-mode-type' handling
	document.getElementById('js-mode-type-select--hot-seats').onclick = () => {
	// todo: implement hot-seats mode
	};
	document.getElementById('js-mode-type-select--online').onclick = () => {
		setTimeout(() => {
			modeTypeSelectionDOM.classList.add('js-hide');
			actionSelectionDOM.classList.remove('js-hide');
		}, config.Menu.TransitionDuration);
	};

	// 'js-action' handling
	const nickDOM = <HTMLInputElement>document.getElementById('js-input--nick');
	const roomIDDOM = <HTMLInputElement>document.getElementById('js-input--room-id');

	document.getElementById('js-action--create').onclick = () => {
		// todo: add better message \/ x3
		if (!nickDOM.value)
			return alert('Nick not specified!');

		// create room, get its ID and join it | save room's ID
		socket.emit('createRoom', roomID => {
			sessionStorage.setItem('roomID', roomID.toString());
			SocketService.getInstance().emit('joinRoom', roomID, nickDOM.value);

			createGame();
		});
	};
	document.getElementById('js-action--join').onclick = () => {
		if (!roomIDDOM.value)
			return alert('Room\'s ID not specified!');

		if (!nickDOM.value)
			return alert('Nick not specified!');

		// join to room | save room's ID
		sessionStorage.setItem('roomID', roomIDDOM.value);
		SocketService.getInstance().emit('joinRoom', parseInt(roomIDDOM.value), nickDOM.value);

		createGame();
	};
});