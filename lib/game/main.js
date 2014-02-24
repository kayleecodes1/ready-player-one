ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',

	'game.entities.player',

	'game.levels.demo'

)
.defines(function(){

StacksGame = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/press-start.font.png' ),
	gravity: 290,
	
	score: 0,
	lives: 3,
	timeLimit: 60,
	time: new ig.Timer( this.timeLimit ),
	timeLeft: function () {
		return Math.ceil(this.time.delta()* -1);
	},
	state: 0, // 0= "Player 1 start" intro, 1=playing, 2=dying, 3=gameover
	stateTimer: new ig.Timer(),
	stateTimerRunning: false,

	init: function() {
		ig.input.bind( ig.KEY.UP_ARROW, 'up' );
		ig.input.bind( ig.KEY.DOWN_ARROW, 'down' );
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.SPACE, 'jump' );
		ig.music.add( 'media/audio/STAXToo_atari.ogg');
		ig.music.play();
		this.startGame();
	},
	
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();

		if ( this.timeLeft() <= 0 && this.state === 1 )  {
			this.playerDie();	
		}

		if ( this.stateTimer.delta() >= 0  && this.stateTimerRunning ) {
			this.stateTimer.pause();
			this.stateTimerRunning = false;
			this.time.unpause();

			if ( this.state === 0 ) {
				console.log('starting')
				this.state = 1;	
			}
			if ( this.state === 2 ) {
				if ( this.lives >0 ) {
					console.log('lives left - continuing');
					this.continueGame();
				}
				else {
					this.endGame();
				}
			}
		}

	},
	
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
		
		
		this.font.draw( 'TIME:' + this.timeLeft(), 5, 5, ig.Font.ALIGN.LEFT );
		this.font.draw( 'SCORE:' + this.score, ig.system.width - 20, 5, ig.Font.ALIGN.RIGHT );
		this.font.draw( 'LIVES:' + this.lives, 150, 5, ig.Font.ALIGN.RIGHT );

		var midX = ig.system.width/2,
			midY = ig.system.height/2,
			player = this.getEntityByName( 'player' );

		if ( this.state === 0 ) {
			this.font.draw( 'READY PLAYER 1!', midX, midY, ig.Font.ALIGN.CENTER );
		}
		else if ( this.state === 2 ) {
			// TODO: change this
			// this.font.draw( 'PLAYER 1 DIED!', midX, midY, ig.Font.ALIGN.CENTER );	
		}
		else if ( this.state === 3 ) {
			this.font.draw( 'GAME OVER!', midX, midY, ig.Font.ALIGN.CENTER );
		}

	},

	startGame: function() {
		this.score = 0;
		this.time = new ig.Timer( this.timeLimit );
		this.time.pause();
		this.state = 0;
		this.stateTimer.set( 2 );
		this.stateTimerRunning = true;
		this.loadLevel( LevelDemo );
		var player = this.getEntityByName( 'player' );
		player.initPos.x = player.pos.x;
		player.initPos.y = player.pos.y;
	},

	continueGame: function() {
		this.time = new ig.Timer( this.timeLimit );
		this.time.pause();
		this.state = 0;
		this.stateTimer.set( 2 );
		this.stateTimerRunning = true;
		this.lives--;
		var player = this.getEntityByName( 'player' );
		player.reset();
	},

	playerDie: function() {
		var player = this.getEntityByName( 'player' );
		this.time.pause();
		this.state = 2;
		this.stateTimer.set( 1 );
		this.stateTimerRunning = true;
	},

	endGame: function() {
		console.log('ending');
		this.time.pause();
		this.state = 3;
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', StacksGame, 60, 256, 240, 4 );

});
