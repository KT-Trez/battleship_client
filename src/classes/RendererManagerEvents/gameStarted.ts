import DOM from '../DOM';
import SocketService from '../Socket';
import registerShot from './registerShot';


export default function gameStarted(event: GameStarted) {
	this.clearDisplay();
	this.renderer.renderHeader();
	this.renderer.renderPlayers(event.detail.playersIDs);

	const boardsContainerDOM = DOM.newCreateElement('div', 'boards-container', null, document.getElementById('js-display'));

	// create player's board
	this.renderer.renderBoard(this.board.height, this.board.width, SocketService.getInstance().id, boardsContainerDOM);

	// create enemy's board
	for (const id of event.detail.playersIDs.filter(id => id !== SocketService.getInstance().id)) {
		const enemyBoardDOM = this.renderer.renderBoard(this.board.height, this.board.width, id, boardsContainerDOM);

		for (const cell of enemyBoardDOM.cells)
			cell.onclick = (cellEvent: MouseEvent & { target: HTMLTableCellElement }) => registerShot.call(this, cellEvent);
	}
}