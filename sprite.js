/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/

function SpriteContainer(context, z)
{
  var _sprites = new Array();
  var _lastStatTime;
  var _lastFrameTime;
  var _fpsCount = 0;
  var _fpsDisplayCount = 0;
  var _frameTimeCorrection = 0;
  var _frameTimeCorrectionSum = 0;
  var _frameTimeCorrectionDisplay = 0;
  var _animachine = window.requestAnimationFrame || window.msRequestAnimationFrame ||
      window.mozRequestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
  var _pause = false;
  
  PropertyHelper.defineGetter(this, "fps", function() { return _fpsDisplayCount; });
  PropertyHelper.defineGetter(this, "length", function() { return _sprites.length; });
  PropertyHelper.defineGetter(this, "frameTimeCorrection", function() { return _animachine ? _animachine.name : _frameTimeCorrectionDisplay.toFixed(1); });
  this.zOrder = z;
  
  this.sprite = function(index) { return _sprites[index]; };
  
  this.startRedrawing = function(fps)
  {
    _fpsDisplayCount = fps;
    _lastFrameTime = _lastStatTime = new Date();
    var to = 1000/fps;
    var rdf = function()
    {
      _fpsCount++;
      var now_time = new Date();
      _frameTimeCorrection += now_time - _lastFrameTime - to;
      if(_frameTimeCorrection >= to)
        _frameTimeCorrection = to - 1;
      _frameTimeCorrectionSum += _frameTimeCorrection;
      _lastFrameTime = now_time;
      if((now_time - _lastStatTime) > 1000)
      {
        _frameTimeCorrectionDisplay = _frameTimeCorrectionSum / _fpsCount;
        _frameTimeCorrectionSum = 0;
        _fpsDisplayCount = _fpsCount;
        _fpsCount = 0;
        _lastStatTime = now_time;
      }
      if(!_pause)
      {
        DebugHelper.redrawOrder = 0;
        this.redraw(this.drawContext);
      }
      if(_animachine)
        _animachine(rdf);
      else
        setTimeout(rdf, to - _frameTimeCorrection);
    }.bind(this);
    rdf();
  }
  
  this.pause = function(p)
  {
    _pause = p;
  }
  
  this.addSprite = function(sprite)
  {
    for(var i = 0; i < _sprites.length; i++)
    {
      if(_sprites[i].zOrder > sprite.zOrder)
      {
        _sprites = (new Array()).concat(_sprites.slice(0, i), sprite, _sprites.slice(i));
        return i;
      }
    }
    _sprites.push(sprite);
    return _sprites.length - 1;
  };
  
  this.removeSprite = function(sprite)
  {
    for(var i = 0; i < _sprites.length; i++)
    {
      if(_sprites[i] == sprite)
      {
        _sprites.splice(i, 1);
        return;
      }
    }
    alert("sprite wasn't delete");
  }
  
  this.redraw = function(dc)
  {
  
    if(DebugHelper.showSpriteBounds)
    {
      dc.context.strokeStyle = "#e5e5e5";
      for(var i = 0; i < _sprites.length; i++)
      {
        var s = _sprites[i];
        s.redraw(dc);
        if(s.x !== undefined && s.y !== undefined && s.width !== undefined && s.height !== undefined)
        {
          if(DebugHelper.showSpriteRedrawOrder)
          {
            DebugHelper.redrawOrder++;
            dc.context.fillText(DebugHelper.redrawOrder, s.x + s.width, s.y);
          }
          dc.context.lineWidth = 1;
          dc.context.strokeRect(s.x, s.y, s.width, s.height);
        }
      }
    }
    else
    {
      for(var i = 0; i < _sprites.length; i++)
        _sprites[i].redraw(dc);
    }
  }
  
  this.clear = function()
  {
    delete _sprites;
    _sprites = new Array();
  }
  
  if(context instanceof SpriteContainer)
  {
    context.addSprite(this);
    PropertyHelper.defineGetter(this, "drawContext", function() { return context.drawContext; });
  }
  else if(context instanceof DrawContext)
    PropertyHelper.defineGetter(this, "drawContext", function() { return context; });
  else if(context)
  {
    alert("undefined context");
    throw "ctor SpriteContainer invalid argument context";
  }
}

function Sprite(sc, x, y, z)
{
  PropertyHelper.initializeSprite(this, sc, x, y, z, null, null, false);
}

function SupplySprite(sprite, sc, type, value)
{
  PropertyHelper.initializeSprite(this, sc, [function(){ return sprite.x; }, function(v){ sprite.x = v; }], 
    [function() { return sprite.y; }, function(v) { sprite.y = v; }], [function() { return sprite.zOrder; }, function(v) { sprite.zOrder = v; }],
    [function() { return sprite.width; }, function(v) { sprite.width = v; }], [function() { return sprite.height; }, function(v) { sprite.height = v; }], 
    [function() { return sprite.visible; }, function(v) { sprite.visible = v; }]);
  PropertyHelper.defineGetter(this, "type", function() { return type; });
  PropertyHelper.defineGetter(this, "value", function() { return value; });
  this.redraw = sprite.redraw.bind(sprite);
}

//“екстовый спрайт
//=> text_func - функтор текста
//   color - цвет текста
//   sc - спрайт-контейнер
//   x,y,z - координаты
//   w - максимально дозволенна¤ ширина текста, если null - без ограничений
function TextSprite(text_func, font, color, sc, x, y, w, z)
{
  var _getText;
  PropertyHelper.initializeSprite(this, sc, x, y, z, w, null, true);
  PropertyHelper.defineAccessors(this, "text", [_getText, function(v) { _getText = v instanceof Function ? v : function() { return v; } }]);
  PropertyHelper.defineAccessors(this, "font", [function() { return font; }, function(v) { font = v; }]);
  PropertyHelper.defineAccessors(this, "color", [function() { return color; }, function(v) { color = v; }]);
  
  this.text = text_func;
  
  this.redraw = function(dc)
  {
    if(font)
      dc.context.font = font;
    if(color)
      dc.context.fillStyle = color;
    var txt = /*"x:" + this.x + "y:" + this.y + " " + */_getText();
    if(w)
      dc.context.fillText(txt, ~~this.x, ~~this.y, ~~w);
    else
      dc.context.fillText(txt, ~~this.x, ~~this.y);
    this.width = dc.context.measureText(txt).width;
    if(w)
      this.width = Math.min(w, this.width);
  };
};
/*
//—прайт изображени¤
//=> src - путь к ресурсу
//   sc - спрайт-контейнер
//   x,y,z - координаты
function ImageSprite(src, sc, x, y, z)
{
  var _auto_frame_count = 0;
  var _img = Cache.getImage(src);
  var _hide = false;
  var _isVisible = false;
  PropertyHelper.initializeSprite(this, sc, x, y, z, 
    [function() { return (this.frameWidth ? this.frameWidth : _img.width) * this.scale; }], 
    [function() { return _img.height * this.scale; }], 
    [ function() { return _isVisible; }, function(v) { _hide = !v; }]);

  this.intPos = true;  //признак рассчета позиции спрайта в целом виде.
  this.scale = 1;      //масштабирование размеров
  this.frame = 0;      //номер фрейма анимации
  this.frameWidth = 0; //0, если спрайт не анимированный, иначе - размер кадра анимации (кадры расположены горизонтально)
  
  this.redraw = function(dc)
  {
    var sx, sy, sw, sh, 
        px = this.intPos ? (~~this.x) : this.x, 
        py = this.intPos ? (~~this.y) : this.y,
        pw = ~~this.width,
        ph = ~~this.height;
    _isVisible = !_hide && (px + pw) > 0 && px < dc.width && (py + ph) > 0 && py < dc.height;
    if(_isVisible)
    {
      sy = 0;
      sh = _img.height;
      if(this.frameWidth)
      {
        sx = (~~this.frame) * (~~this.frameWidth);
        sw = ~~this.frameWidth;
      }
      else
      {
        sx = 0;
        sw = _img.width;
      }
      if(px < 0)
      {
        var spx = ~~(px / this.scale);
        sx = -spx;
        sw += spx;
        pw += px;
        px = 0;
      }
      var dpw = (px + pw) - dc.width;
      if(dpw > 0)
      {
        sw -= ~~(dpw / this.scale);
        pw -= dpw;
      }
      if(py < 0)
      {
        var spy = ~~(py / this.scale);
        sy = -spy;
        sh += spy;
        ph += py;
        py = 0;
      }
      var dph = (py + ph) - dc.height;
      if(dph > 0)
      {
        sh -= ~~(dph / this.scale);
        ph -= dph;      
      }
      dc.context.drawImage(_img, sx, sy, sw, sh, px, py, pw, ph);
    }
  } 
}*/
//—прайт изображени¤
//=> src - путь к ресурсу
//   sc - спрайт-контейнер
//   x,y,z - координаты
function ImageSprite(src, sc, x, y, z)
{
  var _auto_frame_count = 0;
  var _img = Cache.getImage(src);
  var _hide = false;
  var _isVisible = false;
  PropertyHelper.initializeSprite(this, sc, x, y, z, 
    [function() { return (this.frameWidth ? this.frameWidth : _img.width) * this.scale; }], 
    [function() { return _img.height * this.scale; }], 
    [ function() { return _isVisible; }, function(v) { _hide = !v; }]);

  this.intPos = true;  //признак рассчета позиции спрайта в целом виде.
  this.scale = 1;      //масштабирование размеров
  this.frame = 0;      //номер фрейма анимации
  this.frameWidth = 0; //0, если спрайт не анимированный, иначе - размер кадра анимации (кадры расположены горизонтально)
  
  this.redraw = function(dc)
  {
    var w = this.width;
    var h = this.height;
    _isVisible = !_hide && (this.x + w) > 0 && this.x < dc.width && (this.y + h) > 0 && this.y < dc.height;
    if(_isVisible)
    {
      if(this.frameWidth)
      {
        dc.context.drawImage(_img, Math.floor(Math.floor(this.frame)*this.frameWidth), 0, Math.floor(this.frameWidth), Math.floor(_img.height), 
          this.intPos ? Math.floor(this.x) : this.x, this.intPos ? Math.floor(this.y) : this.y, Math.floor(w), Math.floor(h));
      }
      else
        dc.context.drawImage(_img, this.intPos ? Math.floor(this.x) : this.x, this.intPos ? Math.floor(this.y) : this.y, Math.floor(w), Math.floor(h));
    }
  } 
}

//—прайт сложной поверхности
//=> src_array - список путей к ресурсам поверхностей. —лои будут соответствовать пор¤дку в массиве (сверху вниз)
//   sc - спрайт-контейнер
//   x,y,z - координаты
//   w, h - размеры
function SurfaceSprite(src_array, sc, x, y, w, h, z)
{
  var _restrictingPath;
  var _cacheCanvas = { res:null };
  var _isVisible = false;
  PropertyHelper.initializeSprite(this, sc, x, y, z, w, h, function() { return _isVisible; });
  //«адание массива набора точек, дл¤ ограничивающего пути. — помощью данного набора можно 
  PropertyHelper.defineSetter(this, "restrictingPath", function(v) { _restrictingPath = v; });
  this.level = -1;

  function imageFactory(width, height, rp)
  {
    var dx = 0;
    var dy = 0;
    var ret = document.createElement("canvas");
    ret.width = width;
    ret.height = height;
    var cache_context =  ret.getContext("2d");
    for(var i = 0; i < src_array.length; i++)
    {
      var img = Cache.getImage(src_array[i]);
      for(;;)
      {
        cache_context.drawImage(img, ~~dx, ~~dy, img.width, img.height);
        dx += img.width;
        if(width <= dx)
        {
          dy += img.height;
          dx = 0;
          if(i != (src_array.length - 1) || height <= dy)
            break;
        }
      }
    }
    if(rp && rp.length)
    {
      cache_context.globalCompositeOperation = "destination-in";
    //cache_context.fillStyle = "blue";
      cache_context.beginPath();
      cache_context.moveTo(rp[0].x, rp[0].y);
      for(var i = 1; i < rp.length; i++)
        cache_context.lineTo(rp[i].x, rp[i].y)
      cache_context.closePath();
      cache_context.fill();
    }
    return ret;
  }
  
  this.redraw = function(dc)
  {
    _isVisible = (this.x + this.width) > 0 && this.x < dc.width && (this.y + this.height) > 0 && this.y < dc.height;
    if(_isVisible)
    {
      dc.context.drawImage((!_cacheCanvas.res) ? (_cacheCanvas.res = imageFactory(this.width, this.height, _restrictingPath)) : _cacheCanvas.res, ~~this.x, ~~this.y, ~~this.width, ~~this.height);
//      dc.context.fillText("x:" + this.x.toFixed(2) + ", y:" + this.y.toFixed(2) + ", w:" + this.width.toFixed(2) + ", z:" + this.zOrder, this.x, this.y + 10);
    }
    else if(_cacheCanvas.res)
    {
      delete _cacheCanvas.res;
      _cacheCanvas.res = null;
    }
  }
}

function Message(sc, src, timeout, x, y, z)
{
  var _img = Cache.getImage(src);
  var _isVisible = false;
  var _showTime;
  var _msg;
  PropertyHelper.initializeSprite(this, null, x, y, z, function(){ return _img.width; }, function(){ return _img.height; }, function() { return _isVisible; });
  
  this.widthEffect;//Ёффект анимации ширины
  this.heightEffect;//Ёффект анимации высоты

  this.redraw = function(dc)
  {
    var w = this.width;
    if(this.widthEffect)
      w *= this.widthEffect.increase();
    var h = this.height;
    if(this.heightEffect)
      h *= this.heightEffect.increase();
    dc.context.drawImage(_msg, ~~this.x, ~~this.y, ~~w, ~~h);
    if(_showTime <= new Date())
    {
      this.close();
    }
  }
  this.show = function(txt, caching, color, local_timeout)
  {
    _showTime = new Number(new Date()) + (local_timeout ? local_timeout : timeout);
    if(!_isVisible)
      sc.addSprite(this);
    _isVisible = true;
    if(!caching || !Cache.hasMessage(txt))
    {
      _msg = document.createElement("canvas");
      _msg.width = this.width;
      _msg.height = this.height;
      var cache_context =  _msg.getContext("2d");
      cache_context.drawImage(_img, 0, 0);
      cache_context.fillStyle = color;
      cache_context.font="25px Comic Sans MS";
      cache_context.shadowColor = "#808080";
      cache_context.shadowOffsetX = 5;
      cache_context.shadowOffsetY = 5;
      cache_context.shadowBlur = 5;
      cache_context.fillText(txt, 25, this.height / 2 + 10, this.width - 50);
      Cache.addMessageToCache(txt, _msg);
    }
    else
      _msg = Cache.getMessage(txt);
  }
  this.close = function()
  {
    if(_isVisible)
    {
      _isVisible = false;
      sc.removeSprite(this);  
    }
  }
}

function ProgressBar(sc, x, y, w, h, z)
{
  var _gradient;
  var _canvas;
  var _startColor = "#00AA00";
  var _stopColor = "#007511";
  var _lastPC = -1;
  PropertyHelper.initializeSprite(this, sc, x, y, z, w, h, true);
  
  this.pc = 0;
  PropertyHelper.defineAccessors(this, "startColor", [function() { return _startColor; }, function(c) { _startColor = c; _gradient = null; }]);
  PropertyHelper.defineAccessors(this, "stopColor", [function() { return _stopColor; }, function(c) { _stopColor = c; _gradient = null; }]);
  this.redraw = function(dc)
  {
    if(!_gradient)
    {
      _gradient = dc.context.createLinearGradient(0, 0, this.width, this.height);
      _gradient.addColorStop(0, _startColor);
      _gradient.addColorStop(1, _stopColor);
    }
    if(_lastPC != this.pc)
    {
      _lastPC = this.pc;
      delete _canvas;
      _canvas = document.createElement("canvas");
      _canvas.width = this.width;
      _canvas.height = this.height;
      var _canvas_context = _canvas.getContext("2d");
      _canvas_context.fillStyle = _gradient;
      _canvas_context.fillRect(0, 0, this.width, this.height);
    }
    dc.context.drawImage(_canvas, ~~this.x, ~~this.y, ~~(this.width * Math.max(this.pc, 0) / 100), ~~this.height);    
  }
}

function DialogBox(game_area)
{
  var _sprites = new SpriteContainer(null, 0);
  var _parent;
  var _onMouseClick;
  var _sender = this;
  var _lastX;
  var _lastY;
  
  PropertyHelper.defineGetter(this, "visible", function() { return _parent; });
  PropertyHelper.defineAccessors(this, "onMouseClick", [function() { return _onMouseClick; }, function(h) { _onMouseClick = h; } ]);
  this.zOrder = 0;
  
  function mdh(event)
  {
    for(var i = 0; i < _sprites.length; i++)
    {
      var s = _sprites.sprite(i);
      if(s.x <= event.offsetX && (s.x + s.width) >= event.offsetX &&
        s.y <= event.offsetY && (s.y + s.height) >= event.offsetY && _onMouseClick)
          _onMouseClick(_sender, s);
    }
  }

  this.addSprite = function(sprite)
  {
    _sprites.addSprite(sprite);
  }
 
  this.show = function(sc, x, y, z)
  {
    _parent = sc;
    PropertyHelper.initializeSprite(this, sc, x, y, z, 0, 0, true);
    for(var i = 0; i < _sprites.length; i++)
    {
      var sprite = _sprites.sprite(i);
      this.width = Math.max(this.width, sprite.x + sprite.width);
      this.height = Math.max(this.height, sprite.y + sprite.height);
      sprite.x += this.x;
      sprite.y += this.y;
    }
    _lastX = this.x;
    _lastY = this.y;
    game_area.addMouseDownHandler(mdh);
  }

  this.finalize = function()
  {
    game_area.removeMouseDownHandler(mdh);
    _parent.removeSprite(this);
    _parent = null;
  }

  this.redraw = function(dc)
  {
    var dx = this.x - _lastX;
    var dy = this.y - _lastY;
    _lastX = this.x;
    _lastY = this.y;
    for(var i = 0; i < _sprites.length; i++)
    {
      var sprite = _sprites.sprite(i);
      sprite.x += dx;
      sprite.y += dy;
    }
    _sprites.redraw(dc);
  }
}

function WaterSprite(sc, x, y, w, h, z)
{
  var _waterFlowEffect = 0;
  var _waterFlowEffect2 = 0;
  
  PropertyHelper.initializeSprite(this, sc, x, y, z, w, h, true);
  this.dimpleSpeed = 0.01;
  this.dimpleWavelength = 0.13; //длина волны дл¤ р¤би в % от ширины спрайта
  this.dimpleColors = ["#0080FF", "#296969"]; //цвета р¤би
  this.linearSpeedX = 0;
    
  this.redraw = function(dc)
  {
    var water_flow = dc.context.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
    for(var i = 0, j = 0; i < 1; i += this.dimpleWavelength, j++)
      water_flow.addColorStop((1 + i + _waterFlowEffect) % 1, this.dimpleColors[j % this.dimpleColors.length]);
    _waterFlowEffect = (_waterFlowEffect + this.dimpleSpeed + this.linearSpeedX) % 100;
    if(_waterFlowEffect < 0)
      _waterFlowEffect += 1;
    else if(_waterFlowEffect > 0)
      _waterFlowEffect -= 1;
    
    dc.context.fillStyle = water_flow;
    dc.context.fillRect(this.x, this.y, this.width, this.height);
  }
  
}

function Slider(game_area, sc, x, y, w, h, z)
{
  var _cacheCanvas = { sliderBar:null, slider:null, sliderX:0 };
  var _mDown = false;
  
  PropertyHelper.initializeSprite(this, sc, x, y, z, w, h, true);
  this.borderWidth = 3;
  this.borderColor = "#008080";
  this.bgColor = "#74ABAF";
  this.sliderColor = "green";
  this.position = 0;
  
  var _onSlider = function(e)
  {
    return e.offsetX >= this.x && e.offsetX <= (this.x + this.width) && e.offsetY >= this.y && e.offsetY <= (this.y + this.height);
  }.bind(this);
  
  var _onMouseMove = function(e)
  {
    if(_mDown)
    {
      _cacheCanvas.sliderX = e.offsetX - _cacheCanvas.slider.width/2;
      if(_cacheCanvas.sliderX < (this.x + this.borderWidth))
        _cacheCanvas.sliderX = (this.x + this.borderWidth);
      else if(_cacheCanvas.sliderX > (this.x + this.width - this.borderWidth - _cacheCanvas.slider.width))
        _cacheCanvas.sliderX = (this.x + this.width - this.borderWidth - _cacheCanvas.slider.width);
      this.position = (_cacheCanvas.sliderX - this.x) / (_cacheCanvas.sliderBar.width - _cacheCanvas.slider.width - this.borderWidth);
      game_area.drawContext.context.fillText(this.position, ~~this.x, ~~this.y);
    }
  }.bind(this);
  
  function _onMouseDown(e)
  {
    _mDown = _onSlider(e);
  }
  
  function _onMouseUp(e)
  {
    _mDown = false;
  }
  
  this.finalize = function()
  {
    delete _cacheCanvas.res;
    _cacheCanvas.res = null;
    game_area.removeMouseMoveHandler(_onMouseMove);
    game_area.removeMouseDownHandler(_onMouseDown);
    game_area.removeMouseUpHandler(_onMouseUp);
  }
  
  this.redraw = function(dc)
  {
    if(!_cacheCanvas.sliderBar)
    {
      _cacheCanvas.sliderBar = _build(this.width, this.height, this.borderWidth, this.borderColor, this.bgColor);
      _cacheCanvas.slider = _build(Math.max(5, this.width / 20), this.height - this.borderWidth*2, 0, null, this.sliderColor);
      _cacheCanvas.sliderX = this.x + this.borderWidth;
    }
    dc.context.drawImage(_cacheCanvas.sliderBar, ~~this.x, ~~this.y, ~~_cacheCanvas.sliderBar.width, ~~_cacheCanvas.sliderBar.height);
    dc.context.drawImage(_cacheCanvas.slider, _cacheCanvas.sliderX, ~~(this.y + this.borderWidth), ~~_cacheCanvas.slider.width, ~~_cacheCanvas.slider.height);
  }
  
  function _build(width, height, bw, bc, bgc)
  {
    var ret = document.createElement("canvas");
    ret.width = width;
    ret.height = height;
    var r = (height - bw *2) / 2;
    var cache_context =  ret.getContext("2d");
    cache_context.beginPath();
    cache_context.arc(r + bw, r + bw, r, -Math.PI/2, Math.PI/2, true);
    cache_context.lineTo(width - bw - r, height - bw);
    cache_context.arc(width - bw - r, r + bw, r, Math.PI/2, -Math.PI/2, true);
    cache_context.lineTo(r + bw, bw);
    cache_context.lineWidth = bw;
    if(bc)
      cache_context.strokeStyle = bc;
    cache_context.fillStyle = bgc;
    cache_context.fill();
    if(bc)
      cache_context.stroke();
    return ret;
  }
  game_area.addMouseMoveHandler(_onMouseMove);
  game_area.addMouseDownHandler(_onMouseDown);
  game_area.addMouseUpHandler(_onMouseUp);
}