import {io, Socket} from 'socket.io-client';
import {ClientToServerEvents, ServerToClientEvents} from '../types/socket';


export default class SocketService {
	static instance: Socket<ServerToClientEvents, ClientToServerEvents>;

	static getInstance() {
		if (this.instance)
			return this.instance;
		else
			return this.setInstance();
	}

	private static setInstance() {
		this.instance = io(process.env.REACT_APP_WEB_SERVER ?? window.location.origin, {
			withCredentials: true
		});
		return this.instance;
	}
}