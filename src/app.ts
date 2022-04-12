import './css/board.css';
import './css/fonts.css';
import './css/master.css';
import './css/ships.css';
import Engine from './classes/Engine';
import Renderer from './classes/Renderer';
import SocketService from './classes/Socket';


console.log('Loaded: app.ts');


window.addEventListener('DOMContentLoaded', () => {
	document.getElementById('js-create-room').onclick = () => {
		SocketService.getInstance().emit('createRoom', roomID => {
			SocketService.getInstance().emit('joinRoom', roomID, Math.random().toFixed(6));
			sessionStorage.setItem('roomID', roomID.toString());
			console.info('Joined room:', roomID);

			const game = new Engine();
			new Renderer(game);
			game.init();
		});
	};

});