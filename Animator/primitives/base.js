atom.declare( 'Animator.Primitives.Base', Animator.Entity,
{
  initialize : function _ctor(args)
  {
    _ctor.previous.call(this, args);
    this.texture = args.texture;
    this.alignment = Animator.Textures.Alignment.get(args.alignment);
  },
  
});