atom.declare( 'Animator.Containers.Base', Animator.Entity,
{
  initialize : function _c_ctor(args)
  {
    _c_ctor.previous.call(this, args);
    this.primitives = [];
  },
  
  add : function(primitive)
  {
    for(var i = 0; i < this.primitives.length; i++)
      if(this.primitives[i] == primitive)
        throw new Animator.Helpers.ArgumentException("Already exists", primitive);
    if(primitive.container === undefined)
      throw new Animator.Helpers.ArgumentException("Primitive can't have parent container", primitive);
    else if(primitive.container)
      primitive.container.unjoin(primitive);
    primitive.container = this;    
    this.primitives.push(primitive);
  },
  
  remove : function(primitive)
  {
    for(var i = 0; i < this.primitives.length; i++)
    {
      if(this.primitives[i] == primitive)
      {
        this.primitives.splice(i, 1)[0].container = null;
        break;
      }
    }
  }
});