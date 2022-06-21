import DOM from '../DOM';
import SocketService from '../Socket';
import registerShot from './registerShot';


export default function gameStarted(event: GameStarted) {
	this.clearDisplay();
	this.renderer.renderHeader();
	this.renderer.renderPlayers(event.detail.players);

	const boardsContainerDOM = DOM.newCreateElement('div', 'boards-container', null, document.getElementById('js-display'));

	// create player's board; render player's ships
	this.renderer.renderBoard(this.board.height, this.board.width, SocketService.getInstance().id, boardsContainerDOM);
	const url = new URL(process.env.WEB_SERVER_ORIGIN ?? window.location.origin);
	url.pathname = '/game/map';
	url.search = new URLSearchParams([['roomID', sessionStorage.getItem('roomID')], ['playerID', SocketService.getInstance().id]]).toString();
	fetch(url.toString())
		.then(res => res.json())
		.then(shipsArr => {
			this.renderer.renderShips(shipsArr);
		})
		.catch(err => console.error('Cannot load player\'s ships map: ' + err.message));

	// create enemy's board
	for (const player of event.detail.players.filter(player => player.id !== SocketService.getInstance().id)) {
		const enemyBoardDOM = this.renderer.renderBoard(this.board.height, this.board.width, player.id, boardsContainerDOM);

		for (const cell of enemyBoardDOM.cells)
			cell.onclick = (cellEvent: MouseEvent & { target: HTMLTableCellElement }) => registerShot.call(this, cellEvent);
	}
}