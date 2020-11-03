atom.declare( 'Animator.Textures.SolidColor', Animator.Textures.Base,
{
  initialize : function _sc_ctor (color)
  {
    var c = Animator.Helpers.System.createCanvas(1, 1);
    var ctx = c.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    _sc_ctor.previous.call(this, c, 0, false, [1, 1, 0]);
    Animator.Helpers.System.freeze(this);
  },
});