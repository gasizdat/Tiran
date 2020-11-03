/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/
function Level4(game_area, money, health_pc, lifes_count, z)
{
  var _image_source_array = ["bricks01.png", "face02.png", "run.png", "spinning_coin_gold02.png", "spinning_ruby01.png", "enemy01.png", 
                             "enemy02.png", "rock04.jpg", "rock05.jpg", "ground03.png", "waterbox.jpg", "health01.png", "water01.jpg"];
  var _water;
  var _pers; //протогонист
  var _rndSrfc; //рельеф поверхности карты
  var _backGround; //фон интерьеров замка
  var _sprites = new SpriteContainer(game_area.spriteContainer, z);
  var _exitPortal;
  var _exitGate;
  var _enemyRespawnBase;
  var _respawnEnemyInterval = 15; //время появления нового врага
  var _addEnemyTime;
  var _surfAdditionState = 0;
  var _deadEnemiesCount = 0;
  var _rocksSources = ["rock04.jpg", "rock05.jpg"];
  var _healthBuyQuerySupply;
  var _fakeGround;
  var _lastMouseX = game_area.drawContext.width/2;
  var _lastMouseY = 0;
  var _lastOffsetX = _lastMouseX;
  var _lastOffsetY = 0;
  var _lastFreeSpace = Random.int(100, 300);
  var _dippingSpeed = 0.7;
  var _dippingLevel = game_area.drawContext.height * 4 / 5
  var _surfacingLevel = game_area.drawContext.height / 3;
  var _maxDeep = game_area.drawContext.height * 1.3;
  var _waterTransparency = 0.5;

  
  PropertyHelper.defineGetter(this, "money", function() { return money; }); //число честно заработанных денег
  PropertyHelper.defineGetter(this, "healthPc", function() { return _pers.healthPc; }); //процент здоровья
  PropertyHelper.defineGetter(this, "lifes", function() { return _pers.lifeCount; }); //число жизней
  
  this.finalize = function()
  {
    if(_exitPortal)
      _exitPortal.finalize();
    _pers.finalize();
    game_area.removeCacheImages(_image_source_array);
    game_area.spriteContainer.removeSprite(_sprites);
    game_area.removeMouseMoveHandler(_onMouseMove);
    game_area.removeMouseDownHandler(_onMouseDown);
  }
  
  function _onMouseMove(event)
  {
    _lastOffsetY = event.offsetY;
    _lastOffsetX = event.offsetX;
  }

  function _onMouseDown(event)
  {
  }
  
  function _getGroundLevels(x, y)
  {
    return _rndSrfc.getGroundLevels(x);
  }
  
  function _endingLevel()
  {
    if(_exitPortal && _exitPortal.isCompleted)
    {
      game_area.endLevelDialog();
    }
    else
    {
      game_area.updateHealthLifeMonitor(money, 0, 0);
      game_area.replayLevelDialog();
    }
    _pers.speedX = 0;
    _pers.finalize();
    _sprites.removeSprite(_pers);
  }
  
  function _showBuyingQuery(supply)
  {
    game_area.showBuyingQuery(supply.value, function() { return supply.x; }, function() { return supply.y - 15; }, 
          function() 
          { 
            money -= supply.value;
            _pers.increaseLife(supply.value);
            _rndSrfc.gatherSupply(supply);
            _sprites.addSprite(supply);
            supply.addEffect(VisualEffects.transparency(Controllers.linear(0, 1, 0.02), 
                function(v, s)
                { 
                  if(v == 1) 
                  {
                    _sprites.removeSprite(s);
                  }
                } ));
            _healthBuyQuerySupply = null;
            game_area.closeDialog();
          });

  }
    
  function _fakeGroundProcessor(dc)
  {
    _fakeGround.x = (dc.width - _fakeGround.width)/2; //фиксируем фейковую поверхность по горизонтали
    var dy;
    if(!_pers.speedX)
      dy = 0.5; //тонет, если не бултыхается
    else
      dy = (_lastMouseY - _pers.y - (_pers.height / 2)) / 70;

    _fakeGround.y += dy;

    var floating_speed_y = 0;
    if(dy > 0)
    {
      if((_maxDeep + _water.y - dc.height) > 0)
      {
        if(_fakeGround.y >= _dippingLevel)
        {
          _fakeGround.y = _dippingLevel;
          floating_speed_y = -dy;
        }
      }
      else 
      {
        if(_fakeGround.y >= dc.height)
          _fakeGround.y = dc.height;
      }
    }
    else
    {
      if(_fakeGround.y <= _surfacingLevel)
      {
        _fakeGround.y = _surfacingLevel;
        if(_water.y < _surfacingLevel)
          floating_speed_y = -dy;
      }
    }
    _rndSrfc.linearSpeedY = floating_speed_y;
    _water.linearSpeedY = floating_speed_y;
    _ground.linearSpeedY = floating_speed_y;
    _waterTransparency = (0.35 * _maxDeep) / (dc.height - _water.y + _fakeGround.y);
  }
  
  function _persAngleProcessor()
  {
    var a = Math.atan((_lastMouseX - _pers.x) / (_pers.y + _pers.height / 2 - _lastMouseY));
    if(a < 0)
      a += Math.PI;
    if(_lastMouseX < _pers.x)
      a += Math.PI;
    _pers.angle = a;
//    dc.context.fillText(_pers.angle*180/Math.PI, 100, 200);
  }
  
  function _moviProcessor(dc)
  {
    if(!_pers.jumpLevel)
    {
      if(_pers.jumpDinamic)
      {
        _pers.jumpDinamic = 0;
        _pers.accelerationKoeff = 0.1;
        game_area.addMouseMoveHandler(_onMouseMove);
        game_area.addMouseDownHandler(_onMouseDown);  
      }
    }
    else
      _pers.speedX = 0;
      
    _fakeGroundProcessor(dc);
    
    _lastMouseX += (_lastOffsetX - _lastMouseX) / 10;
    _lastMouseY += (_lastOffsetY - _lastMouseY) / 10;
    
    _persAngleProcessor();
    
    if(_exitPortal)
    {
      if(_addEnemyTime <= (new Number(new Date())))
      {
        _respawnEnemyInterval -= game_area.skill;
        if(_respawnEnemyInterval < 1)
          _respawnEnemyInterval = 2;
        _rndSrfc.employEnemy(_getEnemy(new levelDescription(_rndSrfc.surfDipping, _enemyRespawnBase)));
        _addEnemyTime += _respawnEnemyInterval*1000;
      }
      if(!_exitPortal.isCompleted)
      {
        if(_pers.x >= _exitPortal.x && _pers.speedX < 0)
          _pers.speedX = 0;
      }
      else if(!_exitGate.effects)
        _exitGate.addEffect(VisualEffects.parametric("y", Controllers.linear(_exitGate.y, dc.width, 2.5)));
      else if(_pers.x <= (_exitGate.x - 5))
      {
        _pers.x += 0.8;
        if(_pers.jumpLevel > 0) 
          _pers.jumpLevel = 0;
        _pers.speedX = -0.8;
      }
      else if(_pers.jumpLevel == 0)
      {
        _pers.speedX = -11;
        _pers.jumpLevel = 6;
      }
    }

    if(_deadEnemiesCount >= (5 * game_area.skill) && _surfAdditionState == 1)
      _surfAdditionState++;

    switch(_rndSrfc.checkEnemyCollision(_pers))
    {
      case enemyPersCollision.persLifeReduce:
        if(!_pers.reduceLife(0.3 * game_area.skill))
          _endingLevel();
        break;
      case enemyPersCollision.enemyLifeReduce:
//        _pers.jumpLevel = 2;
        break;
      case enemyPersCollision.enemyDead:
//        _pers.jumpLevel = 3;
        _deadEnemiesCount++;
        break;
      default:
        var supplies = _rndSrfc.checkSuppliesGathering(_pers);
        if(supplies)
        {
          var health_will_gaffering = false;
          for(var i = 0; i < supplies.length; i++)
          {
            var supply = supplies[i];
            switch(supply.type)
            {
              case SUPPLY_TYPE.coin:
              case SUPPLY_TYPE.ruby:
                money += supply.value;
                _rndSrfc.gatherSupply(supply);
                break;
              case SUPPLY_TYPE.health:
                if(!health_will_gaffering && money >= supply.value)
                {
                  health_will_gaffering = true;
                  if(_healthBuyQuerySupply != supply)
                    game_area.closeDialog();
                  _healthBuyQuerySupply = supply;
                  _showBuyingQuery(supply);
                }
                break;
              default:
                alert("Gathering supply with type: " + supply.type.toString() + " not implemented");
                break;
            }
          }
        }
        break;
    }
    
    var psx = _pers.speedX;      

    _rndSrfc.surfDipping = _pers.height / 2 + 15;
    if((psx < 0 && _rndSrfc.checkRightBarrier(_pers)) || (psx > 0 && _rndSrfc.checkLeftBarrier(_pers)))
      psx = 0;
    _rndSrfc.linearSpeedX = psx*3;
    _ground.linearSpeedX = psx;
    _water.linearSpeedX = psx*5;
    
    game_area.updateHealthLifeMonitor(money, _pers.lifeCount, _pers.healthPc);
    if(_pers.y > dc.height)
    {
      if(_pers.lifeCount > 1 && _pers.currentGroundLevel && !(_exitPortal && _exitPortal.isCompleted))
      {
        game_area.msgFrame.show(StringResources.PERS_BREAK, true, "green");
        _pers.speedX = 0;
        _pers.y = 0;
        _pers.reduceLife(_pers.healthPc);
        _rndSrfc.linearSpeedX = (dc.width - _pers.currentGroundLevel.sprite.width) / 2 - _pers.currentGroundLevel.sprite.x;
        _sprites.redraw(dc); 
        _rndSrfc.linearSpeedX = 0;
      }
      else
        _endingLevel();
    }
  };
  
  function _getEnemy(level_dsc)
  {
    var enemy = new EnemySprite("enemy02.png", null, level_dsc, 64.609, [8, 14], [1, 7], [28, 41], [15, 27], 0);
    enemy.scale = Random.real(0.7, 1.5);
    enemy.speedX = Random.real(Math.log(game_area.skill) + 0.5, 2.5);
    if(Random.chance(0.5 * game_area.skill))
      enemy.health = Random.real(1.5, 3) * game_area.skill;
    else
      enemy.health = 1;
    return enemy;
  }
  
  function _onAddStartPoint(props)
  {
    props.x = (game_area.drawContext.width - 15)/2;
    props.y = _water.y + _pers.height;
    props.w = _pers.width;
    props.h = 15;
    props.rock = _fakeGround = new Sprite(null, props.x, props.y);
    _fakeGround.width = props.w;
    _fakeGround.height = props.h;
    _fakeGround.visible = true;
    _fakeGround.redraw = function(){};

    _rndSrfc.minLevels = 3;
    _rndSrfc.maxLevels = 15;
  }  

  function _onAddRandomPoint(props)
  {
    var last_item_bottom = props.y + props.h;
    if(props.level == 0)
    {
      props.x += props.w + _lastFreeSpace;
      props.y = _water.y + Random.int(-50, 50);
      props.w = Random.int(50, 300);
    }
    else
      props.y = last_item_bottom + Random.int(0, 90);

    if(props.y > _maxDeep)
      return;
      
    props.h = Random.int(70, 150);
    
    props.rock = new SurfaceSprite([_rocksSources[Random.int(0, _rocksSources.length)]], null, props.x, props.y, props.w, props.h);

    var rp = [];
    rp.push({x:0, y:0});
    var breaks_count = Random.int(5, 12);
    for(var i = 1; i <= breaks_count; i++)
      rp.push({x:Random.int(-2, 7), y:(props.h * i / breaks_count)});
    breaks_count = Random.int(props.w / 30, props.w / 10);
    for(var i = 1; i <= breaks_count; i++)
      rp.push({x:(props.w * i / breaks_count), y:props.h - Random.int(-2, 15)});
    breaks_count = Random.int(5, 12);
    for(var i = breaks_count; i >= 1; i--)
      rp.push({x:props.w - Random.int(-2, 7), y:(props.h * i / breaks_count)});
    breaks_count = Random.int(props.w / 30, props.w / 10);
    for(var i = 1; i <= breaks_count; i++)
      rp.push({x:props.w - (props.w * i / breaks_count), y:Random.int(-2, 15)});
    props.rock.restrictingPath = rp;

    var supplys_cont = (props.level == 2 && Random.chance(0.81)) ? Random.int(2, 15) : 0;
    var health_count = Random.int(0, 2);
    while(supplys_cont--)
    {
      var supply_sprite;
      if(Random.chance(0.35))
      {
        var src = new ImageSprite("spinning_ruby01.png");
        src.addEffect(VisualEffects.parametric("frame", Controllers.cyclic(0, 0, src.width / 48, Random.real(0.1, 0.4))));
        src.frameWidth = 48;
        supply_sprite = new SupplySprite(src, null, SUPPLY_TYPE.ruby, 10);
      }
      else
      {        
        if(health_count == 0)
        {        
          var src = new ImageSprite("spinning_coin_gold02.png");
          src.addEffect(VisualEffects.parametric("frame", Controllers.cyclic(0, 0, src.width / 32, 0.15)));
          src.frameWidth = 32;
          supply_sprite = new SupplySprite(src, null, SUPPLY_TYPE.coin, 1);//грош
        }
        else
        {
          health_count--;
          var src = new ImageSprite("health01.png");
          supply_sprite = new SupplySprite(src, null, SUPPLY_TYPE.health, Random.int(10, 50));//здоровье +(10..50)%
        }
      }
      supply_sprite.x = props.x + props.w + Random.int(15, _lastFreeSpace - 15);
      supply_sprite.y = _water.y + Random.int(150, 800);
      props.supply.push(supply_sprite);
    }

/*    if(Random.chance(0.25 * game_area.skill))
      props.enemy.push(_getEnemy(new levelDescription(_rndSrfc.surfDipping, props.rock)));*/
    _lastFreeSpace = Random.int(100, 300);
    props.level = 0;
  }
  
  function _onAddExitPortal(props)
  {
    game_area.msgFrame.show(StringResources.SOLVE_4_EXIT, true, "blue", 5000);
    var src = Cache.getImage("ground03.png");
    props.x += props.w - 20; //чтобы немного перекрывался
    props.y = game_area.drawContext.height - src.height;
    props.w = game_area.drawContext.width/2;
    props.h = src.height;
    props.rock = new SurfaceSprite(["ground03.png"], null, props.x, props.y, props.w, props.h);
    _exitPortal = new Level3Portal(game_area, "waterbox.jpg", _sprites, 0, 0, 3);
    var rock_redraw = props.rock.redraw.bind(props.rock);
    props.rock.redraw = function(dc)
    {
      rock_redraw(dc);
      _exitPortal.x = props.rock.x;
      _exitPortal.y = props.rock.y - _exitPortal.height;
    }
    _rndSrfc.employEnemy(_getEnemy(new levelDescription(_rndSrfc.surfDipping, _enemyRespawnBase)));
    _addEnemyTime = (new Number(new Date())) + _respawnEnemyInterval*1000; //новый враг через 15 сек
  }
  
  function _onSurfaceAddEventHandler(sender, props)
  {
    switch(_surfAdditionState)
    {
      case 0:
        _onAddStartPoint(props);
        _surfAdditionState++;
        break;
      case 1:
        props.x = sender.lastSurface.x;
        props.y = sender.lastSurface.y;
        props.w = sender.lastSurface.width;
        props.h = sender.lastSurface.height;
        _onAddRandomPoint(props);
        break;
      case 2:
        var src = Cache.getImage("ground03.png");
        props.x = sender.lastSurface.x + sender.lastSurface.width + Random.int(0, 70);
        props.y = game_area.drawContext.height - src.height;
        props.w = game_area.drawContext.width - 100;
        props.h = src.height;
        props.rock = _enemyRespawnBase = new SurfaceSprite(["ground03.png"], null, props.x, props.y, props.w, props.h);
        Cache.addScriptSource("lvl3prtl.js");
        _surfAdditionState++;
        break;
      case 3:
        if(Cache.addedScriptsCount == Cache.loadedScriptsCount)
        {
          props.x = sender.lastSurface.x;
          props.y = sender.lastSurface.y;
          props.w = sender.lastSurface.width;
          _onAddExitPortal(props);
          _surfAdditionState++;
        }
        break;
      case 4:
        props.x = sender.lastSurface.x + sender.lastSurface.width;
        props.y = 30;
        props.w = 50;
        props.h = game_area.drawContext.height + 3;
        props.rock = _exitGate = new SurfaceSprite(["ground03.png"], null, props.x, props.y, props.w, props.h);
        _surfAdditionState++;        
        break;
    }
  }

  function _ctor()
  {
    _ground = new RepeatedBackground("bricks01.png", _sprites, 0, 0, game_area.drawContext.width, game_area.drawContext.height, true, 1);
    
    _pers = new MainPerson(game_area, _getGroundLevels, _sprites, health_pc, lifes_count, 0, 0, 4, 3) ;
    _pers.jumpLevel = -1;
    _pers.x = (game_area.drawContext.width - _pers.width) / 2;
    var pers_readraw = _pers.redraw.bind(_pers);
    _pers.redraw = function(dc) { _moviProcessor(dc); pers_readraw(dc) };

    _water = new RepeatedBackground("water01.jpg", _sprites, 0, _surfacingLevel, game_area.drawContext.width, game_area.drawContext.height, true, 8);
    _water.repeatByY = false;
    _water.addEffect(VisualEffects.transparency(function() {return _waterTransparency; }));

    _rndSrfc = new RandomLandscape(_sprites, game_area.drawContext.height-100, 5, 6, 7);
    _rndSrfc.minLevels = 1;
    _rndSrfc.maxLevels = 1;
    _rndSrfc.surfDipping = 3;
    _rndSrfc.onSurfAdded = _onSurfaceAddEventHandler;

    game_area.updateHealthLifeMonitor(money, _pers.lifeCount, _pers.healthPc);
  }
  
  game_area.cacheImages(_image_source_array, _ctor);
};

Cache.levelLoaded(4, Level4);