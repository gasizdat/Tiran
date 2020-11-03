/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/
function Level1003(game_area, money, health_pc, lifes_count, z)
{
  var _image_source_array = ["bg02.jpg", "ground01.png", "enemy03.png"];
  var _sprites = new SpriteContainer(game_area.spriteContainer, z);
  var _processor;
  var _enemies;
  var _vStart = 100;
  var _vSpace = 70;
  var _vLevels = 10;
  
  PropertyHelper.defineGetter(this, "money", function() { return money; }); //число честно заработанных денег
  PropertyHelper.defineAccessors(this, "healthPc", [function() { return health_pc; }, function(v) { health_pc = v; }]); //процент здоровья
  PropertyHelper.defineAccessors(this, "lifes", [function() { return lifes_count; }, function(v) { lifes_count = v; }]); //число жизней

  this.finalize = function()
  {
    game_area.removeCacheImages(_image_source_array);
    game_area.spriteContainer.removeSprite(_sprites);
  }

  var _integralCoord = true;
  function _test(dc)
  {
    if(!game_area.msgFrame.visible)
    {
      if(_integralCoord )
        game_area.msgFrame.show("Целые координаты", false, "green", 10000);
      else
        game_area.msgFrame.show("Дробные координаты", false, "red", 10000);

      for(var i = 0; i < _enemies.length; i++)
        delete _enemies.sprite(i);
      _enemies.clear();
      
      var free_space = 20;
      for(var l = 0; l < _vLevels; l++)
      {
        var rbg = new RepeatedBackground("ground01.png", _enemies, 0, _vStart + _vSpace * l, game_area.drawContext.width, null, !_integralCoord, 1000*i);
        rbg.linearSpeedX = (l % 2) ? -1.5 : 1.5;
        for(var i = 0; i < (1 + dc.width / free_space); i++)
        {
        
          var e = new ImageSprite("enemy03.png", _enemies, i * free_space, 0, i);
          e.scale = 0.3;
          e.intPos = _integralCoord;
          e.frameWidth = 144;
          e.y = _vStart + l * _vSpace - e.height;
          if(l % 2)
          {
            e.addEffect(new VisualEffects.parametric("frame", new Controllers.cyclic(0, 7, 12, 0.2)));
            e.addEffect(new VisualEffects.parametric("x", new Controllers.cyclic(e.x, -free_space, dc.width, 0.5)));
          }
          else
          {
            e.addEffect(new VisualEffects.parametric("frame", new Controllers.cyclic(0, 0, 6, 0.2)));
            e.addEffect(new VisualEffects.parametric("x", new Controllers.cyclic(e.x, -free_space, dc.width, -0.5)));
          }
        }
      }
      _integralCoord = !_integralCoord;
    }
  }
  
  function _ctor()
  {
    new ImageSprite("bg02.jpg", _sprites, 0, 0, 1);
    _processor = new Sprite(_sprites, 5);
    _enemies = new SpriteContainer(_sprites, 6);
    game_area.msgFrame.close();
    _processor.redraw = _test.bind(this);    
  }
  
  game_area.cacheImages(_image_source_array, _ctor);
}

Cache.levelLoaded(1003, Level1003);