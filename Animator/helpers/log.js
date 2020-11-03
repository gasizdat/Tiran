atom.declare( 'Animator.Helpers.Log', {}).own(
{
  spacer : "----------------------------------------------",
  
  echo : function(msg)
  {
    console.log(msg);
  },
  
  error : function(err)
  {
    var s = Animator.Helpers.Log.spacer;
    console.log(s);
    console.error(err);
    console.log(s);
  },
});