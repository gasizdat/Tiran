atom.declare( 'Animator.Viewports.Base', Animator.Entity,
{
  _redraw : function()
  {
    throw new Animator.Helpers.NotImplementedException("_redraw");
  },
  
  initialize : function _vp_ctor(app, args)
  {
    Animator.Helpers.System.argumentAssertion(arguments, "application", "object");
    _vp_ctor.previous.call(this, args);
    
    this.app = app;
    this.ctx = args.canvas ? new LibCanvas.Context2D(args.canvas) : null;
    this.fps = args.fps ? args.fps : 60;
    this.container = null;
    this.pause = args.pause ? args.pause : false;
    var animachine = Animator.Viewports.Base.defaultAnimationFrame(this.fps);
    this.animachine = animachine;
    var stat_count = 2 * this.fps; //статистика раз в 2 секунды
    var stat_elapsed = stat_count;
    var stat_time = Animator.Helpers.Profiller.now();
    var redraw_helper = function()
    {
      if(!(--stat_elapsed))
      {
        var time = Animator.Helpers.Profiller.now();
        this.fps = stat_count * 1000 / (time - stat_time);
        stat_elapsed = stat_count;
        stat_time = time;
      }
      if(!this.pause)
        this._redraw();
      animachine(redraw_helper);
    }.bind(this);
    redraw_helper();
  },
  
}).own(
{
  defaultAnimationFrame : function (fps)
  {
    if(fps === 60)
    {
      var raf = window.requestAnimationFrame || 
                window.msRequestAnimationFrame ||
                window.mozRequestAnimationFrame || 
                window.mozRequestAnimationFrame || 
                window.webkitRequestAnimationFrame;
      if(raf)
        return raf;
    }
    var _frameTimeCorrection = 0;
    var _startTime = Animator.Helpers.Profiller.now();
    var _lastFrameTime = _startTime;
    var _to = 1000/fps;
    return function defaultAnimationFrame(callback)
    {
      var now_time = Animator.Helpers.Profiller.now();
      _frameTimeCorrection += now_time - _lastFrameTime - _to;
      _lastFrameTime = now_time;
      if(_frameTimeCorrection > _to)
      {
        _frameTimeCorrection = 0; //не компенсируем больше, чем тайм-аут отрисовки
        callback(now_time - _startTime);
      }
      else
        setTimeout(function call_helper(){ callback(now_time - _startTime); }, _to - _frameTimeCorrection);
    };
  },
});