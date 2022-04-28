import DOM from '../DOM';
import SocketService from '../Socket';
import boardCellClick from './boardCellClick';
import boardCellContextMenu from './boardCellContextMenu';
import boardCellMouseOut from './boardCellMouseOut';
import boardCellMouseOver from './boardCellMouseOver';


export default function gameInit(event: GameInit) {
	this.clearDisplay();
	this.assignBoardDimensions(event.detail.board.height, event.detail.board.width);
	const boardsContainerDOM = DOM.newCreateElement('div', 'boards-container', null, document.getElementById('js-display'));

	// create board and add events to start ship placement
	const boardDOM = this.renderer.renderBoard(this.board.height, this.board.width, SocketService.getInstance().id, boardsContainerDOM);
	for (const boardCell of boardDOM.cells) {
		boardCell.onclick = (mouseEvent: MouseEvent) => boardCellClick.call(this, mouseEvent);
		boardCell.oncontextmenu = (mouseEvent: MouseEvent) => boardCellContextMenu.call(this, mouseEvent);
		boardCell.onmouseout = (mouseEvent: MouseEvent) => boardCellMouseOut.call(this, mouseEvent);
		boardCell.onmouseover = (mouseEvent: MouseEvent) => boardCellMouseOver.call(this, mouseEvent);
	}
}