/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/
function Level1(game_area, money, health_pc, lifes_count, z)
{
  var _sprites = new SpriteContainer(game_area.spriteContainer, z);
  var _image_source_array = ["bg01.jpg", "cloud05.png", "cloud06.png"];
  var _novice;
  var _beginner;
  var _intermediate;
  var _expert;
  var _nightmare;
  var _txt;
  PropertyHelper.defineGetter(this, "money", function() { return money; }); //число честно заработанных денег
  PropertyHelper.defineAccessors(this, "healthPc", [function() { return health_pc; }, function(v) { health_pc = v; }]); //процент здоровья
  PropertyHelper.defineAccessors(this, "lifes", [function() { return lifes_count; }, function(v) { lifes_count = v; }]); //число жизней
  
  this.finalize = function()
  {
    game_area.removeMouseMoveHandler(_onMouseMove);
    game_area.removeMouseDownHandler(_onMouseDown);  

    game_area.removeCacheImages(_image_source_array);
    game_area.spriteContainer.removeSprite(_sprites);
  }
  
  function _isMouseOver(sprite, event)
  {
    return (sprite.y - 25) <= event.offsetY && (sprite.y + 10) >= event.offsetY && (sprite.x - 20) <= event.offsetX && (sprite.x + sprite.width + 20) >= event.offsetX
  }

  
  function _onMouseMove(event)
  {
    for(var i = 0; i < _txt.length; i++)
    {
      var btn = _txt[i];
      if(_isMouseOver(btn, event))
        btn.color = "red";
      else
        btn.color = "white";
    }
  }
  
  function _onMouseDown(event)
  {
    for(var i = 0; i < _txt.length; i++)
    {
      var btn = _txt[i];
      if(_isMouseOver(btn, event))
      {
        var skill;
        switch(i)
        {
          case 0:
            skill = GAME_LEVEL.novice;
            break;
          case 1:
            skill = GAME_LEVEL.beginner;
            break;
          case 2:
            skill = GAME_LEVEL.intermediate;
            break;
          case 3:
            skill = GAME_LEVEL.expert;
            break;
          case 4:
            skill = GAME_LEVEL.nightmare;
            break;
        }
        game_area.startWithLevel(2, skill);
      }
    }
  }

  function _ctor()
  {
    new ImageSprite("bg01.jpg", _sprites, 0, 0, 1);
    _clouds = new RandomBackground(["cloud05.png", "cloud06.png"], _sprites, 0, -10, 
                        game_area.drawContext.width, game_area.drawContext.height / 2, 2, function(){ return Random.real(0.5, 1.5); });
    _novice = new TextSprite(function() { return StringResources.NOVICE_BTN; }, "20px sans-serif", "white", _sprites, 0, 0, null, 3);
    _beginner = new TextSprite(function() { return StringResources.BEGINNER_BTN; }, "20px sans-serif", "white", _sprites, 0, 0, null, 3);
    _intermediate = new TextSprite(function() { return StringResources.INTERMEDIATE_BTN; }, "20px sans-serif", "white", _sprites, 0, 0, null, 3);
    _expert = new TextSprite(function() { return StringResources.EXPERT_BTN; }, "20px sans-serif", "white", _sprites, 0, 0, null, 3);
    _nightmare = new TextSprite(function() { return StringResources.NIGHTMARE_BTN; }, "30px sans-serif", "white", _sprites, 0, 0, null, 3);
    _txt = [_novice, _beginner, _intermediate, _expert, _nightmare];
    (new Sprite(_sprites, 0, 0, 4)).redraw = function(dc)
    {
      for(var i = 0; i < _txt.length; i++)
      {
        if(Random.chance(0.3))
        {
          var btn = _txt[i];
          btn.x =  (game_area.drawContext.width - btn.width) / 2 - 150 - Random.int(10, 12);
          btn.y = 200 + i*50 - Random.int(20, 22);
        }
      }
    }
    _clouds.parallaxSpeedX = 4.75;

    game_area.addMouseMoveHandler(_onMouseMove);
    game_area.addMouseDownHandler(_onMouseDown);  
  }
  
  game_area.cacheImages(_image_source_array, _ctor);
};

Cache.levelLoaded(1, Level1);