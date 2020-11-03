/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/
function RandomBackground(img_set, sc, x, y, w, h, z, scale_rnd, x_rnd, y_rnd) //параллаксный фон со случайными мутациями
{
  PropertyHelper.initializeSprite(this, null, x, y, z, w, h, true);

  if(scale_rnd === undefined) 
    scale_rnd = function() { return  Random.real(0.8, 1.2); }
  if(x_rnd === undefined)
    x_rnd = function() { return  Random.real(10, 200); }
  if(y_rnd === undefined)
    y_rnd = function() { return  Random.real(y, h); }
  
  var _parallaxKoeffX = 4;
  var _parallaxSpeedX = 0;
  var _linearSpeedX = 0;
  
  
  var _sprites = new SpriteContainer(sc, z);
  var _movProcessor = new Sprite(_sprites, 0, 0, -1);

  PropertyHelper.defineSetter(this, "parallaxKoeffX", function(pk) { _parallaxKoeffX = pk; });
  PropertyHelper.defineSetter(this, "parallaxSpeedX", function(ps) { _parallaxSpeedX = ps; });
  PropertyHelper.defineSetter(this, "linearSpeedX", function(ls) { _linearSpeedX = ls; });
  
  _movProcessor.redraw = function(dc)
  {
    if(_parallaxSpeedX || _linearSpeedX)
    {
      for(var i = 1; i < _sprites.length; i++)
      {
        var s  = _sprites.sprite(i);
        var dx = _parallaxSpeedX / ((1 + _sprites.length - s.zOrder) * _parallaxKoeffX) + _linearSpeedX;
        s.x += dx;
        if(dx < 0)
        {
          if((s.x + s.width) < (x + 20)) //двигаем влево и убежало за левый край
          {
            s.scale = scale_rnd(s);
            s.x = x + w + x_rnd(s);
            s.y = y_rnd(s);
          }
        }
        else if(s.x > (x + w + 20)) //иначе - двигаем вправо и убежало за левый край
        {
          s.scale = scale_rnd(s);
          s.y = y_rnd(s);
          s.x = x - s.width - x_rnd(s);
        }
      }
    }
  }
  
  for(var i = 0; i < img_set.length; i++)
  {
    var is = new ImageSprite(img_set[i], _sprites, 0, 0, i);
    is.x = x_rnd(is);
    is.y = y_rnd(is);
    is.scale = scale_rnd(is);
  }
}

function RepeatedBackground(img_src, sc, x, y, w, h, fract_pos, z) //горизонтальный фон
{
  var _linearSpeedX = 0;
  var _linearSpeedY = 0;
  var _sprites = new SpriteContainer(null, 0);
  var _columns;
  var _rows;

  PropertyHelper.initializeSprite(this, sc, x, y, z, w, h, true);
  PropertyHelper.defineSetter(this, "linearSpeedX", function(v) { _linearSpeedX = v; });
  PropertyHelper.defineSetter(this, "linearSpeedY", function(v) { _linearSpeedY = v; });
  this.repeatByX = true; //повторять фон по оси Х 
  this.repeatByY = true; //повторять фон по оси Y

  z = 1;
  var img = Cache.getImage(img_src);
  _rows = !h ? 1 : (Math.floor(h / img.height) + 2);
  _columns = Math.floor(w / img.width) + 2;
  for(var i = 0, new_y = y; i < _rows; i++)
  {
    var is;
    for(var j = 0, new_x = x; j < _columns; j++)
    {
      is = new ImageSprite(img_src, _sprites, new_x, new_y, z++);
      is.intPos = !fract_pos;
      new_x += is.width;
    }
    new_y += is.height;
  }

  this.redraw = function(dc)
  {
    if(!this.visible)
      return;
  //TODO следует переписать оптимальнее
    for(var i = 0; i < _sprites.length; i++)
    {
      var s  = _sprites.sprite(i);
      s.x += _linearSpeedX;
      s.y += _linearSpeedY;
    }
    if(this.repeatByX && _linearSpeedX)
    {
      for(var i = 0; i < _columns; i++)
      {
        var s  = _sprites.sprite(i);
        if(_linearSpeedX < 0)
        {
          if((s.x + s.width) <= this.x) //движение вправо и убежало за левый край - передвинуть колонку вправо
          {
            var col = (i + _columns - 1) % _columns;
            for(var j = 0; j < _rows; j++)
            {
              var from = _sprites.sprite(i+j*_columns);
              var to = _sprites.sprite(col+j*_columns);
              from.x = to.x + to.width;
            }
            break;
          }
        }
        else if(s.x > (this.x + this.width)) //иначе - движение влево и убежало за правый край
        {
          var col = (i + 1) % _columns;
          for(var j = 0; j < _rows; j++)
          {
            var from = _sprites.sprite(i+j*_columns);
            var to = _sprites.sprite(col+j*_columns);
            from.x = to.x - from.width;
          }
          break;
        }
      }
    }
    else
      this.x += _linearSpeedX;
    if(this.repeatByY && _linearSpeedY)
    {
      for(var i = 0; i < _rows; i++)
      {
        var s  = _sprites.sprite(i*_columns);
        if(_linearSpeedY < 0)
        {
          if((s.y + s.height) <= this.y) //движение вниз и убежало за верхний край - передвинуть ряд вниз
          {
            var row = (i + _rows - 1) % _rows;
            for(var j = 0; j < _columns; j++)
            {
              var from = _sprites.sprite(i*_columns + j);
              var to = _sprites.sprite(row*_columns+j);
              from.y = to.y + to.height;
            }
            break;
          }
        }
        else if(s.y > (this.y + this.height)) //иначе - движение вверх и убежало за нижний край
        {
          var row = (i + 1) % _rows;
          for(var j = 0; j < _columns; j++)
          {
            var from = _sprites.sprite(i*_columns+j);
            var to = _sprites.sprite(row*_columns+j);
            from.y = to.y - from.height;
          }
          break;
        }
      }
    }
    else
      this.y += _linearSpeedY;
    _sprites.redraw(dc);
  }
}