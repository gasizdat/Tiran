atom.declare( 'Animator.Primitives.Rectangle', Animator.Primitives.Base,
{
  initialize : function _rect_ctor(args)
  {
    _rect_ctor.previous.call(this, args);
    this.size = Animator.Helpers.Pair.get(args.size);
  },
  
});