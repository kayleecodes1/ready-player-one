ig.module(
	'game.entities.trailer'
)
.requires(
	'impact.entity'
)
.defines(function(){
EntityTrailer = ig.Entity.extend({

	name: 'trailer',
	size: {x:96, y:48},
	zIndex: 0,
	animSheet: new ig.AnimationSheet ( 'media/trailer1.png', 96, 48 ),

	init: function( x, y, settings ) {
		this.addAnim( 'idle', 1, [0] );
		this.currrentAnim = this.anims.idle;
		this.parent( x, y, settings );
	},

	check: function( other ) {
		this.parent();
	},

	update: function() {
		this.parent();
	}
});

});