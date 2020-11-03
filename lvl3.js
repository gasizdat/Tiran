/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/
function Level3(game_area, money, health_pc, lifes_count, z)
{
  var _image_source_array = ["bg03.jpg", "face02.png", "run.png", "spinning_coin_gold02.png", "spinning_ruby01.png", "enemy02.png", 
                             "enemy04.png", "bat01.png", "bat02.png", "rock04.jpg", "rock05.jpg", "ground03.png", "waterbox.jpg", "health01.png"];
  var _pers; //протогонист
  var _rndSrfc; //рельеф поверхности карты
  var _backGround; //фон интерьеров замка
  var _bats; //случайные летучие мыши
  var _sprites = new SpriteContainer(game_area.spriteContainer, z);
  var _exitPortal;
  var _exitGate;
  var _enemyRespawnBase;
  var _respawnEnemyInterval = 15; //время появления нового врага
  var _addEnemyTime;
  var _surfAdditionState = 0;
  var _sinkingLevels = []; //уровни, которые могут тонуть
  var _curSinkingLevelIndex = null;
  var _deadEnemiesCount = 0;
  var _rocksSources = ["rock04.jpg", "rock05.jpg"];
  var _healthBuyQuerySupply;
  
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
  }
  
  function _getGroundLevels(x, y)
  {
    _curSinkingLevelIndex = null;
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
  
  function _moviProcessor(dc)
  {
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
      else if((_pers.x + _pers.width) <= _exitGate.x)
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
    if(_curSinkingLevelIndex === null)
    {
      if(_pers.currentGroundLevel)
      {
        _curSinkingLevelIndex = -1;
        for(var i = 0; i < _sinkingLevels.length; i++)
        {
          if(_sinkingLevels[i].sprite == _pers.currentGroundLevel.sprite)
          {
            _curSinkingLevelIndex = i;
            break;
          }
        }
      }
    }    
    else if(_curSinkingLevelIndex != -1 && _pers.jumpLevel == 0)
    {
      _sinkingLevels[_curSinkingLevelIndex].sprite.y += _sinkingLevels[_curSinkingLevelIndex].sinkingSpeed;
    }
    if(_deadEnemiesCount >= (5 * game_area.skill) && _surfAdditionState == 1)
      _surfAdditionState++;

    var psx = _pers.speedX;
    if((psx < 0 && _rndSrfc.checkRightBarrier(_pers)) || (psx > 0 && _rndSrfc.checkLeftBarrier(_pers)))
      _pers.speedX = 0;

    switch(_rndSrfc.checkEnemyCollision(_pers))
    {
      case enemyPersCollision.persLifeReduce:
        if(!_pers.reduceLife(0.3 * game_area.skill))
          _endingLevel();
        break;
      case enemyPersCollision.enemyLifeReduce:
        _pers.jumpLevel = 2;
        break;
      case enemyPersCollision.enemyDead:
        _pers.jumpLevel = 3;
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
    
    psx = _pers.speedX;
    
    _rndSrfc.linearSpeedX = psx;
    _bats.linearSpeedX = psx;
    _ground.linearSpeedX = psx / 20;
    
    game_area.updateHealthLifeMonitor(money, _pers.lifeCount, _pers.healthPc);
    if(_pers.y > dc.height)
    {
      if(_pers.lifeCount > 1 && _pers.currentGroundLevel && !(_exitPortal && _exitPortal.isCompleted))
      {
        game_area.msgFrame.show(StringResources.PERS_BREAK, true, "green");
        for(var i = 0; i < _sinkingLevels.length; i++) //поднимаем все утонувшие уровни обратно
          _sinkingLevels[i].sprite.y = _sinkingLevels[i].y;
        _pers.speedX = 0;
        _pers.y = 0;
        _pers.jumpLevel = -1;
        _pers.reduceLife(_pers.healthPc);
        _rndSrfc.linearSpeedX = (dc.width - _pers.currentGroundLevel.sprite.width) / 2 - _pers.currentGroundLevel.sprite.x;
        //от рекусии нас спасает то, что условие if(_pers.y > dc.height) уже не сработает, т.к. поменяли у координату перса
        // Хорошее ли это решение? Нет. Работает ли оно? Да!
        _sprites.redraw(dc); 
        _rndSrfc.linearSpeedX = 0;
      }
      else
        _endingLevel();
    }
  };
  
  function _onAddStartPoint(props)
  {
    var src = Cache.getImage("ground03.png");
    props.x = (game_area.drawContext.width - src.width)/2;
    props.y = game_area.drawContext.height - src.height;
    props.w = game_area.drawContext.width - 100;
    props.h = src.height;
    props.rock = new SurfaceSprite(["ground03.png"], null, 0, props.y, props.w, props.h);
  }

  function _getEnemy(level_dsc)
  {
//    var enemy = new EnemySprite("enemy01.png", null, level_dsc, 80, [25, 41], [42, 58], [12, 23], [0, 11], 24);
    var chance = Random.chance(0.5);
    var enemy = chance ?
                new EnemySprite("enemy02.png", null, level_dsc, 64.609, [8, 14], [1, 7], [28, 41], [15, 27], 0) :
                new EnemySprite("enemy04.png", null, level_dsc, 105, [12, 14], [1, 3], [14, 19], [3, 8], 0);
    enemy.scale = Random.real(0.7, 1.5);
    enemy.speedX = chance ? 
                   Random.real(Math.log(game_area.skill) + 0.5, 2.5) :
                   Random.real(Math.log(game_area.skill) + 0.5, 1.1);
    if(Random.chance(0.5 * game_area.skill))
      enemy.health = Random.real(1.5, 3) * game_area.skill;
    else
      enemy.health = 1;
    return enemy;
  }
  
  function _onAddRandomPoint(props)
  {
    props.x += props.w + Random.int(_pers.width, _pers.width + Math.min(props.w / 4, 40)) * (1 + game_area.skill / 3);
    if(props.y >= 150 && Random.real(0, 1) > 0.7)
      props.y -= Random.int(40, 100);
    else
      props.y = Math.min(props.y + Random.int(40, 100), game_area.drawContext.canvas.height - Random.int(40, 100));
    props.h = Random.int(10, 42) * game_area.skill;
    var k = _pers.width * 3 * (1 + GAME_LEVEL.nightmare - game_area.skill);
    props.w = Random.int(k, 3 * k);
    
    if(Random.chance(0.33 * game_area.skill))
    {
    //так делать не нужно, ибо при каждом обращении к y мы будем получать разные значения
/*      props.rock = new SurfaceSprite([_rocksSources[Random.int(0, _rocksSources.length)]], null, props.x, 
        Controllers.waving(props.y, props.y - 50 * game_area.skill, props.y + 30, Random.real(0.1, 0.3)) , props.w, props.h);*/
      props.rock = new SurfaceSprite([_rocksSources[Random.int(0, _rocksSources.length)]], null, props.x, props.y, props.w, props.h);
      props.rock.addEffect(VisualEffects.parametric("y", Controllers.waving(props.y, props.y - 50 * game_area.skill, props.y + 30, Random.real(0.5, 2.5))));
    }
    else
    {
      props.rock = new SurfaceSprite([_rocksSources[Random.int(0, _rocksSources.length)]], null, props.x, props.y, props.w, props.h);
      if(game_area.skill != GAME_LEVEL.novice && Random.chance(0.5 * game_area.skill))
        _sinkingLevels.push({y: props.y, sprite: props.rock, sinkingSpeed: Random.real(0.25, 1.5) * game_area.skill});
    }

    if(props.rock.height > 20)
    {
      //Делаем высокие скалы неровными снизу
      var rp = [];
      rp.push({x:0, y:0});
      rp.push({x:0, y:props.h});
      var breaks_count = Random.int(props.w / 30, props.w / 10);
      for(var i = 1; i <= breaks_count; i++)
        rp.push({x:(props.w * i / breaks_count), y:props.h - Random.int(-2, 15)});
      rp.push({x:props.w, y:props.h});
      rp.push({x:props.w, y:0});
      props.rock.restrictingPath = rp;
    }
    
    var supplys_cont = Random.chance(0.31) ? Random.int(1, 6) : 0;
    while(supplys_cont--)
    {
      var supply_sprite;
      if(Random.chance(0.15))
      {
        var src = new ImageSprite("spinning_ruby01.png");
        src.addEffect(VisualEffects.parametric("frame", Controllers.cyclic(0, 0, src.width / 48, Random.real(0.1, 0.4))));
        src.frameWidth = 48;
        supply_sprite = new SupplySprite(src, null, SUPPLY_TYPE.ruby, 10);
      }
      else
      {        
        if(Random.chance(0.7))
        {        
          var src = new ImageSprite("spinning_coin_gold02.png");
          src.addEffect(VisualEffects.parametric("frame", Controllers.cyclic(0, 0, src.width / 32, 0.15)));
          src.frameWidth = 32;
          supply_sprite = new SupplySprite(src, null, SUPPLY_TYPE.coin, 1);//грош
        }
        else
        {
          var src = new ImageSprite("health01.png");
          supply_sprite = new SupplySprite(src, null, SUPPLY_TYPE.health, Random.int(10, 50));//здоровье +(10..50)%
        }
      }
      supply_sprite.x = props.x + Random.int(5, props.w - 10);
      supply_sprite.y = props.y - Random.int(32, 150);
      props.supply.push(supply_sprite);
    }

    if(Random.chance(0.25 * game_area.skill))
      props.enemy.push(_getEnemy(new levelDescription(_rndSrfc.surfDipping, props.rock)));
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
    _ground = new RepeatedBackground("bg03.jpg", _sprites, 0, 0, game_area.drawContext.width, null, true, 1);
    _ground.groundLevel = new levelDescription(5, _ground);
    _bats = new RandomBackground(["bat02.png", "bat02.png", "bat02.png", "bat02.png", "bat01.png", "bat02.png", "bat02.png", "bat02.png", "bat02.png", "bat02.png", "bat02.png"], _sprites, 0, -10, 
                            game_area.drawContext.width, game_area.drawContext.height / 2, 2, function(){ return Random.real(0.5, 1.5); });
    _bats.parallaxKoeffX = 0.5;
    _bats.parallaxSpeedX = -25;
    _pers = new MainPerson(game_area, _getGroundLevels, _sprites, health_pc, lifes_count, 0, 0, 6, 4) ;
    _pers.jumpLevel = -1;
    _pers.x = (game_area.drawContext.width - _pers.width) / 2;
    var pers_readraw = _pers.redraw.bind(_pers);
    _pers.redraw = function(dc) { pers_readraw(dc); _moviProcessor(dc);  };
    _rndSrfc = new RandomLandscape(_sprites, game_area.drawContext.height-100, 3, 5, 7);
    _rndSrfc.maxLevels = 1;
    _rndSrfc.surfDipping = 3;
    _rndSrfc.onSurfAdded = _onSurfaceAddEventHandler;

    game_area.updateHealthLifeMonitor(money, _pers.lifeCount, _pers.healthPc);
  }
  
  game_area.cacheImages(_image_source_array, _ctor);
};

Cache.levelLoaded(3, Level3);