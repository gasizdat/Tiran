/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/

function OrbitSprite(sc, x, y, z)
{
  var _cache = {res:null};
  var _color = "white";
  var _lw = 0;

  PropertyHelper.initializeSprite(this, sc, x, y, z, function() {return this.radius * 2}, function() {return this.radius * 2}, true);
  PropertyHelper.defineAccessors(this, "color", [function() { return _color; }, 
    function(v) 
    { 
      if(_color != v)
      {
        _color = v;
        if(_cache.res)
          delete _cache.res;
        _cache.res = null;
      }
    }]);
  PropertyHelper.defineAccessors(this, "lw", [function() { return _lw; }, 
    function(v) 
    { 
      if(_lw != v)
      {
        _lw = v;
        if(_cache.res)
          delete _cache.res;
        _cache.res = null;
      }
    }]);
  this.radius = 0;
  this.redraw = function(dc)
  {
    if(!_cache.res)
    {
      _cache.res = document.createElement("canvas");
      _cache.res.width = this.width + this.lw * 2;
      _cache.res.height = this.height + this.lw * 2;
      var cache_context =  _cache.res.getContext("2d");
      cache_context.arc(this.radius + this.lw, this.radius + this.lw, this.radius, 0, Math.PI * 2);
      cache_context.lineWidth = this.lw;
      cache_context.strokeStyle = this.color;
      cache_context.stroke();
    }
    dc.context.drawImage(_cache.res, x - this.radius-this.lw, y - this.radius-this.lw, _cache.res.width, _cache.res.height);
  }
}

function Level1004(game_area, money, health_pc, lifes_count, z)
{
  var _image_source_array = ["bg04.jpg", "sun.png", "planet01.png", "planet02.png", "planet03.png", "planet04.png", "planet05.png", "svitok02.png"];
  var _sprites = new SpriteContainer(game_area.spriteContainer, z);
  var _orbits = new SpriteContainer(_sprites, 3);
  var _planets = new SpriteContainer(_sprites, 4);
  var _planetAngles = [];
  var _processor;
  var _svitok = {res:null, pr:0, ind:0};

  PropertyHelper.defineGetter(this, "money", function() { return money; }); //число честно заработанных денег
  PropertyHelper.defineAccessors(this, "healthPc", [function() { return health_pc; }, function(v) { health_pc = v; }]); //процент здоровья
  PropertyHelper.defineAccessors(this, "lifes", [function() { return lifes_count; }, function(v) { lifes_count = v; }]); //число жизней

  this.finalize = function()
  {
    game_area.removeCacheImages(_image_source_array);
    game_area.spriteContainer.removeSprite(_sprites);
  }

  var _integralCoord = true;
  
  function _onMouseMove(event)
  {
    var dx = Math.abs(game_area.drawContext.width / 2- event.offsetX);
    var dy = Math.abs(game_area.drawContext.height / 2 - event.offsetY);
    var r = Math.sqrt(dx*dx+dy*dy);
    for(var i = 0; i < _orbits.length; i++)
    {
      var o = _orbits.sprite(i);
      if(Math.abs(o.radius - r) <= 15)
      {
        if(o.color != "green")
        {
          o.color = "green";
          o.lw = 6;
          if(_svitok.res != null)
          {
            _sprites.removeSprite(_svitok.res);
            delete _svitok.res;
          }
          _svitok.res = new TextSprite("Планета №" + (i+1), "20 px Arial", "yellow", _sprites, 0, 0, null, 100);
          _svitok.pr = o.radius - 10;
          _svitok.ind = i;
          _svitok.res.addEffect(new VisualEffects.parametric("x", function()
            { 
              return game_area.drawContext.width/2 - _svitok.pr * Math.cos(_planetAngles[_svitok.ind] % Math.PI); 
            }));
          _svitok.res.addEffect(new VisualEffects.parametric("y", function()
            { 
              return game_area.drawContext.height/2 - _svitok.pr * Math.sin(_planetAngles[_svitok.ind] % Math.PI);
            }));
          _svitok.res.addEffect(new VisualEffects.transparency(new Controllers.linear(1, 0, 0.03)));
        }
      }
      else
      {
        o.color = "white";
        o.lw = 1;        
      }
    }
  }
  
  function _ctor()
  {
    game_area.scale(1.5);
    var bg = new ImageSprite("bg04.jpg", _sprites, 0, 0, 1);
    bg.scale = game_area.drawContext.width / bg.width;
    var sun = new ImageSprite("sun.png", _sprites, 0, 0, 2);
    sun.scale = 0.15;
    sun.x = (game_area.drawContext.width - sun.width) / 2;
    sun.y = (game_area.drawContext.height - sun.height) / 2;
    sun.addEffect(new VisualEffects.rotative(new Controllers.cyclic(0, -Math.PI, Math.PI, 0.003), {x:sun.width / 2, y:sun.height/2}));
    
    var a = 0; s = 0.025;
    var planets = 5;
    var pi = Random.int(1, planets);
    var dx = 80; var ddx = 3;
    for(var i = 0; i < 9; i++)
    {
      dx += 20 + i * ddx;
      var p = new ImageSprite("planet0" + (1 + (++pi) % planets) + ".png", _planets, 0, 0, i);
      p.scale = 0.5;
      var dy = p.height / 2;
//      p.intPos = false;
      p.x = game_area.drawContext.width / 2 - dx - p.width/2;
      p.y = game_area.drawContext.height / 2 - dy;
      var ind = i;
      p.addEffect(new VisualEffects.rotative(new Controllers.cyclic(a, -Math.PI, Math.PI, s), {x:dx + p.width/2, y:dy}, function(v, sprite){_planetAngles[sprite.zOrder] = v;}));
//      a += i * 0.2;
      s -= 0.0001 + s / 9;
      
      var o = new OrbitSprite(_orbits, game_area.drawContext.width/2, game_area.drawContext.height/2, i);
      o.radius = dx;
      
    }
    game_area.msgFrame.close();
    game_area.addMouseMoveHandler(_onMouseMove);
  }
  
  game_area.cacheImages(_image_source_array, _ctor);
}

Cache.levelLoaded(1004, Level1004);