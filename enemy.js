/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/

//Коллизии антогониста и протогониста
var enemyPersCollision =
{
  none : 0,
  persLifeReduce : 1,
  enemyLifeReduce : 2,
  enemyDead : 3,
}

//Спрайт врага
//=> src - анимированный исходник спрайта
//   sc - контейнер спрайта
//   surface - поверхность, на которой бегает вражина
//   frame_width - размер одного фрейма
//   turn_left - номер первого и последнего фрейма для разворота из положения прямо влево (null - если нет])
//   turn_right - номер первого и последнего фрейма для разворота из положения прямо вправо (null - если нет)
//   run_left - номер первого и последнего фрейма для движения влево (обязательно)
//   run_right - номер первого и последнего фрейма для движения вправо (обязательно)
//   stay - номер фрейма для остановки (обязательно)
//   attack_left - номер первого и последнего фрейма для атаки влево (обязательно)
//   attack_right - номер первого и последнего фрейма для атаки вправо (обязательно)
//   z - z координата
function EnemySprite(src, sc, surface, frame_width, turn_left, turn_right, run_left, run_right, stay, attack_left, attack_right, z)
{
  var _states =
  {
    runLeft : 0,
    runRight : 1,
    turnStayLeft : 2,
    turnLeftStay : 3,
    turnStayRight : 4,
    turnRightStay : 5,
    attackLeft : 6,
    attackRight : 7,
    stay : 8
  };

  var _cur_frame = 0;
  var _state = _states.stay;
  var _img = new ImageSprite(src, null, 0, 0, z);
  var _healthPc;
  var _img_center = 0;
  var _dx = 0;
  var _speed_run = 0;
  var _ddx = 0;
  var _df = 0;
  var _health = 0;
  var _enabled = true;

  _img.x = surface.sprite.x + Random.int(0, surface.sprite.width - _img_center);
  _img.frameWidth = frame_width;
  updateDiffs();
  function updateDiffs()
  {
    _ddx = (1.55 * _speed_run) * _img.scale;
    _df = (0.25 * _speed_run);
    _img_center = _img.width / 1.4;
    if(_health > 1)
    {
      _healthPc = new ProgressBar(null, 0, 0, 50, 10);
      _healthPc.health = _health;
      _healthPc.pc = 100;
      _healthPc.addEffect(VisualEffects.transparency(0.5));
    }
  }  

  PropertyHelper.initializeSprite(this, sc, function() { return _img.x }, function() { return _img.y; }, z, function() {return _img.width; }, function() {return _img.height; }, function() { return surface.sprite.visible && _health > 0; });
  PropertyHelper.defineAccessors(this, "scale", [function() { return _img.scale; }, function(s) { _img.scale = s; updateDiffs(); }]);
  PropertyHelper.defineAccessors(this, "speedX", [function() { return _speed_run; }, function(s) { _speed_run = s; updateDiffs(); }]);
  PropertyHelper.defineAccessors(this, "health", [function() { return _healthPc ? _healthPc.pc : 100; }, function(h) { _health = h; updateDiffs(); }]);
  PropertyHelper.defineAccessors(this, "owningContainer", [function() { return sc; }, function(v) { if(!sc || !v) sc = v; else alert("cant' change container"); }]);
  this.deadEffect = null; //анимационный эффект смерти

  function increaseFrame()
  {
    return Math.floor(_cur_frame += _df);
  }
  function checkLeftBound()
  {
    return _img.x <= surface.sprite.x;
  }
  function checkRightBound()
  {
    return (_img.x + _img_center) >= (surface.sprite.x + surface.sprite.width);
  }
  function getChanceToChangeDirection(chance, directions)
  {
    if((Math.floor(_cur_frame) % chance) == 0) //каждые chance кадров - даем шанс изменить направление
    {
      switch(checkLeftBound() ? 3 : (checkRightBound() ? 2 : Random.int(1, 4)))
      {
        case 2:
          _cur_frame = 0;
          _state = directions[0];
          break;
        case 3:
          _cur_frame = 0;
          _state = directions[1];
          break;
      }
    }
  }
  this.redraw = function(dc/*, sender*/)
  {
    if(surface.sprite.visible)
    {
      _img.x = surface.sprite.x + _dx;
      _img.y = surface.y - _img.height + surface.d;
      _img.redraw(dc);
      if(_healthPc)
      {
        _healthPc.x = _img.x + (_img.width - _healthPc.width)/2;
        _healthPc.y = _img.y - _healthPc.height - 5;
        _healthPc.redraw(dc);
      }
      switch(_state)
      {
        case _states.stay:
          _img.frame = stay;
          _cur_frame++;
          getChanceToChangeDirection(30, [_states.turnStayLeft, _states.turnStayRight]);
          break;
        case _states.turnStayLeft:
          if(turn_left)
          {
            _img.frame = turn_left[1] - increaseFrame();
            if(_img.frame > turn_left[0])
              break;
          }
          _state = _states.runLeft;
          _cur_frame = 0;
          break;
        case _states.runLeft:
          var f = increaseFrame();
          _dx -= _ddx;
          _img.frame = f % (run_left[1] - run_left[0]) + run_left[0];
          if(checkLeftBound())
          {
            _cur_frame = 0;
            _dx = 0;
            _state = _states.turnLeftStay;
          }
          break;
        case _states.turnLeftStay:
          if(turn_left)
          {
            _img.frame = turn_left[0] + increaseFrame();
            if(_img.frame < turn_left[1])
              break;
          }
          _state = _states.stay;
          _cur_frame = 0;
          break;
        case _states.turnStayRight:
          if(turn_right)
          {
            _img.frame = turn_right[0] + increaseFrame();
            if(_img.frame < turn_right[1])
              break;
          }
          _state = _states.runRight;
          _cur_frame = 0;
          break;
        case _states.runRight:
          var f = increaseFrame();
          _dx += _ddx;
          _img.frame = f % (run_right[1] - run_right[0]) + run_right[0];
          if(checkRightBound())
          {
            _cur_frame = 0;
            _dx = surface.sprite.width - _img_center;
            _state = _states.turnRightStay;
          }
          break;
        case _states.turnRightStay:
          if(turn_right)
          {
            _img.frame = turn_right[1] - increaseFrame();
            if(_img.frame > turn_right[0])
              break;
          }
          _state = _states.stay;
          _cur_frame = 0;
          break;         
      }
    }
  }
  this.checkCollision = function(pers)
  {
    if(Math.abs(pers.x - _img.x + (pers.width - _img.width) / 2) <= 30)
    {
      var dy = pers.y + pers.height - _img.y;
      if(dy > 0 && pers.y < (_img.y + _img.height)) //начинается баттл
      {
        if(dy <= _img.height / 3) //дали по башке прям
          _health -= 1;
        else if(dy <= _img.height / 2) // дябнули в спину
          _health -= 0.2;
        else //вражина нас затоптал
        {
          switch(_state)
          {
            case _states.stay:
              _cur_frame = 0;
              _state = checkRightBound() ? _states.turnStayLeft : _states.turnStayRight;
              break;
            case _states.runRight:
              _cur_frame = 0;
              _state = _states.turnRightStay;
              break;
            case _states.runLeft:
              _cur_frame = 0;
              _state = _states.turnLeftStay;
              break;
          }
          return enemyPersCollision.persLifeReduce;
        }
        if(_healthPc)
          _healthPc.pc = 100 * _health / _healthPc.health;
        if(_health <= 0)
        {
          _health = 0;
          return enemyPersCollision.enemyDead;
        }
        else
          return enemyPersCollision.enemyLifeReduce;
      }
    }
    return enemyPersCollision.none;
  }
}