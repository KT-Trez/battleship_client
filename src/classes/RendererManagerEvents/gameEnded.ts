export default function gameEnded(event: GameEnded) {
	alert('Player ' + event.detail.playerID + ' has won!');
	// todo: render fancy end & change api event name
}