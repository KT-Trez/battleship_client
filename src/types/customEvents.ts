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
	};
}

interface GameEnded extends CustomEvent {
	detail: {
		playerID: string;
	};
}

interface ShotEvent extends CustomEvent {
	detail: {
		coordinates: {
			x: number
			y: number;
		};
		enemiesIDs: string[];
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