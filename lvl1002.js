/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/
function Level1002(game_area, money, health_pc, lifes_count, z)
{
  var _image_source_array = ["bg01.jpg", "ground01.png", "cloud04.png", "cloud05.png", "cloud06.png"];
  var _sprites = new SpriteContainer(game_area.spriteContainer, z);
  var _processor;
  var _cache = [];
  var _texts = 800;
  var _drawSimpleFlag = true;
  
  PropertyHelper.defineGetter(this, "money", function() { return money; }); //число честно заработанных денег
  PropertyHelper.defineAccessors(this, "healthPc", [function() { return health_pc; }, function(v) { health_pc = v; }]); //процент здоровья
  PropertyHelper.defineAccessors(this, "lifes", [function() { return lifes_count; }, function(v) { lifes_count = v; }]); //число жизней

  this.finalize = function()
  {
    for(var i =0; i < _cache.length; i++)
      delete _cache[i];
    game_area.removeCacheImages(_image_source_array);
    game_area.spriteContainer.removeSprite(_sprites);
  }

  function _drawSimple(dc, i, x, y, w)
  {
    dc.context.font = "25px Comic Sans MS";
    dc.context.fillStyle = "#" + (0xbeda11 + i * 5).toString(16);
    dc.context.fillText("txt " + i, x, y, w);
  }

  function _drawSmart(dc, i, x, y, w)
  {
    if(!_cache[i])
    {
      _cache[i] = document.createElement("canvas");
      _cache[i].width = w;
      _cache[i].height = 30;
      var cache_context =  _cache[i].getContext("2d");
      cache_context.font = "25px Comic Sans MS";
      cache_context.fillStyle = "#" + (0xbeda11 + i * 5).toString(16);
      cache_context.fillText("txt " + i, 0, 25, w);
    }
    dc.context.drawImage(_cache[i], x, y, w, 30);
  }
  
  function _test(dc)
  {
    if(!game_area.msgFrame.visible)
    {
      _drawSimpleFlag = !_drawSimpleFlag;
      if(_drawSimpleFlag)
        game_area.msgFrame.show("Растеризуем " + _texts + " спрайтов без кэша", false, "red", 10000);
      else
        game_area.msgFrame.show("Растеризуем " + _texts + " спрайтов с кэшем", false, "green", 10000);
    }
    var in_row = 13;
    var xk = dc.width / in_row;
    var yk = (dc.height - 100) / (_texts / in_row);
    for(var i = 0; i < _texts; i++)
    {
      if(_drawSimpleFlag)
        _drawSimple(dc, i, xk * (i % in_row), 80 + yk* i /in_row, xk);
      else
        _drawSmart(dc, i, xk * (i % in_row), 80 + yk* i /in_row, xk);
    }
  }
  
  function _ctor()
  {
    new ImageSprite("bg01.jpg", _sprites, 0, 0, 1);
    _processor = new Sprite(_sprites, 2);
    game_area.msgFrame.close();
    _processor.redraw = _test.bind(this);    
  }
  
  game_area.cacheImages(_image_source_array, _ctor);
}

Cache.levelLoaded(1002, Level1002);