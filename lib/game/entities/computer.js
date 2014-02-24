ig.module(
    'game.entities.computer'
)
    .requires(
    'impact.entity'
)
    .defines(function(){

        EntityComputer = ig.Entity.extend({

            size: {x:8, y:8}, // Sprite is 16px^2 but hit area is smaller
            animSheet: new ig.AnimationSheet( 'media/comp-part.png', 8, 10),
            offset: {x:0, y:2},
            checkAgainst: ig.Entity.TYPE.A,

            collected: false,
            value: 100,
            gravityFactor: 0,

            init: function( x, y, settings ) {
                this.parent( x, y, settings );

                this.addAnim( 'idle', .3, [0,1] );
                this.addAnim( 'collect', .1, [0,1,2,3,4,5], true );

                this.currentAnim = this.anims.idle;
            },

            update: function() {

                // If the part is done being collected, add its
                // effect and remove it from the game
                if( this.anims.collect.loopCount > 0 ) {
                    //TODO: part effect
                    this.kill();
                }

                // If the player touches the burger, they collect it
                if( this.touches( ig.game.getEntityByName( 'player' ) ) && !this.collected ) {
                    this.collect();
                }

                this.parent();
            },

            // Runs when the part is collected by the player
            collect: function() {
                this.collected = true;
                this.currentAnim = this.anims.collect.rewind();
                ig.game.score += this.value;
            }

        });

    })