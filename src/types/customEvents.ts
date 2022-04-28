interface GameInit extends CustomEvent {
	detail: {
		board: {
			height: number;
			width: number;
		};
	};
}

interface GameStarted extends CustomEvent {
	detail: {
		playersIDs: string[];
		registerShotFun: Function;
	};
}

interface TileHit extends TileShot {
	detail: {
		coordinates: {
			x: number
			y: number;
		};
		enemiesIDs: string[];
		// todo: fix inheritance
		shooterID: string;
	};
}

interface TileShot extends CustomEvent {
	detail: {
		coordinates: {
			x: number
			y: number;
		};
		shooterID: string;
	};
}

interface Turn extends CustomEvent {
	detail: {
		playerID: string;
		uptime: {
			duration: number;
			startedAt: Date;
		};
	};
}