/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/

function Level1006(game_area, money, health_pc, lifes_count, z)
{
  var _image_source_array = ["bg02.jpg", "track.png", "grass03.png", "tree01.png", "tree02.png", "t01.jpg"];
  var _sprites = new SpriteContainer(game_area.spriteContainer, z);

  PropertyHelper.defineGetter(this, "money", function() { return money; }); //число честно заработанных денег
  PropertyHelper.defineAccessors(this, "healthPc", [function() { return health_pc; }, function(v) { health_pc = v; }]); //процент здоровья
  PropertyHelper.defineAccessors(this, "lifes", [function() { return lifes_count; }, function(v) { lifes_count = v; }]); //число жизней

  this.finalize = function()
  {
    game_area.removeCacheImages(_image_source_array);
    game_area.spriteContainer.removeSprite(_sprites);
  }

  
    
  function _ctor()
  {
    var bg = new ImageSprite("bg02.jpg", _sprites, 0, 0, 1);
    var road = new RepeatedBackground("t01.jpg", _sprites, 0, game_area.drawContext.height - 270, game_area.drawContext.width, null, false, 2);
    var track = new ImageSprite("track.png", _sprites, 150, 0, 4);
    track.y =  game_area.drawContext.height - 70 - track.height;
    var trs = ["tree01.png", "tree02.png"];
    var trees = [];
    for(var i = 0; i < 50; i++)
    {
      trees = trees.concat(trs);
    }
    var row = 0;
    var rbg01 =  new RandomBackground(trees, _sprites, -50, track.y, game_area.drawContext.width, null, 3, 
      function(s)
      {
        row = Math.floor((trees.length - s.zOrder) * 5 / trees.length);
        return 0.7 - 0.12*row;
      }, undefined, function(){ return track.y - 97 - row * 4 + Random.int(-3, 3) ; });

    var rbg02y = game_area.drawContext.height - 325;
    var rbg02 =  new RandomBackground(trs, _sprites, -50, rbg02y, game_area.drawContext.width, null, 5, 
      function(){ return 1.2; }, undefined, function(){ return rbg02y + Random.int(-3, 3) ; });


    rbg01.parallaxSpeedX = -3;
    rbg01.parallaxKoeffX = 0.1;
    rbg01.linearSpeedX = -6;
    
    rbg02.linearSpeedX = -17;
    road.linearSpeedX = -15;

    game_area.msgFrame.close();
  }
  
  game_area.cacheImages(_image_source_array, _ctor);
}

Cache.levelLoaded(1006, Level1006);