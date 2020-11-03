atom.declare( 'Animator.Textures.Simple', Animator.Textures.Base,
{
  initialize : function _simple_ctor(img)
  {
    _simple_ctor.previous.call(this, img, 0, false, -1);
    var async_init = function()
    {
      this.size = [this._img.width, this._img.height, 0];
      Animator.Helpers.System.freeze(this);
      Animator.Helpers.System.removeEventHandler(this._img, "load", async_init);
    }.bind(this);
    Animator.Helpers.System.addEventHandler(this._img, "load", async_init);
  },
});