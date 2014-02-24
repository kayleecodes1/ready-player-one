ig.module(
	'game.entities.shippingcontainer'
)
.requires(
	'impact.entity',
	'game.entities.trailer'
)
.defines(function(){
EntityShippingcontainer = EntityTrailer.extend({
	name: 'Shipping Container',
	animSheet: new ig.AnimationSheet ( 'media/shippingcontainer.png', 96, 48 )
});

});