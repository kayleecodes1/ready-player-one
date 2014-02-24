ig.module(
	'game.entities.prodshippingcontainer'
)
.requires(
	'impact.entity',
	'game.entities.trailer'
)
.defines(function(){
EntityProdshippingcontainer = EntityTrailer.extend({
	name: 'PROD Container',
	animSheet: new ig.AnimationSheet ( 'media/prodshippingcontainer.png', 96, 48 )
});

});