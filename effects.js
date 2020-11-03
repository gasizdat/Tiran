/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/

//¬изуальный эффект, примен¤емый к размерност¤м
//=> inrease_speed - скорость эффекта при первом по¤влении (в пересчете на кадр анимации)
//   transform_speed - скорость трансформации после полного по¤влени¤ эффекта
//   decrease_speed - скорость эффекта при исчезании
//   start - начальна¤ трансформаци¤ рзмерности
//   min - минимальна¤ трансформаци¤ размерности, после которой она будет стремитьс¤ к max
//   max - максимальна¤ трансформаци¤ размерности, после которой она будет стремитьс¤ к min
function ExpandEffect(inrease_speed, transform_speed, collapse_speed, start, min, max)
{
  var _k = 0;
  this.increase = function()
  {
    if(_k == 0)
    {
      start += inrease_speed;
      if(start >= min)
      {
        start = min;
        _k = 1;
      }
    }
    else if(_k > 0)
    {
      start += transform_speed;
      if(start >= max)
      {
        start = max;
        _k = -_k;
      }
    }
    else if(_k < 0)
    {
      start -= transform_speed;
      if(start <= min)
      {
        start = min;
        _k = -_k;
      }
    }
    return start;
  }
  this.decrease = function()
  {
  }
}

//јвтоматические аниматоры
var Controllers =
{
  //Ћинейный контроллер start->speed->end
  linear : function(start, end, speed)
  {
    if(start > end)
    {
      return function()
      {
        return start = Math.max(end, start - speed);
      }
    }
    else
    {
      return function()
      {
        return start = Math.min(end, start + speed);
      }
    }
  },
  //÷иклический контроллер start->speed->max->min->speed->max->... или start->speed->min->max->speed->min->...
  cyclic : function(start, min, max, speed)
  {
    return function()
    {
      start += speed;
      if(start > max)
        start = min;
      else if(start < min)
        start = max;
      return start;
    }
  },
  //¬олновой контроллер start->speed->max->speed->min->speed->max->... или start->speed->min->speed->max->speed->min->...
  waving : function(start, min, max, speed)
  {
    return function()
    {
      start += speed;
      if(start >= max)
      {
        start = max;
        speed = -speed;
      }
      else if(start <= min)
      {
        start = min;
        speed = -speed;
      }
      return start;
    }
  },
};

//¬изуальные эффекты
var VisualEffects = 
{
  trigger : function(value, trigger)
  {
    var v = (value instanceof Function) ? value : function(){ return value; };
    return function (sprite, dc)
    {
      if(trigger)
        trigger(v(), sprite, dc);
    }
  },
  //Ёффект изменени¤ произвольного параметра
  //=> param_name - им¤ измен¤еого параметра
  //   value - значение или функтор изменени¤ параметра
  //   trigger - функтор триггера, срабатывающего каждый раз, когда примен¤етс¤ эффект
  parametric : function(param_name, value, trigger)
  {
    var v = (value instanceof Function) ? value : function(){ return value; };
    return function (sprite, dc)
    {
      var _ = v();
      sprite[param_name] = _;
      if(trigger)
        trigger(_, sprite, dc);
    }
  },
  //Ёффект прозрачности
  //=> value - значение или функтор прозрачности (0 - полна¤ прозрачность, 1 - полна¤ непрозрачность)
  //   trigger - функтор триггера, срабатывающего каждый раз, когда примен¤етс¤ эффект
  transparency : function(value, trigger)
  {
    var v = (value instanceof Function) ? value : function(){ return value; };
    return function (sprite, dc)
    {
      var _ = v();
      dc.context.globalAlpha = 1 - _;
      if(trigger)
        trigger(_, sprite, dc);
    }
  },
  //Ёффект сжимаемости
  //=> value - значение или функтор сжимаемости (0 - сжат в точку, 1 - полный размер)
  //   trigger - функтор триггера, срабатывающего каждый раз, когда примен¤етс¤ эффект
  squeezability : function(value, trigger)
  {
    var v = (value instanceof Function) ? value : function(){ return value; };
    return function (sprite, dc)
    {
      sprite.scale = v();
      if(trigger)
        trigger(sprite.scale, sprite, dc);
    }
  },
  //Ёффект поворота вокруг выбранной точки, относительно поворачиваемого спрайта
  //=> value - значение или функтор угла поворота в радианах (0 - поворота нет)
  //   pivot - точка вращени¤ с координатами, относительно левого верхнего угла спрайта
  //   trigger - функтор триггера, срабатывающего каждый раз, когда примен¤етс¤ эффект
  rotative : function(value, pivot, trigger)
  {
    var v = (value instanceof Function) ? value : function(){ return value; };
    return function (sprite, dc)
    {
      var _ = v();
      if(_)
      {
        dc.context.rotate(_);
        var x1 = sprite.x + pivot.x;
        var y1 = sprite.y + pivot.y;
        var ob = Math.sqrt(x1*x1 + y1*y1);
        var a2 = Math.asin(y1/ob) - _;
        x1 = Math.cos(a2) * ob - x1;
        y1 = Math.sin(a2) * ob - y1;
        dc.context.translate(x1, y1);
      }
      if(trigger)
        trigger(_, sprite, dc);
    }
  }  
}