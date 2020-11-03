atom.declare( 'Animator.Helpers.Triplet', 
{
  x : 0,
  y : 0,
  z : 0,
  
  initialize: function (args)
  {
    if(args instanceof Array)
    {
      switch(args.length)
      {
        case 3:
          this.x = args[0];
          this.y = args[1];
          this.z = args[2];
          break;
        case 2:
          this.x = args[0];
          this.y = this.z = args[1];
          break;
        case 1:
          this.x = this.y = this.z = args[0];
          break;
        case 0:
          break;
        default:
          throw new Animator.Helpers.ArgumentException(args, "Unsupported length of arguments " + args.length);
          break;
      }       
    }
    else if(typeof(args) === "number")
      this.x = this.y = this.z = args;
    else
      throw new Animator.Helpers.ArgumentException(args, "Unsupported type of arguments " + typeof(args));
  },
  
  toString : function()
  {
    return "(" + this.x + ";" + this.y + ";" + this.z + ")";
  }
  
}).own({
  null : new Animator.Helpers.Triplet(0),
  get : function(arg)
  {
    if(!arg)
      return Animator.Helpers.Triplet.null;
    else if(arg instanceof Animator.Helpers.Triplet)
      return arg;
    else
      return new Animator.Helpers.Triplet(arg);
  },
});