atom.declare( 'Animator.Textures.Alignment', 
{
  initialize : function _ctor(name)
  {
    this.Name = name;
    this.Constructor += "." + name;
    Animator.Helpers.System.freeze(this);
  }
}).own(
{
  get : function (arg)
  {
    return arg ? arg : Animator.Textures.Alignment.None;      
  },
  None : new Animator.Textures.Alignment("None"),
  Stretch : new Animator.Textures.Alignment("Stretch"),
  Fill : new Animator.Textures.Alignment("Fill"),
});

Animator.Helpers.System.freeze(Animator.Textures.Alignment);