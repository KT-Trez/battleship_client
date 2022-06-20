interface GameInit extends CustomEvent {
	detail: {
		board: {
			height: number;
			width: number;
		};
	};
}

// during-game events
interface GameEnded extends CustomEvent {
	detail: {
		winner: string | string[];
	}
}

interface GameStarted extends  CustomEvent {
	detail: {
		players: Client[]
	}
}

interface GameNextTurn extends CustomEvent {
	detail: {
		leadPlayerID: string;
		turnUptime: {
			duration: number;
			startedAt: Date;
		}
	}
}

interface GameShot extends CustomEvent {
	detail: {
		coordinates: Coordinates;
		result: 'hit' | 'miss';
		shooterID: string;
		victimsIDs: string[];
	}
}