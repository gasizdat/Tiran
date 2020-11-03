atom.declare( 'Animator.Controllers.Application', Animator.Containers.Base,
{
  _AiControllers : [],
  
  initialize : function _app_ctor ()
  {
    _app_ctor.previous.call(this, {});
    this.aiTime = 31; //время обновления AI по умолчанию (вызов события aiUpdate)
  },
  
  addAIController : function(ai_cnt)
  {
    if(!this._AiControllers.Length)
    {
      var updater = function()
      {
        this._AiControllers.forEach(function (cnt) { cnt.Update(this); }, this);
        setTimeout(updater, this.aiTime);
      }.bind(this);
      updater();
    }
    this._AiControllers.push(ai_cnt);
  }
});