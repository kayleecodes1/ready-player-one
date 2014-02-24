ig.module(
    'game.entities.enemy'
)
    .requires(
    'impact.entity'
)
    .defines(function(){

        EntityEnemy = ig.Entity.extend({

            size: {x:16, y:32}, // Sprite is 18px wide but hit area is 14px wide
            animSheet: new ig.AnimationSheet( 'media/enemy.png', 24, 32),
            offset: {x:8, y: 0},
            checkAgainst: ig.Entity.TYPE.A,
            zIndex: 5,

            action: '',             // The current action
            timeUntilAction: 0,     // The time until the next action
            actionFactors: { idle: 1, walkLeft: 1, walkRight: 1 },  // The likelihood of each action

            init: function( x, y, settings ) {
                this.parent( x, y, settings );

                this.addAnim( 'idleLeft', 1, [3,3,3,1] );
                this.addAnim( 'idleRight', 1, [8,8,8,6] )
                this.addAnim( 'walkLeft', .3, [3,2,3,0] );
                this.addAnim( 'walkRight', .3, [8,7,8,5] );
                this.addAnim( 'chaseLeft',.2, [3,2,4,2,3,0] );
                this.addAnim( 'chaseRight', .1, [8,7,9,7,8,5] );

                // Randomize first action
                this.nextAction();
            },

            update: function() {

                // Enemies are only active during gameplay
                if( ig.game.state == 1 || ig.game.state == 2 ) {
                    // If the enemy is touching the player, kill them
                    if( this.touches( ig.game.getEntityByName( 'player' ) ) ) {
                        ig.game.playerDie();
                    }

                    // The enemy sees the player
                    if( this.seesPlayer() ) {

                        // Chase the player left or right
                        if( this.action == 'idleLeft' || this.action == 'walkLeft' || this.action == 'chaseLeft' ) {
                            this.action = 'chaseLeft';
                            this.vel.x = -45;
                        }
                        else {
                            this.action = 'chaseRight';
                            this.vel.x = 45;
                        }
                    }
                    // The enemy is loitering
                    else {

                        // If the enemy had been chasing, get a new action
                        if( this.action == 'chaseLeft' || this.action == 'chaseRight' ) {
                            this.resetActionFactors();
                            this.nextAction();
                        }

                        // Count down to a new action
                        if( this.timeUntilAction <= 0 ) {
                            this.nextAction();
                        }
                        else {
                            this.timeUntilAction = this.timeUntilAction - 1;
                        }

                        // Perform the current action
                        if( this.action == 'walkLeft' ) {
                            this.vel.x = -15;
                        }
                        else if( this.action == 'walkRight' ) {
                            this.vel.x = 15;
                        }
                        else {
                            this.vel.x = 0;
                        }
                    }

                    // Enemy can't go off the left/right side of screen
                    if ( (this.pos.x + this.size.x > ig.system.width) && (this.vel.x > 0) ) {
                        this.vel.x = 0;
                    }
                    if ( (this.pos.x <= 0) && (this.vel.x < 0) ) {
                        this.vel.x = 0;
                    }

                    // Enemy stays on its platform
                    if( !ig.game.collisionMap.trace( this.pos.x, this.pos.y, -160, 10, 18, 25).collision.y &&
                            ( this.action == 'walkLeft' || this.action == 'chaseLeft' ) ) {
                        this.actionFactors.walkLeft = 0;
                        this.nextAction();
                    }
                    // Enemy stays on its platform
                    if( !ig.game.collisionMap.trace( this.pos.x, this.pos.y, 160, 10, 18, 25).collision.y &&
                        ( this.action == 'walkRight' || this.action == 'chaseRight' ) ) {
                        this.actionFactors.walkRight = 0;
                        this.nextAction();
                    }

                    // Update the animation of the enemy
                    this.updateAnimation();
                }
                // The game is starting or over, the enemy should idle
                else {
                    if( this.action == 'idleLeft' || this.action == 'walkLeft' || this.action == 'chaseLeft' ) {
                        this.action = 'idleLeft';
                    }
                    else {
                        this.action = 'idleRight';
                    }
                    this.updateAnimation();
                }

                this.parent();
            },

            // Normalize the action factors so that none exceed their original values
            normalizeActionFactors: function() {
                if( this.actionFactors.idle > 1.5 ) { this.actionFactors.idle = 1.5; }
                if( this.actionFactors.left > 1 ) { this.actionFactors.left = 1; }
                if( this.actionFactors.right > 1 ) { this.actionFactors.right = 1; }
            },

            // Reset the action factors
            resetActionFactors: function() {
                this.actionFactors = { idle: 1, walkLeft: 1, walkRight: 1 };
            },

            // Decide what action the enemy will take next
            nextAction: function() {

                // Decide on the next action
                var actionTotal = this.actionFactors.idle +
                    this.actionFactors.walkLeft + this.actionFactors.walkRight;
                var actionNumber = Math.random() * ( actionTotal );

                // -- The next action is idle
                if(actionNumber >= 0 && actionNumber < this.actionFactors.idle ) {

                    // If the enemy was walking, use the same direction to idle
                    if( this.action == 'walkLeft' ) {
                        this.action = 'idleLeft';
                    }
                    else if( this.action == 'walkRight' ) {
                        this.action = 'idleRight';
                    }
                    // Otherwise, randomize the idle
                    else {
                        if( Math.random() <= .5 ) {
                            this.action = 'idleLeft'
                        }
                        else {
                            this.action = 'idleRight'
                        }
                    }
                }
                // -- The next action is walking left
                else if( actionNumber >= this.actionFactors.idle &&
                            actionNumber < ( this.actionFactors.idle + this.actionFactors.walkLeft ) ) {

                    this.action = 'walkLeft';
                }
                // -- The next action is walking right
                else {
                    this.action = 'walkRight'
                }

                // Modify the action factors by cutting the new action's
                // factor in half and adding .2 to other actions
                this.actionFactors.idle = this.actionFactors.idle + .2;
                this.actionFactors.walkLeft = this.actionFactors.walkLeft + .2;
                this.actionFactors.walkRight = this.actionFactors.walkRight + .2;

                if( this.action == 'idleLeft' || this.action == 'idleRight' ) {
                    this.actionFactors.idle = (this.actionFactors.idle - .2) / 2;
                }
                else if( this.action == 'walkLeft' ) {
                    this.actionFactors.walkLeft = (this.actionFactors.walkLeft - .2) / 2;
                }
                else {
                    this.actionFactors.walkRight = (this.actionFactors.walkRight - .2) / 2;
                }
                // Make sure that no action factors exceed 1
                this.normalizeActionFactors();

                // Randomize the time until the next action
                this.timeUntilAction = Math.floor( Math.random() * ( 160 ) ) + 80;
            },

            // Does this enemy see the player?
            seesPlayer: function() {

                var player = ig.game.getEntityByName( 'player' );

                // Is the player horizontally overlapping the enemy?
                if( player.pos.y < ( this.pos.y + this.size.y ) && ( player.pos.y + player.size.y ) > this.pos.y ) {

                    // Is the enemy facing the player?
                    if(this.action == 'idleLeft' || this.action == 'walkLeft' || this.action == 'chaseLeft') {
                        if( ( this.pos.x - player.pos.x ) > 0 ) {
                            return true;
                        }
                    }
                    else {
                        if( ( this.pos.x - player.pos.x ) < 0 ) {
                            return true;
                        }
                    }
                }

                return false;
            },

            // Sets the proper animation for the enemy
            updateAnimation: function() {
                if( this.action == 'idleLeft' ) {
                    this.currentAnim = this.anims.idleLeft;
                }
                else if( this.action == 'idleRight' ) {
                    this.currentAnim = this.anims.idleRight;
                }
                else if( this.action == 'walkLeft' ) {
                    this.currentAnim = this.anims.walkLeft;
                }
                else if( this.action == 'walkRight' ) {
                    this.currentAnim = this.anims.walkRight;
                }
                else if( this.action == 'chaseLeft' ) {
                    this.currentAnim = this.anims.chaseLeft;
                }
                else {
                    this.currentAnim = this.anims.chaseRight;
                }
            }

        });

    })