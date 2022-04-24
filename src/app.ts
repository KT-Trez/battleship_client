import './css/board.css';
import './css/fonts.css';
import './css/master.css';
import './css/ships.css';
import DOM from './classes/DOM';
import Engine from './classes/Engine';
import Renderer from './classes/Renderer';
import SocketService from './classes/Socket';


console.log('Loaded: app.ts');


window.addEventListener('DOMContentLoaded', () => {
	const socket = SocketService.getInstance();
	const createGame = () => {
		const game = new Engine();
		new Renderer(game);
		game.init();
	};

	document.getElementById('js-create-room')
		.onclick = () => {
		socket.emit('createRoom', roomID => {
			SocketService.getInstance().emit('joinRoom', roomID, Math.random().toFixed(6));
			sessionStorage.setItem('roomID', roomID.toString());

			// todo: remove
			console.info('Joined room:', roomID);

			createGame();
		});
	};

	document.getElementById('js-join-room')
		.onclick = () => {
		const roomID = <HTMLInputElement>document.getElementById('js-join-room-input--id');
		const nick = <HTMLInputElement>document.getElementById('js-join-room-input--nick');

		SocketService.getInstance().emit('joinRoom', parseInt(roomID.value), nick.value);
		sessionStorage.setItem('roomID', roomID.value);

		createGame();
	};

});