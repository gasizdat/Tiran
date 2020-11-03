atom.declare( 'Animator.Helpers.Pair', 
{
  x : 0,
  y : 0,
  get z () { return 0; },
  
  initialize: function (args)
  {
    if(args instanceof Array)
    {
      switch(args.length)
      {
        case 2:
          this.x = args[0];
          this.y = args[1];
          break;
        case 1:
          this.x = this.y = args[0];
          break;
        case 0:
          break;
        default:
          throw new Animator.Helpers.ArgumentException(args, "Unsupported length of arguments " + args.length);
          break;
      }       
    }
    else if(typeof(args) === "number")
      this.x = this.y = args;
    else
      throw new Animator.Helpers.ArgumentException(args, "Unsupported type of arguments " + typeof(args));
  },
  
}).own({
  null : new Animator.Helpers.Pair(0),
  get : function(arg)
  {
    if(!arg)
      return Animator.Helpers.Pair.null;
    else if(arg instanceof Animator.Helpers.Pair)
      return arg;
    else
      return new Animator.Helpers.Pair(arg);
  },
});