export interface ClientToServerEvents {
	changeStatus: (roomID: number, readyStatus: boolean) => void;
	checkPath: (roomID: number, coordinates: Coordinates, isHorizontal: boolean, length: number, callback: (placement: PlacementData) => void) => void;
	createRoom: (callback: (roomID: number) => void) => void;
	joinRoom: (roomID: number, nick: string, callback: (status: boolean) => void) => void;
	leaveRoom: (roomID: number) => void;
	registerShip: (roomID: number, coordinates: Coordinates, isHorizontal: boolean, length: number, callback: (status: boolean) => void) => void;
	registerShipsRandom: (roomID: number, callback: (shipsCoordinates: Coordinates[]) => void) => void;
	registerShot: (roomID: number, coordinates: Coordinates, callback: (hasHit: boolean) => void) => void;
}

export interface ServerToClientEvents {
	gameStarted: (playersIDs: Client[]) => void;
	nextTurn: (playerID: string, startedAt: Date, duration: number) => void;
	shot: (playerID: string, result: 'hit' | 'miss', coordinates: Coordinates, enemiesIDs: string[]) => void;
	win: (playerID: string) => void;
}