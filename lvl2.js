/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game. 
 
*/
function Level2(game_area, money, health_pc, lifes_count, z)
{
  var _image_source_array = ["bg02.jpg", "cloud01.png", "cloud02.png", "cloud03.png", "cloud04.png", "cloud05.png", 
                            "cloud06.png", "cloud07.png", "cloud08.png", "cloud09.png", "ground01.png", "grass01.png", 
                            "grass02.png", "grass03.png", "rock01.jpg", "rock02.jpg", "rock03.jpg", "rock04.jpg", "rock05.jpg", 
                            "rock06.jpg", "face02.png", "run.png", "spinning_coin_gold02.png", "spinning_ruby01.png", 
                            "tree01.png", "tree02.png", "tree03.png", "tree04.png", "enemy01.png", "exit.png",  "castle01.png", 
                            "castle02.png"];
  var _pers; //протогонист
  var _rndSrfc; //рельеф поверхности карты
  var _clouds; //случайные облака с параллаксом
  var _ground; //поверхность карты
  var _sprites = new SpriteContainer(game_area.spriteContainer, z);
  var _lastMoney = 0;
  var _exitPortal = null;

  var _grassSprites = ["grass01.png", "grass02.png", "grass03.png"];
  var _treeSprites = ["tree01.png", "tree02.png", "tree03.png", "tree04.png"];
  var _rocksSprites = ["rock02.jpg", "rock03.jpg", "rock04.jpg", "rock06.jpg"];

  var _msg4Item = 0;
  var _deadEnemiesCount = 0;
  var _surfAdditionState = 0;
  var _dWidth;
  
  PropertyHelper.defineGetter(this, "money", function() { return money; }); //число честно заработанных денег
  PropertyHelper.defineGetter(this, "healthPc", function() { return _pers.healthPc; }); //процент здоровья
  PropertyHelper.defineGetter(this, "lifes", function() { return _pers.lifeCount; }); //число жизней
  
  this.finalize = function()
  {
    _pers.finalize();
    game_area.removeCacheImages(_image_source_array);
    game_area.spriteContainer.removeSprite(_sprites);
  }

  function _getGroundLevels(x, y)
  {
    var rnd_levels = _rndSrfc.getGroundLevels(x);
    if(rnd_levels)
      return [_ground.groundLevel, rnd_levels];
    else
      return [_ground.groundLevel];
  }
  
  function _moviProcessor(dc, dw)
  {
    if(_deadEnemiesCount >= (4 * game_area.skill))
    {
      if(_surfAdditionState == 2)
      {
        game_area.msgFrame.show(StringResources.PORTAL_AVAILABLE, true, "blue");
        _surfAdditionState++;
      }
      else if(_exitPortal && (_exitPortal.x + _exitPortal.width - 15) <= (_pers.x + _pers.width / 2))
      {
        if(!_exitPortal.persExited)
        {
          _exitPortal.persExited = true;
          game_area.endLevelDialog();
          _pers.speedX = 0;
          _pers.finalize();
        }
      }
    }

    var psx = _pers.speedX;
    
    if((psx < 0 && _rndSrfc.checkRightBarrier(_pers)) || (psx > 0 && _rndSrfc.checkLeftBarrier(_pers)))
    {
      _pers.speedX = 0;
      if(_pers.jumpLevel < 0)
        _pers.jumpLevel = 0; //упасть в тартар не можем
    }
    switch(_rndSrfc.checkEnemyCollision(_pers))
    {
      case enemyPersCollision.persLifeReduce:
        if(!_pers.reduceLife(0.3 * game_area.skill))
        {
          game_area.replayLevelDialog();
          _pers.speedX = 0;
          _pers.finalize();
        }
        
        if(!game_area.msgFrame.visible)
          game_area.msgFrame.show(StringResources.INTRO_MSG1[Random.int(0, StringResources.INTRO_MSG1.length)], true, "red");
        break;
      case enemyPersCollision.enemyLifeReduce:
        _pers.jumpLevel = 2;
        game_area.msgFrame.show(StringResources.INTRO_MSG3[Random.int(0, StringResources.INTRO_MSG3.length)], true, "orange");
        break;
      case enemyPersCollision.enemyDead:
        game_area.msgFrame.show(StringResources.INTRO_MSG2[Random.int(0, StringResources.INTRO_MSG2.length)], true, "green");
        _pers.jumpLevel = 3;
        _deadEnemiesCount++;
        break;
      default:
        var supplies = _rndSrfc.checkSuppliesGathering(_pers);
        if(supplies)
        {
          for(var i = 0; i < supplies.length; i++)
          {
            var supply = supplies[i];
            switch(supply.type)
            {
              case SUPPLY_TYPE.coin:
              case SUPPLY_TYPE.ruby:
                money += supply.value;
                if((money - _lastMoney) > 30)
                {
                  _lastMoney = money;
                  if(!game_area.msgFrame.visible)
                    game_area.msgFrame.show(StringResources.INTRO_MSG4[(_msg4Item++) % StringResources.INTRO_MSG4.length], true, "blue");
                }
                _rndSrfc.gatherSupply(supply);
                break;
              case SUPPLY_TYPE.health:
                alert("health gathering not implemented");
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
    var dx = 0;
    if(psx < 0)
    {
      if(_pers.x < (dw + 30))
        dx = 0.5;
    }
    else if(psx > 0)
    {
      if(_pers.x > (dw - 30))
        dx = -0.5;
    }
    _pers.x += dx;
    
    _rndSrfc.linearSpeedX = psx;
    _clouds.linearSpeedX = psx / 10;
    _ground.linearSpeedX = psx;
    game_area.updateHealthLifeMonitor(money, _pers.lifeCount, _pers.healthPc);
  };
  
  function _onAddStartPoint(props)
  {
    var exit_pointer = Cache.getImage("exit.png");
    props.x = 15;
    props.y = _ground.y - exit_pointer.height;
    props.w = exit_pointer.width;
    props.h = exit_pointer.height;
    props.rock = new SurfaceSprite(["exit.png"], null, props.x, props.y, props.w, props.h);
  }

  function _onAddRandomPoint(props)
  {
    if(props.level == 0)
    {
      if(Random.chance(0.33))
        props.x += Random.int(100, 500);
      props.y = game_area.drawContext.canvas.height - Random.int(40, 100);
      props.h = game_area.drawContext.canvas.height - props.y;
      props.w = Random.int(250, 500);
    }
    else
    {
      var dx = Random.int(20, 50);
      props.x += dx;
      props.w -= dx + Random.int(15, 25);
      if(props.w < 60)
        props.w = 60;
      props.h = props.y;
      props.y -= Random.int(50, 150);
      props.h -= props.y;
    }
    
    var src_array = [];
    for(var k = Random.int(1, 3); k > 0; k--)
      src_array.push(_rocksSprites[Random.int(0, _rocksSprites.length)]);
    props.rock = new SurfaceSprite(src_array, null, props.x, props.y, props.w, props.h);
    //Делаем скалу неровной - так прикольнее
    var rp = [];
    rp.push({x:0, y:0});
    var breaks_count = Random.int(5, 12);
    for(var i = 1; i <= breaks_count; i++)
      rp.push({x:Random.int(-2, 7), y:(props.h * i / breaks_count)});
    rp.push({x:0, y:props.h});
    rp.push({x:props.w, y:props.h});
    breaks_count = Random.int(5, 12);
    for(var i = breaks_count; i >= 1; i--)
      rp.push({x:props.w - Random.int(-2, 7), y:(props.h * i / breaks_count)});
    rp.push({x:props.w, y:0});
    props.rock.restrictingPath = rp;
    
    var src = _grassSprites[Random.int(0, _grassSprites.length)];;
    var img = Cache.getImage(src);
    //прибавляем 2, иначе из под травы беспонтово вылазят ноги протогониста
    props.grass = new SurfaceSprite([src], null, props.x, props.y - img.height, props.w, img.height);

    if(Random.real(0, 3) > 1.7)
    {
      src = _treeSprites[Random.int(0, _treeSprites.length)];
      img = Cache.getImage(src);
      props.tree.push(new ImageSprite(src, null, props.x + Random.int(5, props.w - 10 - img.width / 2), props.y - img.height));
    }
    
    var supplys_cont = Random.chance(0.4) ? Random.int(1, 6) : 0;
    while(supplys_cont--)
    {
      var supply_sprite;
      if(Random.chance(0.25))
      {
        var src = new ImageSprite("spinning_ruby01.png");
        src.addEffect(VisualEffects.parametric("frame", Controllers.cyclic(0, 0, src.width / 48, Random.real(0.1, 0.4))));
        src.frameWidth = 48;
        supply_sprite = new SupplySprite(src, null, SUPPLY_TYPE.ruby, 10);//рубин
      }
      else
      {        
        var src = new ImageSprite("spinning_coin_gold02.png");
        src.addEffect(VisualEffects.parametric("frame", Controllers.cyclic(0, 0, src.width / 32, 0.15)));
        src.frameWidth = 32;
        supply_sprite = new SupplySprite(src, null, SUPPLY_TYPE.coin, 1);//грош
      }
      supply_sprite.x = props.x + Random.int(5, props.w - 10);
      supply_sprite.y = props.y - Random.int(32, 150);
      props.supply.push(supply_sprite);
    }

    if(Random.chance(0.25 * game_area.skill))
    {
      var enemy = new EnemySprite("enemy01.png", null, new levelDescription(_rndSrfc.surfDipping, props.rock),
        80, [25, 41], [42, 58], [12, 23], [0, 11], 24);
      enemy.scale = Random.real(0.7, 1.5) * (1 + Math.log(game_area.skill));
      enemy.speedX = Random.real(0.5, 2.5);
      if(Random.chance(0.4 * game_area.skill))
        enemy.health = Random.int(1, 3) * game_area.skill;
      else
        enemy.health = 1;
      props.enemy.push(enemy);
    }
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
        if(props.level == 0)
        {
          props.x = sender.lastSurface.x + sender.lastSurface.width + game_area.drawContext.width;
          props.y = sender.lastSurface.y;
          _onAddRandomPoint(props);
          _surfAdditionState++;
        }
        break;
      case 2:
        if(props.level == 0)
        {
          props.x = sender.lastSurface.x + sender.lastSurface.width;
          props.y = sender.lastSurface.y;
        }
        _onAddRandomPoint(props);
        break;
      case 3:
        if(props.level == 0)
        {
          var castle = Cache.getImage("castle01.png");
          props.x = sender.lastSurface.x + sender.lastSurface.width + Random.int(100, 300);
          props.y = _ground.y - castle.height + 25;
          props.w = castle.width;
          props.h = castle.height;
          props.rock = _exitPortal = new SurfaceSprite(["castle01.png"], null, props.x, props.y, props.w, props.h);
          props.level = 1;
          _surfAdditionState++;
        }
        break;
      case 4:
        var castle = Cache.getImage("castle02.png");
        props.x = _exitPortal.x + _exitPortal.width;
        props.y = _exitPortal.y;
        props.w = castle.width;
        props.h = castle.height;
        props.rock = new SurfaceSprite(["castle02.png"], null, props.x, props.y, props.w, props.h);
        props.level = 0;
        _surfAdditionState++;
        break;
    }
  }
  
  function _ctor()
  {
    new ImageSprite("bg02.jpg", _sprites, 0, 0, 1);
    _clouds = new RandomBackground(["cloud01.png", "cloud02.png", "cloud03.png", "cloud04.png", "cloud05.png",
                            "cloud06.png", "cloud07.png", "cloud08.png", "cloud09.png"], _sprites, 0, -10, 
                            game_area.drawContext.width, game_area.drawContext.height / 2, 2, function(){ return Random.int(0, 2.1); }); //некоторые тучи прячем, иначе - тормоза
    _clouds.parallaxSpeedX = -2.75;
    _ground = new RepeatedBackground("ground01.png", _sprites, 0, game_area.drawContext.height - 30, game_area.drawContext.width, null, false, 3);
    _ground.groundLevel = new levelDescription(5, _ground);
    _pers = new MainPerson(game_area, _getGroundLevels, _sprites, health_pc, lifes_count, 0, 0, 6, 4);
    _pers.jumpLevel = -1;
    _pers.x = (game_area.drawContext.width - _pers.width) / 2;
    var pers_readraw = _pers.redraw.bind(_pers);
    var dw = (game_area.drawContext.width - _pers.width) / 2;
    _pers.redraw = function(dc) { _moviProcessor(dc, dw); pers_readraw(dc) };
    _rndSrfc = new RandomLandscape(_sprites, game_area.drawContext.height-100, 3, 5, 7);
    _rndSrfc.maxLevels = 4;
    _rndSrfc.onSurfAdded = _onSurfaceAddEventHandler;
    game_area.updateHealthLifeMonitor(money, _pers.lifeCount, _pers.healthPc);
  }
  
  game_area.cacheImages(_image_source_array, _ctor);
};

Cache.levelLoaded(2, Level2);