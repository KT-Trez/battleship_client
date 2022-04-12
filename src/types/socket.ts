export interface ClientToServerEvents {
	checkPath: (roomID: number, x: number, y: number, horizontally: boolean, length: number, callback: (response: { available: boolean, correctPath: { x: number, y: number }[], takenPath: { x: number, y: number }[] }) => void) => void;
	createRoom: (callback: (roomID: number) => void) => void;
	joinRoom: (roomID: number, nick: string) => void;
	registerShip: (roomID: number, x: number, y: number, horizontally: boolean, length: number) => void;
}

export interface ServerToClientEvents {}