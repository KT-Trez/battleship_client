export default function gameEnded(event: GameEnded) {
	for (const boardTileDOM of Array.from(document.getElementsByClassName('board-tile')) as HTMLTableCellElement[])
		boardTileDOM.onclick = null;
	clearInterval(this.renderer.turnInterval);

	alert(event.detail.winner + ' has won!');
	// todo: render fancy end & change api event name
}