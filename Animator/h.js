function test1 ()
{
  var aim, 
      enemy,
      bg_color,
      app,
      bg,
      vp;
  var _nextFrame = 0;
  var _log = Animator.Helpers.Log;
  var canvas = document.getElementById("playArea");
  var ctx = canvas.getContext("2d");
  var raf_u = Animator.Viewports.Base.defaultAnimationFrame(100);
  var raf = Animator.Viewports.Base.defaultAnimationFrame(10);
  
  function _onComplete(timestamp)
  {
    var f = enemy.getFrame(_nextFrame++ % enemy.frames);
    ctx.drawImage(bg_color.getFrame(), 0, 0, 1, 1, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(f, 0, 0);
    raf(_onComplete);
  };

  function _ctor ()
  {
    var al = new Animator.Helpers.AsyncLoader();
    al.resourcePrefix = "../meta/";
    
    aim = al.regTexture("aim.png");
    enemy = al.regTextureMap("hero_sprites.png", [144, 144]);
    bg_color = al.regSolidColor("yellowgreen");
    al.join(
      function(p)
      {
        _log.echo(p);
      }, 
      function()
      {
        _log.error("error");
      }, 
      _onComplete);

    app = new Animator.Controllers.Application();
    bg = new Animator.Primitives.Rectangle({ location : [0], 
                                                  size : [canvas.width, canvas.height],
                                                  texture : bg_color,
                                                  alignment : Animator.Textures.Alignment.Stretch });
    vp = Animator.Viewports.Axonometric(app, {canvas:canvas, fps:60, pause:false});

    app.add(bg);
    app.add(vp);
    
    var id1 = bg.addTrigger(
      function(sender, old_value, new_value)
      {
        _log.echo("sender: " + sender + ", old: " + old_value + ", new: " + new_value);
      }, "location.x");

    var id2 = bg.addTrigger(
      function(sender)
      {
        if(sender.location.x < sender.location.y)
          _log.echo("sender: " + sender);
      }, null);
    
    bg.location.x = 12;
    bg.toStady();
    bg.location.y = 13;
    bg.toStady();
    bg.location.x = 15;
    bg.toStady();
    
    bg.removeTrigger(id1);
    bg.removeTrigger(id2);
  }
  
  _ctor();
};
      
function mainTest()
{  
  new test1();
}