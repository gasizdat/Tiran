atom.declare( 'Animator.Textures.Base', 
{
  initialize : function (img, frames, dynamic, size)
  {
    Animator.Helpers.System.argumentAssertion(arguments, "object", "number", "boolean", "number|array|triplet");
    if(frames != ~~frames)
      throw new Animator.Helpers.ArgumentException(frame, "Frame must be multiple to image size");
    this._img = img;
    this.frames = frames;
    this.dynamic = dynamic;
    this.size = Animator.Helpers.Triplet.get(size);
  },
  
  getFrame : function()
  {
    Animator.Helpers.System.argumentAssertion(arguments);
    return this._img;
  }
});