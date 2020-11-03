/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/

function GameArea()
{
  var _SGC_NAME = "#saved_games_count";
  var _S_NAME = "#saving_";
  var _drawContext;
  var _innerContainer;
  var _spriteContainer;
  var _msgFrame;
  var _loadingPcIndicator;
  var _gameArea = this;
  var _currentLevel;
  var _dialogBox = null;
  var _mMoveHandlers = new Array();
  var _mDownHandlers = new Array();
  var _mUpHandlers = new Array();
  var _curLevelIndex = 0;
  var _statBg;
  var _moneyIndicator;
  var _lifesIndicator;
  var _healthPcIndicator;
  var _startState; //начально состояние уровня, чтобы его можно было переиграть
  var _skill = GAME_LEVEL.novice;
  var _cookieElapsedTime = 5; //дни

  PropertyHelper.defineGetter(this, "currentLevelIndex", function(){ return _curLevelIndex; });
  PropertyHelper.defineGetter(this, "drawContext", function() { return _drawContext; });
  PropertyHelper.defineGetter(this, "spriteContainer", function() { return _spriteContainer; });
  PropertyHelper.defineGetter(this, "msgFrame", function() { return _msgFrame; });
  PropertyHelper.defineGetter(this, "dialogBox", function() { return _dialogBox === null ? (_dialogBox = new DialogBox(this)) : _dialogBox; });
  PropertyHelper.defineGetter(this, "skill", function() { return _skill; });
  
  function _onScriptLoaded(on_load_complete)
  {
    if(Cache.addedScriptsCount != Cache.loadedScriptsCount)
    {
      setTimeout(function(){ _onScriptLoaded(on_load_complete) }, 200);
    }
    else if(on_load_complete)
      on_load_complete();
  };
  
  function _openLevel(index, money, health, lifes, skill)
  {
    if(skill)
      _skill = skill;
    _gameArea.closeDialog();
    _closeLevel();
    Cache.addScriptSource("lvl" + index + ".js");
    _onScriptLoaded(function(){
      _startState = { money:money, health:health, lifes:lifes };
      _curLevelIndex = index;
      _currentLevel = new (Cache.getLevel(index))(_gameArea, money, health, lifes, 1);
      _showLevelName(index);
    });
  }
  
  function _closeLevel()
  {
    if(_currentLevel)
    {
      _currentLevel.finalize();
      delete _currentLevel;
      _currentLevel = null;
    }
    if(_statBg)
    {
      delete _statBg;
      delete _moneyIndicator;
      delete _lifesIndicator;
      delete _healthPcIndicator;
      _statBg = _moneyIndicator = _lifesIndicator = _healthPcIndicator = null;
    }
    _spriteContainer.clear();
  }  
  
  function _showDialog(caption, dlg_box, next_btn)
  {
    if(!dlg_box.visible)
    {
      var bg = new ImageSprite("dlg01.png", dlg_box, 0, 0, 1);
      bg.addEffect(VisualEffects.transparency(0.05));
      new TextSprite(function(){ return caption }, "45px Comic Sans MS", "blue", dlg_box, 30, 70, bg.width - 30*2, 2);
      var btn_exit = new ImageSprite("dlgbtn01.png", dlg_box, 10, 20, 3);
      btn_exit.x = (bg.width - (btn_exit.width + 6)*(next_btn ? 3 : 2)) / 2;
      btn_exit.y = bg.height - btn_exit.height - 10;
      new TextSprite(function(){ return StringResources.EXIT_BTN }, "45px Comic Sans MS", "green", dlg_box, btn_exit.x + 10, btn_exit.y + 40, btn_exit.width - 20, 4);
      var btn_replay = new ImageSprite("dlgbtn01.png", dlg_box, btn_exit.x + btn_exit.width + 6, btn_exit.y, 5);
      new TextSprite(function(){ return StringResources.REPLAY_BTN }, "45px Comic Sans MS", "green", dlg_box, btn_replay.x + 10, btn_replay.y + 40, btn_replay.width - 20, 6);
      if(next_btn)
      {
        var btn_next = new ImageSprite("dlgbtn01.png", dlg_box, btn_replay.x + btn_replay.width + 6, btn_replay.y, 7);
        new TextSprite(function(){ return StringResources.NEXT_BTN }, "45px Comic Sans MS", "green", dlg_box, btn_next.x + 10, btn_next.y + 40, btn_next.width - 20, 8);
      }
      dlg_box.onMouseClick = function(sender, sprite)
      {
        if(sprite == btn_next)
        {
          _saveCurrentLevelState();
          _openLevel(_curLevelIndex + 1, _currentLevel.money, _currentLevel.healthPc, _currentLevel.lifes);
        }
        else if(sprite == btn_replay)
        {
          _openLevel(_curLevelIndex, _startState.money, _startState.health, _startState.lifes);
        }
        else if(sprite == btn_exit)
        {
          _gameArea.startWithLevel(0);
        }
      };
      dlg_box.show(_spriteContainer, (_drawContext.canvas.width - bg.width) / 2, (_drawContext.canvas.height - bg.height) / 2, 6);
    }
  }
  
  this.closeDialog = function()
  {
    if(_dialogBox !== null)
    {
      _dialogBox.finalize();
      delete _dialogBox;
      _dialogBox = null;
    }
//    _innerContainer.pause(false);
  }
  
  this.addMouseMoveHandler = function(h)
  {
    _mMoveHandlers.push(h);
  }
  
  this.addMouseDownHandler = function(h)
  {
    _mDownHandlers.push(h);
  }

  this.addMouseUpHandler = function(h)
  {
    _mUpHandlers.push(h);
  }

  this.removeMouseMoveHandler = function(h)
  {
    for(var i = 0; i < _mMoveHandlers.length; i++)
    {
      if(_mMoveHandlers[i] == h)
        _mMoveHandlers.splice(i, 1);
    }
  }
  
  this.removeMouseDownHandler = function(h)
  {
    for(var i = 0; i < _mDownHandlers.length; i++)
    {
      if(_mDownHandlers[i] == h)
        _mDownHandlers.splice(i, 1);
    }
  }
  
  this.removeMouseUpHandler = function(h)
  {
    for(var i = 0; i < _mUpHandlers.length; i++)
    {
      if(_mUpHandlers[i] == h)
        _mUpHandlers.splice(i, 1);
    }
  }
  
  //Стандартный диалог окончания очередного уровня
  this.endLevelDialog = function()
  {
    this.closeDialog(); //безусловно закрываем все остальные диалоги, типа вопросов о покупках
    _showDialog(StringResources.END_LEVEL + " " + StringResources.LEVELS_NAMES[_curLevelIndex] + ".", this.dialogBox, true);
  }
  
  //стандартное предложение покупки
  this.showBuyingQuery = function(coast, x, y, on_click)
  {
    if(!this.dialogBox.visible)
    {
      var bg = new ImageSprite("buyq01.png", this.dialogBox, 0, 0, 1);
      bg.addEffect(VisualEffects.transparency(0.25));
      bg.addEffect(VisualEffects.parametric("scale", Controllers.linear(0.1, 1, 0.05)));
      new TextSprite(StringResources.BUY_QUERY + " $" + coast, "12px Comic Sans MS", "blue", this.dialogBox, 5, 15, bg.width - 10, 2);
      this.dialogBox.onMouseClick = on_click;
      this.dialogBox.show(_spriteContainer, x, y, 6);
      this.dialogBox.addEffect(VisualEffects.trigger(new Number(new Date()) + 2500, function(value)
        {
          if(value <= new Date())
            this.closeDialog();
            
        }.bind(this)));
    }
  }  

  this.replayLevelDialog = function()
  {
    this.closeDialog(); //безусловно закрываем все остальные диалоги, типа вопросов о покупках
    _showDialog(StringResources.LOSE_THE_END, this.dialogBox, false);
  }
  
  this.cacheImages = function(img_src_array, on_cache)
  {
    if(_loadingPcIndicator)
      alert("_loadingPcIndicator !== null");
    _loadingPcIndicator = new ProgressBar(null, 10, 300, _drawContext.canvas.width - 20, 15, 0);
    _loadingPcIndicator.redraw(_drawContext);
    _loadingPcIndicator.addedImageCount = Cache.addedImageCount;
    for(var i = 0; i < img_src_array.length; i++)
      Cache.addSpriteSource(img_src_array[i]);
    this.showDefaultBackground();
    _loadIndicator(on_cache);
  }

  this.removeCacheImages = function(img_src_array)
  {
    for(var i = 0; i < img_src_array.length; i++)
      Cache.removeSpriteSource(img_src_array[i]);
  }
  
  this.savedStatesList = function()
  {
    var ret = [];
    var с = CookieHelper.getCookie(_SGC_NAME);
    if(!с)
      с = 0;
    else
      с = parseInt(с);
    for(var i = 0; i < с; i++)
    {
      var s = _getState(i);
      if(s)
        ret.push(s);
    }
    return ret;
  }
  
  this.loadState = function(state)
  {
    _openLevel(state.level, state.money, state.health, state.lifes, state.skill);
  }

  this.deleteState = function(state)
  {
    CookieHelper.deleteCookie(state.index);
  }
  
  this.startWithLevel = function(level, skill)
  {
    _openLevel(level, 0, 100, 3, skill);
  }
  
  this.showDefaultBackground = function()
  {
    _drawContext.context.fillStyle = "#4FA7FF";
    _drawContext.context.fillRect(0, 0, _drawContext.width, _drawContext.height);

    _drawContext.context.fillStyle = "#FFFF00";
    _drawContext.context.font = "15px Arial";
    _drawContext.context.fillText(StringResources.AUTHOR, 50, 250);

    _drawContext.context.fillStyle = "#556677";
    _drawContext.context.font = "30px Arial";
    _drawContext.context.fillText(StringResources.LOADING_WAIT, 50, 280);

  }
  
  this.updateHealthLifeMonitor = function(money, lifes, helth)
  {
    if(!_statBg)
    {
      var stat_img = Cache.getImage("stat.png");
      _statBg = new ImageSprite("stat.png", _spriteContainer, _drawContext.width - stat_img.width, 0, 5);
      _statBg.addEffect(VisualEffects.transparency(0.4));
      _moneyIndicator = new TextSprite("", "20px sans-serif", "#000088", _spriteContainer, _drawContext.width - stat_img.width + 35, 22, null, 6);
      _lifesIndicator = [new ImageSprite("heart.png", _spriteContainer, _drawContext.width - stat_img.width + 92, 5, 9),
                 new ImageSprite("heart.png", _spriteContainer, _drawContext.width - stat_img.width + 107, 5, 8),
                 new ImageSprite("heart.png", _spriteContainer, _drawContext.width - stat_img.width + 122, 5, 7)];
      for(var i = 0; i < _lifesIndicator.length; i++)
        _lifesIndicator[i].frameWidth = 22;
      _healthPcIndicator = new ProgressBar(_spriteContainer, _drawContext.width - stat_img.width + 10, 35, stat_img.width - 20, 10, 10);
    }
    _moneyIndicator.text = money.toString();
    for(var i = _lifesIndicator.length; i > 0; i--)
      _lifesIndicator[i-1].frame = i > lifes ? 1 : 0;
    
    _healthPcIndicator.pc = helth;
    if(helth >= 66)
    {
      _healthPcIndicator.startColor = "#00AA00";
      _healthPcIndicator.stopColor = "#007511";
    }
    else if(helth >= 33)
    {
      _healthPcIndicator.startColor = "#FE8D43";
      _healthPcIndicator.stopColor = "#FCE303";
    }
    else
    {
      _healthPcIndicator.startColor = "#AA0000";
      _healthPcIndicator.stopColor = "#FE8D43";
    }
  }

  this.scale = function(s)
  {
    var canvas = document.getElementById("playArea");
    canvas.width = canvas.width * s;
    canvas.height = canvas.height * s;
  }
  
  function _showLevelName(level)
  {
    _msgFrame.show(StringResources.LEVEL + " " + (_curLevelIndex) + ". " + StringResources.LEVELS_NAMES[_curLevelIndex], true, "blue");  
  }
  
  function _saveCurrentLevelState()
  {
    if(_currentLevel)
    {
      var с = CookieHelper.getCookie(_SGC_NAME);
      if(!с)
        с = 0;
      var value = "i:" + (_curLevelIndex + 1) + ";m:" + _currentLevel.money + ";h:" +
        _currentLevel.healthPc + ";l:" + _currentLevel.lifes + ";d:" + (new Date()).getTime() + ";s:" + _skill;
      CookieHelper.setCookie(_S_NAME + с, value, _cookieElapsedTime);
      if(CookieHelper.getCookie(_S_NAME + с))
      {
        _msgFrame.show(StringResources.GAME_SUCCESS_SAVED, true, "green");  
        CookieHelper.setCookie(_SGC_NAME, ++с, _cookieElapsedTime);
      }
      else
        _msgFrame.show(StringResources.GAME_FAILED_SAVED, true, "red");  

    }
  }
  
  function _getState(index)
  {
    var v = CookieHelper.getCookie(_S_NAME + index);
    if(!v)
      return null;
    v = v.split(";");
    var state = new Object();
    state.index = _S_NAME + index;
    for(var j = 0; j < v.length; j++)
    {
      var p = v[j].split(":");
      var n = new Number(p[1]);
      switch(p[0])
      {
        case "m":
          state.money = n;
          break;
        case "h":
          state.health = n;
          break;
        case "l":
          state.lifes = n;
          break;
        case "i":
          state.level = n;
          break;
        case "d":
          state.date = new Date(n);
          break;
        case "s":
          state.skill = n;
          break;l
      }
    }
    return state;
  }
  
  function _loadIndicator(on_load_complete)
  {
    if(Cache.addedImageCount != Cache.loadedImgsCount)
    {
      _loadingPcIndicator.pc = ((Cache.loadedImgsCount - _loadingPcIndicator.addedImageCount) / (Cache.addedImageCount - _loadingPcIndicator.addedImageCount)) * 100;
      _loadingPcIndicator.redraw(_drawContext);    
      setTimeout(function(){ _loadIndicator(on_load_complete) }, 200);
    }
    else
    {
      delete _loadingPcIndicator;
      _loadingPcIndicator = null;
      if(!_msgFrame) //начало
      {
        _msgFrame = new Message(_innerContainer, "svitok.png", 2500, 0, 0, 6);
        _msgFrame.x = (_drawContext.canvas.width - _msgFrame.width) / 2;
        _msgFrame.y = 12;//_drawContext.canvas.height - _msgFrame.height;
        _msgFrame.widthEffect = new ExpandEffect(0.05, 0.002, 0.05, 0.3, 0.98, 1.02);
        _msgFrame.heightEffect = new ExpandEffect(0.05, 0.005, 0.05, 0.3, 0.95, 1.05);
      }
      if(on_load_complete)
        on_load_complete();
    }
  };
  
  var _mouseChoords;
  var _mouseChoordsEvent;
  function _updateEvent(event)
  {
    event.offsetX = event.clientX - _drawContext.x; //event.offsetX - не везде работает, например в FF
    event.offsetY = event.clientY - _drawContext.y; //event.offsetY - не везде работает, например в FF]
    if(DebugHelper.showMouseChoords)
    {
      _mouseChoordsEvent = event;
      if(!_mouseChoords)
        _mouseChoords = new TextSprite(function() { return _mouseChoordsEvent.offsetX.toFixed(2) + ":" + _mouseChoordsEvent.offsetY.toFixed(2); }, 
          "10px sans-serif", "#fefefe", _innerContainer, function(){ return _mouseChoordsEvent.offsetX; }, function() { return _mouseChoordsEvent.offsetY - 10; }, null, Infinity);
    }
  }
  
  function _onMouseMove(event)
  {
    _updateEvent(event);
    for(var i = 0; i < _mMoveHandlers.length; i++)
      _mMoveHandlers[i](event);
  }

  function _onMouseDown(event)
  {
    _updateEvent(event);
    for(var i = 0; i < _mDownHandlers.length; i++)
      _mDownHandlers[i](event);
  }

  function _onMouseUp(event)
  {
    _updateEvent(event);
    for(var i = 0; i < _mUpHandlers.length; i++)
      _mUpHandlers[i](event);
  }
  
  function _ctor()
  {
    _drawContext = new DrawContext(document.getElementById("playArea"));
    _drawContext.canvas.onmousemove = _onMouseMove;
    _drawContext.canvas.onmousedown = _onMouseDown;
    _drawContext.canvas.onmouseup = _onMouseUp;
    
    _innerContainer = new SpriteContainer(_drawContext);
    _spriteContainer = new SpriteContainer(_innerContainer);
    
    new TextSprite(function() { return _innerContainer.fps + " fps"; }, "10px sans-serif", "#fefefe", _innerContainer, 5, 10, null, 2);
    new TextSprite(function() { return _innerContainer.frameTimeCorrection + " cor"; }, "10px sans-serif", "#fefefe", _innerContainer, 5, 20, null, 3);
    new TextSprite(function() { return "0.4.17 ver"; }, "10px sans-serif", "#fefefe", _innerContainer, 5, 40, null, 4);

    _gameArea.cacheImages(["svitok.png", "dlg01.png", "dlgbtn01.png", "face02.png", "face03.png", "run.png", "stat.png", "heart.png", "buyq01.png"], function() 
                           { 
                              var url = unescape(document.URL);
                              var cmd_index = url.indexOf("#");
                              if(cmd_index != -1)
                              {
                                var cmd = url.substring(cmd_index + 1);
                                consoleProcessor(cmd);
                              }
                              else
                                _gameArea.startWithLevel(0);
                             _innerContainer.startRedrawing(60); 
                           });

    var console;
    var console_text = "";
    var cmd_keys = ["/map "];
    
    function consoleProcessor(cmd)
    {
      if(cmd)
      {
        cmd = cmd.toLowerCase();
        if(cmd.indexOf(cmd_keys[0]) == 0)
        {
          var lvl = parseInt(cmd.substring(cmd_keys[0].length));
          _openLevel(lvl, 1000, 100, 3);
        }
      }
      if(console)
      {
        _innerContainer.removeSprite(console);
        delete console;
        console = null;
      }
    }
    
    document.body.onkeydown = function(event)
    {
      switch(event.keyCode)
      {
        case 192://"~":
          if(!console)
            console = new TextSprite(function(){ return "Console > " + console_text; }, "10px sans-serif", "#fefefe", _innerContainer, 5, 60, null, 5);
          else
            consoleProcessor();
          break;
        case 8://"Backspace":
          if(console)
            console_text = console_text.substr(0, console_text.length - 1);
          break;
        case 32://"Spacebar":
          if(console)
            console_text += " ";
          break;
        case 13: //"Enter":
          if(console)
            consoleProcessor(console_text);
          break;
        case 111:
        case 191:
          if(console)
            console_text += "/";
          break;
        default:
          if(console)
            console_text += String.fromCharCode(event.keyCode);
          break;
      }
    }
  }
  
  _ctor();
}

function prepareOnLoad()
{
  if(typeof ({}.__defineGetter__) == 'function' || typeof (Object.defineProperty) == 'function')
    new GameArea();
  else
    alert("Your browser doesn't supported latest JavaScript version");
}