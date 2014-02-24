ig.module(
    'game.entities.burger'
)
    .requires(
    'impact.entity'
)
    .defines(function(){

        EntityBurger = ig.Entity.extend({

            size: {x:8, y:7}, // Sprite is 16px^2 but hit area is smaller
            animSheet: new ig.AnimationSheet( 'media/burger.png', 16, 16),
            offset: {x:4, y:6},
            checkAgainst: ig.Entity.TYPE.A,

            collected: false,
            value: 150,
            gravityFactor: 0,

            init: function( x, y, settings ) {
                this.parent( x, y, settings );

                this.addAnim( 'idle', .3, [0,1,2,3] );
                this.addAnim( 'collect', .1, [4,5,6,7,8], true );

                this.currentAnim = this.anims.idle;
            },

            update: function() {

                // If the burger is done being collected, add its
                // effect and remove it from the game
                if( this.anims.collect.loopCount > 0 ) {
                    //TODO: burger effect
                    this.kill();
                }

                // If the player touches the burger, they collect it
                if( this.touches( ig.game.getEntityByName( 'player' ) ) && !this.collected ) {
                    this.collect();
                }

                this.parent();
            },

            // Runs when the burger is collected by the player
            collect: function() {
                this.collected = true;
                this.currentAnim = this.anims.collect.rewind();
                ig.game.score += this.value;
            }

        });

    })