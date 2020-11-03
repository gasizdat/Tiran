/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/

//случайный ландшафт
//=> sc - родительский спрайт-контейнер, 
//   y - координата, 
//   rock_z - z-координата скал,
//   plant_z- z-координата травки, деревьев и др. растений,
//   supplies_z - z-координата разных припасов: монет, звезд, здоровь€ и т.д.
function RandomLandscape(sc, y, rock_z, plant_z, supplies_z)
{  
  var _lastItem;
  var _linearSpeedX = 0;
  var _linearSpeedY = 0;
  var _rockZOrder = 3;
  var _supplyZOrder = 0;
  var _enemyZOrder = 0;
  var _plantsZOrder = 0;
  var _minLevels = 1;
  var _maxLevels = 3;
  var _onSurfAdded = null;
  var _minWidth = 50;
  var _surfDipping = 0;
  var _sender = this;
  
  var _rocks = new SpriteContainer(sc, rock_z);
  var _enemies = new SpriteContainer(sc, rock_z);
  var _plants = new SpriteContainer(sc, plant_z);
  var _supplies = new SpriteContainer(sc, supplies_z);
  
  var _visibleRocks = new Array();
  var _visibleSupplies = new Array();
  var _visibleEnemies = new Array();
  var _movProcessor = new Sprite(_rocks, sc.drawContext.canvas.width-1, y, 1);
  
  _lastItem = _movProcessor;
  
  //Ћинейна€ скросоть ландшафта
  PropertyHelper.defineSetter(this, "linearSpeedX", function(ls) { _linearSpeedX = ls; });
  PropertyHelper.defineSetter(this, "linearSpeedY", function(ls) { _linearSpeedY = ls; });  
  //ћинимальное число уровней поверхности
  PropertyHelper.defineAccessors(this, "minLevels", [function() { return _minLevels; }, function(v){ _minLevels = v; }]);
  //максимальное число уровней поверхности
  PropertyHelper.defineAccessors(this, "maxLevels", [function() { return _maxLevels; }, function(v){ _maxLevels = v; }]);
  //гистерезис определени€ барьеров
  this.barrierHysteresis = 5;
  //¬еличина погружени€ в почву
  PropertyHelper.defineAccessors(this, "surfDipping", [function() { return _surfDipping; }, function(v){ _surfDipping = v; }]);
  //минимальна€ ширина поверхности.
  PropertyHelper.defineAccessors(this, "minWidth", [function() { return _minWidth; }, function(v){ _minWidth = v; }]);
  //ѕоследний добавленный surface
  PropertyHelper.defineGetter(this, "lastSurface", function() { return _lastItem; });
  //событие, возникающее при добавлении очередного спрайта поверхности в него передаетс€ sender - указатель на текущий RandomLandscape
  //и кортеж, {rock, grass, tree, supply, enemy, level, x, y, w, h} в котором при желании можно заменить:
  //tree, supply - массивами, типа ImageSprite
  //enemy - массивом, типа EnemySprite
  //rock, grass - объектами, типа SurfaceSprite
  //level, x, y, w, h - литералами 
  PropertyHelper.defineAccessors(this, "onSurfAdded", [function() { return _onSurfAdded; }, function(v){ _onSurfAdded = v; getNewItem(); }]);
  
  function getLevelsCount()
  {
    return Math.ceil(Random.int(_minLevels, _maxLevels));
  }
    
  function _deadTransparencyTrigger(value, sprite)
  {
    if(value >= 1)
      sprite.owningContainer.removeSprite(sprite);
  }
  
  function _deadSqueezabilityTrigger(value, sprite)
  {
    if(value <= 0)
      sprite.owningContainer.removeSprite(sprite);
  }  

  function _addEnemy(e, z)
  {
    e.zOrder = z;
    _enemies.addSprite(e);      
    e.owningContainer = _enemies;
    e.redraw(sc.drawContext);
    if(!e.deadEffect)
    {
      e.deadEffect = Random.chance(0.5) ? 
        VisualEffects.transparency(Controllers.linear(0, 1, 0.02), _deadTransparencyTrigger) :
        VisualEffects.squeezability(Controllers.linear(e.scale, 0, 0.03), _deadSqueezabilityTrigger);
    }
    _addToVisible(_visibleEnemies, e);
  }
  
  function getNewItem()
  {
    var props =
    {
      rock : null, 
      grass : null, 
      tree : [], 
      supply : [], 
      enemy : [],
      level : -1,      
      x : 0,
      y : 0,
      h : 0,
      w : 0,
    };
    var lvs = getLevelsCount();
    for(var l = 0; l < lvs; l++)
    {
      props.level = l;
      props.rock = null; 
      props.grass = null;
      props.tree = [];
      props.supply = [];
      props.enemy = [];
      
      if(_onSurfAdded)
        _onSurfAdded(_sender, props);

      if(props.rock)
      {
        props.rock.zOrder = _rockZOrder++;
        props.rock.level = props.level;
        _rocks.addSprite(props.rock);
        props.rock.redraw(sc.drawContext);
        _addToVisible(_visibleRocks, props.rock);
      }
      for(var i = 0; i < props.supply.length; i++)
      {
        var s = props.supply[i];
        s.zOrder = _supplyZOrder++;
        _supplies.addSprite(s);
        s.redraw(sc.drawContext);
        _addToVisible(_visibleSupplies, s);
      }
      for(var i = 0; i < props.tree.length; i++)
      {
        var t = props.tree[i];
        t.zOrder = _plantsZOrder + lvs - props.level;
        t.parallax = 0.05 * (lvs - props.level);
        _plants.addSprite(t);
      }
      if(props.grass)
      {
        props.grass.zOrder = _plantsZOrder + lvs - props.level;
        _plants.addSprite(props.grass);
      }
      for(var i = 0; i < props.enemy.length; i++)
        _addEnemy(props.enemy[i], _enemyZOrder + lvs - props.level);
      if(props.level == 0 && props.rock)
        _lastItem = props.rock;
    }
	  _plantsZOrder += lvs;
    _enemyZOrder += lvs;
  }
  
  function _addToVisible(visible_list, sprite)
  {
    if(sprite.visible)
    {
      var added = false;
      for(var j = 0; j < visible_list.length; j++)
      {
        if(visible_list[j].zOrder == sprite.zOrder)
        {
          added = true;
          break;
        }
      }
      if(!added)
        visible_list.push(sprite);
    }
  }
  
  //ѕроверить наличие барьера справа
  this.checkRightBarrier = function(sprite)
  {
    var pvt_x = sprite.x + sprite.width + this.barrierHysteresis;
    var pvt_y = sprite.y + sprite.height - this.surfDipping;
    for(var i = 0; i < _visibleRocks.length; i++)
    {
      var r = _visibleRocks[i];
      if(r.level == 0 && pvt_y > r.y && (r.y + r.height) > sprite.y)
      {
        if(pvt_x > r.x && pvt_x < (r.x + r.width/2))
          return true;
      }
    }
    return false;
  }
  
  //ѕроверить наличие барьера слева
  this.checkLeftBarrier = function(sprite)
  {
    var pvt_x = sprite.x - this.barrierHysteresis;
    var pvt_y = sprite.y + sprite.height - this.surfDipping;
    for(var i = 0; i < _visibleRocks.length; i++)
    {
      var r = _visibleRocks[i];
      if(r.level == 0 && pvt_y > r.y && (r.y + r.height) > sprite.y)
      {
        if(pvt_x > (r.x + r.width/2) && pvt_x < (r.x + r.width))
          return true;
      }
    }
    return false;
  }
  
  //ѕроверить можем ли мы подобрать припас
  this.checkSuppliesGathering = function(sprite)
  {
    var ret;
    var pvt_x = sprite.x + sprite.width;
    for(var i = 0; i < _visibleSupplies.length; i++)
    {
      var s = _visibleSupplies[i];
      if(s.x <= pvt_x && (s.x + s.width) >= pvt_x &&
        (sprite.y + sprite.height) >= s.y && (s.y + s.height) >= sprite.y)
      {
        if(!ret)
          ret = new Array();
        ret.push(s);
      }
    }
    return ret;
  }

  //ѕодобрать припас
  this.gatherSupply = function(supply)
  {
    for(var i = 0; i < _visibleSupplies.length; i++)
    {
      if(_visibleSupplies[i] == supply)
      {
        _visibleSupplies.splice(i, 1);
        _supplies.removeSprite(supply);
        return;
      }
    }
    alert("supply can't gaffer");
  }
  
  this.checkEnemyCollision = function(sprite)
  {
    var cost = 0;
    for(var i = 0; i < _visibleEnemies.length; i++)
    {
      var s = _visibleEnemies[i];
      var collision = s.checkCollision(sprite);
      switch(collision)
      {
        case enemyPersCollision.none:
         continue;
        case enemyPersCollision.persLifeReduce:
        case enemyPersCollision.enemyLifeReduce:
          return collision;
        case enemyPersCollision.enemyDead:
        {
          s.addEffect(s.deadEffect);
          _visibleEnemies.splice(i, 1);
          return collision;
        }
      }
    }
    return enemyPersCollision.none;
  }
  
  this.getGroundLevels = function(x)
  {
    var ret = null;
    for(var i = _visibleRocks.length-1; i >= 0; i--)
    {
      var s = _visibleRocks[i];
      var dx = x - s.x;
      if(dx > 1)
      {
        if(dx < s.width)
        {
          if(ret === null)
            ret = new Array();
          ret.push(new levelDescription(this.surfDipping, s));
        }
      }
    }
    return ret;
  }

  this.employEnemy = function(e)
  {
    _addEnemy(e, _enemyZOrder++);
  }
  
  _movProcessor.redraw = function(dc)
  {
    if(_linearSpeedX || _linearSpeedY)
    {
      for(var i = 0; i < _visibleRocks.length; i++)
        if(!_visibleRocks[i].visible)
          _visibleRocks.splice(i, 1);
      for(var i = 0; i < _visibleSupplies.length; i++)
        if(!_visibleSupplies[i].visible)
          _visibleSupplies.splice(i, 1);
      for(var i = 0; i < _visibleEnemies.length; i++)
        if(!_visibleEnemies[i].visible)
          _visibleEnemies.splice(i, 1);
      for(var i = 1; i < _rocks.length; i++)
      {
        var rock = _rocks.sprite(i);
        rock.x += _linearSpeedX;
        rock.y += _linearSpeedY;
        _addToVisible(_visibleRocks, rock);
      }
      for(var i = 0; i < _plants.length; i++)
      {
        var plant = _plants.sprite(i);
        plant.x += _linearSpeedX;
        plant.y += _linearSpeedY;
        if(plant.parallax && (plant.x + plant.width) > 0 && plant.x < dc.width)
        {
          var dx = plant.parallax * _linearSpeedX / Math.abs(_linearSpeedX);
          plant.x += dx;
        }        
	    }
      for(var i = 0; i < _supplies.length; i++)
      {
        var supply = _supplies.sprite(i);
        supply.x += _linearSpeedX;
        supply.y += _linearSpeedY;
        _addToVisible(_visibleSupplies, supply);
      }
      for(var i = 0; i < _enemies.length; i++)
        _addToVisible(_visibleEnemies, _enemies.sprite(i));
      if((_lastItem.x + _lastItem.width) < dc.width)
        getNewItem();
    }
  }
}
