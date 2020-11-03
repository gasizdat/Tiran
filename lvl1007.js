/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/

function Level1007(game_area, money, health_pc, lifes_count, z)
{
  var _bodies_src =["sun.png", "planet01.png", "planet02.png", "planet03.png", "planet04.png", "planet05.png"];
  var _image_source_array = ["bg04.jpg", "aim.png"].concat(_bodies_src);
  var _sprites = new SpriteContainer(game_area.spriteContainer, z);
  var _bodies;
  var _aim;
  var _z = 1e6;
  var _score = 0;

  PropertyHelper.defineGetter(this, "money", function() { return money; }); //число честно заработанных денег
  PropertyHelper.defineAccessors(this, "healthPc", [function() { return health_pc; }, function(v) { health_pc = v; }]); //процент здоровья
  PropertyHelper.defineAccessors(this, "lifes", [function() { return lifes_count; }, function(v) { lifes_count = v; }]); //число жизней

  this.finalize = function()
  {
    game_area.removeCacheImages(_image_source_array);
    game_area.spriteContainer.removeSprite(_sprites);
  }

  function _onMouseMove(event)
  {
    _aim.x = event.offsetX - _aim.width / 2;
    _aim.y = event.offsetY - _aim.height / 2;
  }  

  function _onMouseDown(event)
  {
    for(var i = 0; i < _bodies.length; i++)
    {
      var b = _bodies.sprite(i);
      if(b.x < (_aim.x + _aim.width) && (b.x + b.width) > _aim.x &&
         b.y < (_aim.y + _aim.height) && (b.y + b.height) > _aim.y)
      {
        _score++;
        b.addEffect(new VisualEffects.transparency(new Controllers.linear(0, 1, 0.1), 
            function(v, s, dc)
            {
              if(v >= 1)
              {
                _bodies.removeSprite(s);
                _addBody();
              }
            }));

      }
    }
  }  
  
  
  function _addBody()
  {
    var src = _bodies_src[Random.int(0, _bodies_src.length)];
    var body = new ImageSprite(src, _bodies, 0, 0, _z--);
    body.addEffect(new VisualEffects.trigger(0, 
      function(v, sprite, dc)
      {
        if(sprite.x > dc.width || sprite.y > dc.height || (sprite.x + sprite.width) < 0 || (sprite.y + sprite.height) < 0 || sprite.scale > 4)
        {
          _bodies.removeSprite(sprite);
          _addBody();
        }
      }
      ));
    body.addEffect(new VisualEffects.squeezability(new Controllers.linear(0.01, 10, Random.real(0.01, 0.025))));
    body.addEffect(new VisualEffects.parametric("x", new Controllers.linear(game_area.drawContext.width / 2, 1e60, Random.real(-5, 5))));
    body.addEffect(new VisualEffects.parametric("y", new Controllers.linear(game_area.drawContext.height / 2, 1e60, Random.real(-5, 5))));
    if(Random.chance(0.5))
      body.addEffect(new VisualEffects.rotative(new Controllers.cyclic(0, -Math.PI, Math.PI, 0.1), {x:body.width / 2, y:body.height/2}));
    
  }
    
  function _ctor()
  {
    game_area.scale(1.3);
    var bg = new ImageSprite("bg04.jpg", _sprites, 0, 0, 1);
    bg.scale = game_area.drawContext.width / bg.width;
    _bodies = new SpriteContainer(_sprites, 2);
    for(var i = 0; i < 5; i++)
      _addBody();
    _aim = new ImageSprite("aim.png", _sprites, 0, 0, 3);
    new TextSprite(function(){ return "Score: " + _score; }, "20px Arial", "Yellow", _sprites, 5, 100, null, 4);
    
    game_area.addMouseDownHandler(_onMouseDown);
    game_area.addMouseMoveHandler(_onMouseMove);
    game_area.msgFrame.close();
  }
  
  game_area.cacheImages(_image_source_array, _ctor);
}

Cache.levelLoaded(1007, Level1007);