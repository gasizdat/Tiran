atom.declare( 'Animator.Helpers.System', {}).own(
{
  freeze : function (obj)
  {
    if(Object.freeze)
      Object.freeze(obj);
  },

  addEventHandler : function(object, event, handler)
  {
    Animator.Helpers.System.argumentAssertion(arguments, "object", "string", "function");
    object.addEventListener(event, handler);
  },
  
  removeEventHandler : function(object, event, handler)
  {
    Animator.Helpers.System.argumentAssertion(arguments, "object", "string", "function");
    object.removeEventListener(event, handler);
  },

  createImage : function()
  {
    return new Image();
  },
  
  createCanvas : function(width, height)
  {
    var _ret = document.createElement("canvas");
    if(width !== undefined)
    {
      Animator.Helpers.System.argumentAssertion(arguments, "number", "number");
      _ret.width = width;
      _ret.height = height;
    }
    return _ret;
  },
  
  argumentAssertion : function arg_assertion()
  {
    if(arguments.length > 1)
    {
      if(arguments[0].length != (arguments.length - 1))
        throw new Animator.Helpers.ArgumentException("Arguments count mismatch", "Expecting " + (arguments.length - 1).toString() + " arguments");
      for(var i = 0; i < arguments[0].length; i++)
      {
        if(!arguments[i + 1])
          continue;
        var a_types = arguments[i + 1].split("|");
        var matched = false;
        var arg = arguments[0][i];
        for(var j = 0; j < a_types.length && !matched; j++)
        {
          var a_type = a_types[j];
          matched = (a_type == "array" && Array.isArray(arg)) ||
                    (a_type == "alignment" && arg instanceof Animator.Textures.Alignment) ||
                    (a_type == "pair" && arg instanceof Animator.Helpers.Pair) ||
                    (a_type == "triplet" && arg instanceof Animator.Helpers.Triplet) ||
                    (a_type == "application" && arg instanceof Animator.Controllers.Application) ||
                    (a_type == "null" && !arg) ||
                    (typeof(arg) === a_type);
        }
        if(!matched)
          throw new Animator.Helpers.ArgumentException("Argument type mismatch", typeof(arg));
      }
    }
  },

});