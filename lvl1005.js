/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/

function Level1005(game_area, money, health_pc, lifes_count, z)
{
  var _image_source_array = ["bg04.jpg", "rock03.jpg"];
  var _sprites = new SpriteContainer(game_area.spriteContainer, z);
  var _sliders = [];

  PropertyHelper.defineGetter(this, "money", function() { return money; }); //число честно заработанных денег
  PropertyHelper.defineAccessors(this, "healthPc", [function() { return health_pc; }, function(v) { health_pc = v; }]); //процент здоровья
  PropertyHelper.defineAccessors(this, "lifes", [function() { return lifes_count; }, function(v) { lifes_count = v; }]); //число жизней

  this.finalize = function()
  {
    game_area.removeCacheImages(_image_source_array);
    game_area.spriteContainer.removeSprite(_sprites);
  }

  var _integralCoord = true;
    
  function _ctor()
  {
    var bg = new ImageSprite("bg04.jpg", _sprites, 0, 0, 1);
    var dx = 20;
    var h = 15;
    var m = 2;
    for(var i = 0; i < 6; i++)
    {
      _sliders[i] = new Slider(game_area, _sprites, dx, game_area.drawContext.height - (i + 1)*(h + m), game_area.drawContext.width - dx*2, h, 2 + i);
    }
    var proc = new Sprite( _sprites, 0, 0, 100);
    var img = Cache.getImage("rock03.jpg");
    proc.redraw = function(dc)
    {
      dc.context.save();
      dc.context.transform(4*(_sliders[0].position - 0.5), 4*(_sliders[1].position - 0.5), 4*(_sliders[2].position - 0.5), 4*(_sliders[3].position - 0.5), 800*_sliders[4].position, 500*_sliders[5].position);
      dc.context.drawImage(img, 50, 100, img.width, img.height);
      dc.context.restore();
    };
    
    game_area.msgFrame.close();
  }
  
  game_area.cacheImages(_image_source_array, _ctor);
}

Cache.levelLoaded(1005, Level1005);