atom.declare( 'Animator.Textures.Map', Animator.Textures.Base,
{
  initialize : function _map_ctor(img, frame)
  {
    _map_ctor.previous.call(this, img, -1, false, frame.concat([0]));  
    var async_init = function()
    {
      this.frames = (this._img.width * this._img.height) / (this.size.x * this.size.y);
      this._frameCache = new Array(this.frames);
      Animator.Helpers.System.freeze(this);
      Animator.Helpers.System.removeEventHandler(this._img, "load", async_init);
    }.bind(this);
    Animator.Helpers.System.addEventHandler(this._img, "load", async_init);

  },
  
  getFrame : function(frame_no)
  {
    Animator.Helpers.System.argumentAssertion(arguments, "number");
    if(frame_no < 0 || frame_no >= this.frames)
      throw new Animator.Helpers.Exception.ArgumentOutOfRangeException(frame_no, 0, this.frames);
    else if(this._frameCache[frame_no] === undefined)
    {
      var c = this._frameCache[frame_no] = Animator.Helpers.System.createCanvas(this.size.x, this.size.y);
      var ctx = c.getContext("2d");
      var sx = ~~(this.size.x * frame_no % this._img.width);
      var sy = ~~(~~(this.size.x * frame_no / this._img.width) * this.size.y);
      ctx.drawImage(this._img, sx, sy, this.size.x, this.size.y, 0, 0, this.size.x, this.size.y);
    }
    return this._frameCache[frame_no];
  }
});