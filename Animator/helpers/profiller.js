atom.declare( 'Animator.Helpers.Profiller', 
{
  initialize : function(name)
  {
    this.name = name;
    this.reset();
  },
  
  reset : function ()
  {
    this.time = Animator.Helpers.Profiller.now();
    return this;
  },

  log : function(msg)
  {
    if(msg)
      console.log(this.name + ": " + (Animator.Helpers.Profiller.now() - this.time).toString() + " ms. " + msg);
    else
      console.log(this.name + ": " + (Animator.Helpers.Profiller.now() - this.time).toString() + " ms");
    return this;
  },
}).own({
  
  now : Date.now ? Date.now : function()
  {
    return +(new Date);
  },
 
});