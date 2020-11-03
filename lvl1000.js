/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/
function Level1000(game_area, money, health_pc, lifes_count, z)
{
  var _image_source_array = ["bg00.png"];
  var _sprites = new SpriteContainer(game_area.spriteContainer, z);
  var _testingPC = 0; 
  var _t1 = 0;
  var _t2 = 0;
  var _t3 = 0;
  var _t4 = 0;
  
  PropertyHelper.defineGetter(this, "money", function() { return money; }); //число честно заработанных денег
  PropertyHelper.defineAccessors(this, "healthPc", [function() { return health_pc; }, function(v) { health_pc = v; }]); //процент здоровья
  PropertyHelper.defineAccessors(this, "lifes", [function() { return lifes_count; }, function(v) { lifes_count = v; }]); //число жизней

  function type1()
  {
    var _x1 = 0, _x2 = 0;
    this.setx1 = function(v) { _x1=v; };
    this.setx2 = function(v) { _x2=v; };
    this.sum = function() { return _x1+_x2; };
  }

  function type2()
  {
    this.x1 = 0;
    this.x2 = 0;
    this.setx1 = function(v) { this.x1=v; };
    this.setx2 = function(v) { this.x2=v; };
    this.sum = function() { return this.x1 + this.x2; };
  }

  function type3()
  {
    var _x1 = 0, _x2 = 0;
    Object.defineProperty(this, "x1", {get: function(){  return _x1; }, set: function(v){ _x1 = v; } });
    Object.defineProperty(this, "x2", {get: function(){  return _x2; }, set: function(v){ _x2 = v; } });
    Object.defineProperty(this, "sum", {get: function() { return _x1 + _x2; } });
  }


  function _test()
  {
    var t1 = new type1();
    var t2 = new type2();
    var t3 = new type3();
    var sum = 0;
    var loops = 500000;
    t = new Number(new Date());
    for(var i = 0; i < loops; i++)
    {
      t2.x1 = i;
      t2.x2 = i + 5;
      sum += t2.sum();
    }
    _t4 = new Number(new Date()) - t;

    var t = new Number(new Date());
    for(var i = 0; i < loops; i++)
    {
      t1.setx1(i);
      t1.setx2(i + 5);
      sum -= t1.sum();
    }
    _t1 = new Number(new Date()) - t;
    t = new Number(new Date());
    for(var i = 0; i < loops; i++)
    {
      t2.setx1(i);
      t2.setx2(i + 5);
      sum += t2.sum();
    }
    _t2 = new Number(new Date()) - t;
    t = new Number(new Date());
    for(var i = 0; i < loops; i++)
    {
      t3.x1 = i;
      t2.x2 = i + 5;
      sum -= t2.sum;
    }
    _t3 = new Number(new Date()) - t;
  }
  
  
  this.finalize = function()
  {
    game_area.removeCacheImages(_image_source_array);
    game_area.spriteContainer.removeSprite(_sprites);
  }

  function _processorRedraw(dc)
  {
    if((_testingPC++ % 240) == 0)
    {
      _test();    
    }
  }
  
  function _ctor()
  {
    game_area.msgFrame.show("Идет тестирование", true, "blue", Infinity);
    var processor = new Sprite(_sprites);
    var bg = new ImageSprite("bg00.png", _sprites, 0, 0, 1);
    bg.scale = game_area.drawContext.width / bg.width;
    new TextSprite(function() { return "Нет замыканий, прямой доступ к полям : " + _t4 }, "25px Comic Sans MS", "white", _sprites, 50, 100, null, 5);
    new TextSprite(function() { return "Замыкания, доступ через методы:        " + _t1 }, "25px Comic Sans MS", "white", _sprites, 50, 160, null, 2);
    new TextSprite(function() { return "Нет замыканий, доступ через методы:    " + _t2 }, "25px Comic Sans MS", "white", _sprites, 50, 130, null, 3);
    new TextSprite(function() { return "Замыкания, доступ через свойства:      " + _t3 }, "25px Comic Sans MS", "white", _sprites, 50, 190, null, 4);
    processor.redraw = _processorRedraw.bind(this);
    
  }
  
  game_area.cacheImages(_image_source_array, _ctor);
}

Cache.levelLoaded(1000, Level1000);