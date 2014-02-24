ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityPlayer = ig.Entity.extend({

	size: {x:8, y:24}, // Sprite width is 16px wide, but hit area is 8px wide.
	offset: {x:4, y:0},
	animSheet: new ig.AnimationSheet( 'media/player.png', 16, 24),
	name: 'player',
	type: ig.Entity.TYPE.A,
	zIndex: 10,
	initPos: {x: 0, y:0}, // main.js will set this to the initial position within the level.
	canClimb: false,
    isClimbing: false,
    isJumping: false,
    momentumDirection: {'x':0,'y':0},
    ladderReleaseTimer: new ig.Timer(0.0),
    ladderSpeed: 75,
    facingRight: true,

    // Ladder code from: https://github.com/stahlmanDesign/ImpactJS-code

	init: function( x, y, settings ) {
		this.parent( x, y, settings );

		this.pos.y -=8; /* Level editor snaps to 32px, but this sprite is 24px tall */
		this.addAnim( 'idleLeft', 1, [5] );
		this.addAnim( 'idleRight', 1, [1] );
		this.addAnim( 'walkLeft', .1, [7,6,5,4] );
		this.addAnim( 'walkRight', .1, [0,1,2,3] );
		this.addAnim( 'climbUp', .15, [8,9] );
		this.addAnim( 'climbDown', .15, [9,8] );
		this.addAnim( 'jumpRight', .1, [12,13], true );
		this.addAnim( 'jumpLeft', .1, [16,17], true );
		this.addAnim( 'deadLeft', 1, [20], true );
		this.addAnim( 'deadRight', 1, [21], true );

		this.currentAnim = this.anims.idleRight;
		// this.zIndex = -99;
		//don't resort if in weltmeister
		// if (!ig.global.wm)ig.game.sortEntitiesDeferred(); 
	},

	update: function() {

		if ( ig.game.state === 1 ) {
			if( ig.input.state('left') ) {
				this.vel.x = -50;
				if (!this.canClimb)this.isClimbing=false; // don't allow moving horizontally off the while in climbing mode
				if (!this.isJumping) {
					this.currentAnim = this.anims.walkLeft;
				}
				this.facingRight = false;
			}
			else if( ig.input.state('right') ) {
				this.vel.x = 50;
				if (!this.canClimb)this.isClimbing=false; // don't allow moving horizontally off the while in climbing mode
				if (!this.isJumping) {
					this.currentAnim = this.anims.walkRight;	
				}
				this.facingRight = true;
			}
			else {
				this.vel.x = 0;
				if (this.facingRight && !this.isJumping) {
					this.currentAnim = this.anims.idleRight;
				}
				else if (!this.isJumping) {
					this.currentAnim = this.anims.idleLeft;
				}
			}	

			if( this.canClimb && (ig.input.pressed('up') ||  ig.input.pressed('down' )) ) {           
			    
			    this.isClimbing=true;
			    this.ladderReleaseTimer.set(0.0); // allow to cling to ladder instead of jumping past, if up or down pressed
			    
			    this.vel.x = 0; // don't fall off sides of ladder unintentionally
			    
			    //momentumDirection allows for up, down and idle movement (-1, 0 & 1) so you can stop on ladders
			    if (ig.input.pressed('up')) {
			        this.momentumDirection.y >-1 ? this.momentumDirection.y -- : this.momentumDirection.y = -1;   
			    }
			    else if( ig.input.pressed('down' )){
			        this.momentumDirection.y <1 ? this.momentumDirection.y ++ : this.momentumDirection.y = 1;
			    }
			}

			if ( ig.input.state('jump') && (this.vel.y === 0) ) {
				this.vel.y = -100;
				this.ladderReleaseTimer.set(0.5); // approximate seconds your player takes to jump and fall back down
				this.isClimbing=false;
			}

			if (this.vel.y !==0 && !this.isClimbing) {
				if (!this.isJumping) {
					if (this.facingRight) {
						this.currentAnim = this.anims.jumpRight.rewind();
					}
					else {
						this.currentAnim = this.anims.jumpLeft.rewind();
					}
					this.isJumping = true;
				}
			}
			else {
				this.isJumping = false;
			}
		}

		//when climbing past top of ladder, the entity falls back softly and can walk left or right
		if (!this.standing && !this.canClimb && this.vel.y < 0)this.isClimbing=false;
		
		
		// prevent fall down ladder if ground touched but ladderReleaseTimer still running from recent jump
		if (this.standing)this.ladderReleaseTimer.set(0.0);

		if ( this.vel.y < 0 && this.isClimbing && this.momentumDirection.y == -1){
			this.currentAnim = this.anims.climbUp;
		    
		} else if ( this.vel.y > 0 && this.isClimbing && this.momentumDirection.y == 1){
		    this.currentAnim = this.anims.climbDown;   
		}

		if ( ig.game.state !== 1 ) {
			this.vel.x = 0;
		}

		if ( ig.game.state >= 2) { // Dying or game over
			if (this.facingRight) {
				this.currentAnim = this.anims.deadRight;
			}
			else {
				this.currentAnim = this.anims.deadLeft;
			}
		}		
		
		// Player can't go off the left/right side of screen.
		if ( (this.pos.x + this.size.x + this.offset.x > ig.system.width) && (this.vel.x > 0) ) {
			this.vel.x = 0;
		}
		if ( (this.pos.x - this.offset.x <= 0) && (this.vel.x < 0) ) {
			this.vel.x = 0;
		}


		this.parent();
	},

	reset: function() {
		this.currentAnim = this.anims.idleRight;
		this.facingRight = true;
		this.isClimbing = false;
		this.isJumping = false;
		this.pos.x = this.initPos.x;
		this.pos.y = this.initPos.y;
	}

});

});
