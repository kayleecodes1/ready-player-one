ig.module(
	'game.entities.vwbus'
)
.requires(
	'impact.entity',
	'game.entities.trailer'
)
.defines(function(){
EntityVwbus = EntityTrailer.extend({
	name: 'VW Bus',
	animSheet: new ig.AnimationSheet ( 'media/vwbus.png', 96, 48 )
});

});