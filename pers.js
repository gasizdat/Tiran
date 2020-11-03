/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/

function MainPerson(game_area, ground_levels_getter, sc, health_pc, lifes_count, x, y, face_z, body_z)
{ 
  var _frameCount = 0;
  var _clipCount = 0;
  var _runSpeedX = 0;
  var _runDinamic = 0.17;
  var _jumpSpeedX = 0;
  var _jumpLevel = 0; //уровень прыжка персонажа
  var _jumpDinamic = 5;
  var _curGroundLevel; //текущий уровень ландшафта, по которому гуляем
  var _faceDip = 20;
  var _faceSprite = new ImageSprite("face03.png", sc, 0, 0, face_z);
  var _bodySprite = new ImageSprite("run.png", sc, 0, 0, body_z);
  _bodySprite.frameWidth = 80;
  var _width = 15;
  var _height = _faceSprite.height + _bodySprite.height - _faceDip;
  var _faceOffsetX = (_width - _faceSprite.width) / 2;
  var _bodyOffsetX = (_width - _bodySprite.width) / 2;
  var _persOffsetX = _width / 2;
  var _persOffsetY = _height / 2;
  var _minFrameIncrementation = 0.3; //Минимальное значение приращения фрейма анимации
  var _runFramesCount = 12; //Число фреймов основного движения
  var _accelerationKoeff = 1; //Коэффициент ускорения движений
  var _dxHysteresis = 30; //Гистерезис разности координат мыши и протогониста, при котором ускорение не фиксируется
  var _barrierHysteresis = 5; //Гистерезис определения упирания в барьер
  var _angle = 0; //Угол поворота перса в пространстве (радианы)
  var _lastY;
  
  PropertyHelper.initializeSprite(this, sc, [function(){ return x; }, _setX], [function(){ return y; }, _setY], Math.min(face_z, body_z), function(){ return _width; }, function() { return _height; }, true);
  this.addEffect = function(e)
  {
    _faceSprite.addEffect(e);
    _bodySprite.addEffect(e);
  }
  
  PropertyHelper.defineGetter(this, "bottom", function(){ return this.y + this.height - (_curGroundLevel ? _curGroundLevel.d : 0); }); //индикатор здоровья текущей инкарнации
  PropertyHelper.defineGetter(this, "healthPc", function(){ return health_pc; }); //индикатор здоровья текущей инкарнации
  PropertyHelper.defineGetter(this, "lifeCount", function(){ return lifes_count; }); //число инкарнаций, после чего превращаемся в баобаба
  PropertyHelper.defineAccessors(this, "frame", [function(){ return _bodySprite.frame; }, function(f) { _bodySprite.frame = f; }]);
  PropertyHelper.defineAccessors(this, "speedX", [function() { return _persSpeedX(); }, function(v){ _runSpeedX = v; _jumpSpeedX = 0; }]);
  //Динамика бега. Чем больше - тем быстрее носится, 0 - вообще не бегает
  PropertyHelper.defineAccessors(this, "runDinamic", [function() { return _runDinamic; }, function(v){ _runDinamic = v; }]);
  //Динамика прыжка. Чем больше - тем выше прыгает, 0 - вообще не прыгает
  PropertyHelper.defineAccessors(this, "jumpDinamic", [function() { return _jumpDinamic; }, function(v) { _jumpDinamic = v; }]);
  PropertyHelper.defineGetter(this, "currentGroundLevel", function() { return _curGroundLevel; });  
  PropertyHelper.defineAccessors(this, "jumpLevel", [function() { return _jumpLevel; }, function(v) { _jumpLevel = v; }]);  
  PropertyHelper.defineAccessors(this, "accelerationKoeff", [function(){ return _accelerationKoeff; }, function(v) { _accelerationKoeff = v; }]);
  PropertyHelper.defineAccessors(this, "angle", [function(){ return _angle; }, 
      function(v) 
      {
        _angle = v;
        if(!_faceSprite.effects)
        {
          PropertyHelper.defineGetter(this, "x", _getX);
          PropertyHelper.defineGetter(this, "y", _getY);
          PropertyHelper.defineGetter(this, "width", _getWidth);
          PropertyHelper.defineGetter(this, "height", _getHeight);

          var angle_functor = function() { return _angle; };
          _faceSprite.addEffect(VisualEffects.rotative(angle_functor, {x:_faceSprite.width / 2, y:(_height / 2 - _faceSprite.y)}));
          _bodySprite.addEffect(VisualEffects.rotative(angle_functor, {x:_bodySprite.width / 2, y:(_height / 2 - _bodySprite.y)}));        
        }
      }]);
  
  _setX(x);
  _setY(y);
  game_area.addMouseMoveHandler(_onMouseMove);
  game_area.addMouseDownHandler(_onMouseDown);  

  this.reduceLife = function(dpc)
  {
    health_pc -= dpc;
    if(health_pc <= 0 )
    {
      if((--lifes_count) <= 0)
        return false; //все, пришел пушной зверёк
      health_pc = 100;
    }
    if(_clipCount == 0)
    {
      _clipCount = 7;
      _faceClip();
    }
    else
      _clipCount = 7;
    return true; //пока живем
  }

  this.increaseLife = function(dpc)
  {
    health_pc += dpc;
    if(health_pc > 100 )
    {
      health_pc = 100;
      if(lifes_count < 3)
        lifes_count++;
    }
  }
  
  this.redraw = function(dc)
  {
    if(_jumpDinamic)
      _jumpProcessor(dc);
          
    if(!_jumpLevel) //когда не дрыгает ногами в прыжке - смотрится лучше
    {    
      var leader_speed_x = _runSpeedX; //(_jumpSpeedX && _runSpeedX) ? _jumpSpeedX / Math.abs(_runSpeedX) : _runSpeedX;
      var df = Math.abs(leader_speed_x) * _runDinamic;
      if(df < _minFrameIncrementation)
        df = _minFrameIncrementation;
      if(leader_speed_x < 0)
        _bodySprite.frame = Math.floor(_frameCount = (_frameCount + df) % _runFramesCount);
      else if(leader_speed_x > 0)
        _bodySprite.frame = _runFramesCount + Math.floor(_frameCount = (_frameCount + df) % _runFramesCount);
      else
        _bodySprite.frame = _runFramesCount * 2;
      if(_curGroundLevel)
        _setY(_curGroundLevel.y + _curGroundLevel.d - _height);
    }
  };

  this.finalize = function()
  {
    game_area.removeMouseMoveHandler(_onMouseMove);
    game_area.removeMouseDownHandler(_onMouseDown);
  }
  
  function _setX(v)
  {
    x = v;
    _faceSprite.x = x + _faceOffsetX;
    _bodySprite.x = x + _bodyOffsetX;
  }
  
  function _setY(v)
  {
    y = v;
    _faceSprite.y = v;
    _bodySprite.y = v + _faceSprite.height - _faceDip;
  }

  function _getX()
  {
    return x + _persOffsetX - _getWidth()/2;
  };

  function _getY()
  { 
    return y + _persOffsetY - _getHeight() / 2;
  };

  function _getWidth()
  { 
    return Math.abs(_width * Math.cos(_angle)) + Math.abs(_height * Math.sin(_angle));
  };

  function _getHeight()
  { 
    return Math.abs(_height * Math.cos(_angle)) + Math.abs(_width * Math.sin(_angle));
  };
    
  function _persSpeedX()
  {
    return _runSpeedX + _jumpSpeedX;
  }
  
  function _faceClip()
  {
    if(_clipCount--)
    {
      _faceSprite.visible = !_faceSprite.visible; 
      setTimeout(_faceClip, 200);
    }
    else
    {
      _clipCount = 0; //т.к. может поменяться асинхронно
      _faceSprite.visible = true;
    }
  }
  
  function _checkFailingStop(g_levels_array, dy)
  {
    if(g_levels_array)
    {
      for(var i = 0; i < g_levels_array.length; i++)
      {
        var g = g_levels_array[i];
        if(g instanceof Array)
        {
          if(_checkFailingStop(g, dy))
            return true;
        }
        else if(!g.ended(x + _persOffsetX))
        {
          var gy = g.y + g.d;
          if((y + _height + dy) >= gy && (y + _height) <= gy)
          {
            _curGroundLevel = g;
            _setY(gy - _height);
            _jumpLevel = 0;
            _jumpSpeedX = 0;
            _lastY = null;
            return true;
          }
        }
      }
    }
    return false;
  }
  
  function _jumpProcessor(dc)
  {
    var jmp_limit = 10 / _jumpDinamic;
    var d_pers_jmp_speed_x = _jumpSpeedX / (_jumpDinamic * 10);
    if(Math.abs(_jumpSpeedX) > Math.abs(d_pers_jmp_speed_x))
      _jumpSpeedX -= d_pers_jmp_speed_x;
    else
      _jumpSpeedX = 0;
    if(_jumpLevel > 0)
    {
      var d_y = y - _jumpLevel;
      var dd_y = d_y / _jumpDinamic;
      if(dd_y < jmp_limit)
        dd_y = jmp_limit;
      _setY(y - dd_y);
      if(d_y < 1.0)
      {
        _setY(_jumpLevel);
        _jumpLevel = -(_jumpLevel - 0.01);
      }
    }
    else if(_jumpLevel < 0)
    {
      var d_y = y + _jumpLevel;

      var dd_y = d_y / _jumpDinamic;
      if(dd_y < jmp_limit)
        dd_y = jmp_limit;
      if(!ground_levels_getter || !_checkFailingStop(ground_levels_getter(x + _persOffsetX, y), dd_y))
        _setY(y + dd_y);
    }
    else /*_jumpLevel == 0*/ if(_curGroundLevel && _curGroundLevel.ended(x + _persOffsetX)) 
    {
      _jumpLevel = -y; //соскочили с текущего уровня ланшафта
      _jumpSpeedX = 0;
    }
  }

  function _onMouseMove(event)
  {
    var dx = x + _persOffsetX - event.offsetX;
    if(dx > 0 && dx >= _dxHysteresis)
      _runSpeedX = Math.log(dx * 0.1)*_accelerationKoeff;
    else if(dx < 0 && (-dx) >= _dxHysteresis)
      _runSpeedX = -Math.log((-0.1) * dx)*_accelerationKoeff;
    else
      _runSpeedX = 0;
  }
  
  function _onMouseDown(event)
  {
    if(_jumpDinamic)
    {
      var v = y + _height - (Math.pow(Math.E/1.5, Math.abs(_runSpeedX)) / (0.1 * _accelerationKoeff) + _height * 1.5 /*выше головы не прыгаем*/);
      if(v < 0)
        v = 1;
      if(!_jumpLevel)
      {
        _jumpLevel = v;
        _jumpSpeedX = 2 * _runSpeedX;
      }
    }
  }
  
}