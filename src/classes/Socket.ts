import {io, Socket} from 'socket.io-client';
import {ClientToServerEvents, ServerToClientEvents} from '../types/socket';


export default class SocketService {
	private static instance: Socket<ServerToClientEvents, ClientToServerEvents>;

	static getInstance() {
		if (this.instance)
			return this.instance;
		else
			return this.setInstance();
	}

	private static setInstance() {
		this.instance = io(process.env.WEB_SERVER_ORIGIN ?? window.location.origin, {
			withCredentials: false
		});
		return this.instance;
	}
}