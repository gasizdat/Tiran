/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/
function UnitTestHelper(game_area, money, health_pc, lifes_count, z)
{
  var _image_source_array = ["waterbox.jpg", "face02.png"];
  var _sprites = new SpriteContainer(game_area.spriteContainer, z);
  var _background;
  
  PropertyHelper.defineGetter(this, "money", function() { return money; }); //число честно заработанных денег
  PropertyHelper.defineAccessors(this, "healthPc", [function() { return health_pc; }, function(v) { health_pc = v; }]); //процент здоровья
  PropertyHelper.defineAccessors(this, "lifes", [function() { return lifes_count; }, function(v) { lifes_count = v; }]); //число жизней

  this.finalize = function()
  {
    game_area.removeCacheImages(_image_source_array);
    game_area.spriteContainer.removeSprite(_sprites);
    game_area.drawContext.context.restore();
  }

  function _unitTestHelper(on_load_complete)
  {
    if(Cache.addedScriptsCount != Cache.loadedScriptsCount)
    {
      setTimeout(function(){ _unitTestHelper(on_load_complete) }, 200);
    }
    else if(on_load_complete)
      on_load_complete();
  }
  
  function _ctor()
  {
    
    game_area.msgFrame.show("Unit testing in progress", true, "blue", Infinity);
    game_area.drawContext.context.save();
    Cache.addScriptSource("lvl3prtl.js");
    var img = Cache.getImage("face02.png");
    var x = 300;
    var y = 380;
    var pivot = {x:img.width/2, y:img.height/2};
    var f1 = new ImageSprite("face02.png", game_area.spriteContainer, x, y, 1);
    var f2 = new ImageSprite("face02.png", game_area.spriteContainer, x, y, 2);
    f2.addEffect(VisualEffects.rotative(Controllers.cyclic(0, 0, 360, 1), pivot));
    (new Sprite(game_area.spriteContainer, 0, 0, 0)).redraw = function(dc)
    {
      game_area.showDefaultBackground();
    }
    _unitTestHelper(
      function()
      {
        var port = new Level3Portal(game_area, "waterbox.jpg", _sprites, 50, 90, 10);
      }
    );
   
  }
  
  game_area.cacheImages(_image_source_array, _ctor);
}

Level99 = UnitTestHelper;

Cache.levelLoaded(99, Level99);