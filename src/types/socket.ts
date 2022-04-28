export interface ClientToServerEvents {
	checkPath: (roomID: number, x: number, y: number, horizontally: boolean, length: number, callback: (response: CheckPathResponse) => void) => void;
	createRoom: (callback: (roomID: number) => void) => void;
	joinRoom: (roomID: number, nick: string) => void;
	registerShip: (roomID: number, x: number, y: number, horizontally: boolean, length: number) => void;
	registerShipsRandom: (roomID: number, callback: (forceArr: { x: number, y: number }[]) => void) => void
	registerShot: (roomID: number, x: number, y: number) => void;
	startGame: (roomID: number, readyStatus: boolean) => void;
}

export interface ServerToClientEvents {
	gameStarted: (playersIDs: string[]) => void;
	hit: (shooterID: string, x: number, y: number, enemiesIDs: string[]) => void;
	miss: (shooterID: string, x: number, y: number) => void;
	nextTurn: (playerID: string, startedAt: Date, duration: number) => void;
	win: (playerID: string) => void;
}