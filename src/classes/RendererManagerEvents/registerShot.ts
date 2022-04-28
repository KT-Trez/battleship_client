import SocketService from '../Socket';


export default function registerShot(event: MouseEvent & { target: HTMLTableCellElement }) {
	if (this.currentPlayerID === SocketService.getInstance().id)
		this.engine.registerShot(parseInt(event.target.dataset.x), parseInt(event.target.dataset.y));
	else
		alert('Poczekaj na swoją turę!');
	// todo: add fancy information
}