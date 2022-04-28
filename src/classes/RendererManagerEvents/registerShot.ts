import SocketService from '../Socket';


export default function registerShot(event: MouseEvent & { target: HTMLTableCellElement }, registerShotFun: Function) {
	if (this.currentPlayerID === SocketService.getInstance().id)
		registerShotFun(event.target.dataset.x, event.target.dataset.y);
	else
		alert('Poczekaj na swoją turę!');
	// todo: add fancy information
}