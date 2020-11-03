atom.declare('Animator.Helpers.Exception', 
{
  initialize : function (msg)
  {
    this.message = msg;
    Animator.Helpers.Log.error(Error(msg));
    if(window.opera)
      console.log(_opera_fake_value); //to stop at ecxeption in Opera
  }
});

atom.declare('Animator.Helpers.ArgumentException', Animator.Helpers.Exception,
{
  initialize : function _ex_ctor(msg, arg)
  {
    _ex_ctor.previous.call(this, "ArgumentException: " + arg + ". " + msg);
  }
});

atom.declare('Animator.Helpers.ArgumentOutOfRangeException', Animator.Helpers.Exception,
{
  initialize : function _ex_ctor(arg, from, to)
  {
    _ex_ctor.previous.call(this, "ArgumentException: " + arg + " out of range (" + from + "," + to + ")");
  }
});

atom.declare('Animator.Helpers.NotImplementedException', Animator.Helpers.Exception,
{
  initialize : function _ex_ctor(fname)
  {
    _ex_ctor.previous.call(this, "Not implemented exception: " + fname);
  }
});
