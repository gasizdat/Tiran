/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/
function Level1001(game_area, money, health_pc, lifes_count, z)
{
  var _image_source_array = ["bg02.jpg", "ground01.png", "cloud04.png", "cloud05.png", "cloud06.png"];
  var _sprites = new SpriteContainer(game_area.spriteContainer, z);
  var _faces;
  var _ground;
  var _processor;
  
  PropertyHelper.defineGetter(this, "money", function() { return money; }); //число честно заработанных денег
  PropertyHelper.defineAccessors(this, "healthPc", [function() { return health_pc; }, function(v) { health_pc = v; }]); //процент здоровья
  PropertyHelper.defineAccessors(this, "lifes", [function() { return lifes_count; }, function(v) { lifes_count = v; }]); //число жизней

  function TestImageSprite(src, sc, x, y, z, show_always)
  {
    var _auto_frame_count = 0;
    var _img = Cache.getImage(src);
    var _hide = false;
    var _isVisible = false;

    this.intPos = false;  //признак рассчета позиции спрайта в целом виде.
    this.scale = 1;      //масштабирование размеров
    this.frame = 0;      //номер фрейма анимации
    this.frameWidth = 0; //0, если спрайт не анимированный, иначе - размер кадра анимации (кадры расположены горизонтально)
    this.dx = (Random.chance(0.5) ? -1 : 1) * (1 + Random.int(0, 30));
    this.dy = (Random.chance(0.5) ? -1 : 1) * (1 + Random.int(0, 30));
    
    
    PropertyHelper.initializeSprite(this, sc, x += 5 * this.dx - _img.width / 2, y += 5 * this.dy - _img.height / 2, z, 
      [function() { return (this.frameWidth ? this.frameWidth : _img.width) * this.scale; }], 
      [function() { return _img.height * this.scale; }], 
      [ function() { return _isVisible; }, function(v) { _hide = !v; }]);

    this.redraw = function(dc)
    {
      this.x += this.dx;
      this.y += this.dy;
      var w = this.width;
      var h = this.height;
      _isVisible = !_hide && (this.x + w) > 0 && this.x < dc.width && (this.y + h) > 0 && this.y < dc.height;
      if(_isVisible || show_always)
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

  this.finalize = function()
  {
    game_area.removeCacheImages(_image_source_array);
    game_area.spriteContainer.removeSprite(_sprites);
  }

  var _outFrameSpritesCount = 8500;
  var _inFrameSpritesCount = 500;
  var _showAlways = false;
  var _sName;
  function _test1_1(dc)
  {
    if(!_showAlways)
      _sName = "\"умных\"";
    else
      _sName = "\"глупых\"";
    for(var i = 0; i < _outFrameSpritesCount; i++)
    {
      var is = new TestImageSprite(_image_source_array[Random.int(2, 5)], _faces, 
        2*game_area.drawContext.width, 2*game_area.drawContext.height, _faces.length, _showAlways); 
      is.dx = 10;
      is.dy = 10
    }
    _processor.redraw = _test1_2.bind(this);
  }
  function _test1_2(dc)
  {
    if(_faces.length < (_outFrameSpritesCount + _inFrameSpritesCount))
    {
      for(var i = 0; i < 50; i++)
      {
        var is = new TestImageSprite(_image_source_array[Random.int(2, 5)], _faces, 
          game_area.drawContext.width/2, game_area.drawContext.height/2, _faces.length, _showAlways); 
      }
      game_area.msgFrame.show("Добавляем " + _sName + " cпрайтов: " + _faces.length, false, "green", Infinity);
    }
    else
    {
      _processor.redraw = _test1_3.bind(this);
      game_area.msgFrame.show("Тестируем производительность " + _faces.length + " " + _sName + " cпрайтов", false, "green", 10000);    
    }
  }
  function _test1_3(dc)
  {
    if(!game_area.msgFrame.visible)
    {
      _processor.redraw = _test1_4.bind(this);
      game_area.msgFrame.show("Удаляем " + _sName + " cпрайтов", false, "green", 3000);
      for(var i = 0; i < _faces.length; i++)
        delete _faces.sprite(i);
      _faces.clear();
    }
  }

  function _test1_4(dc)
  {
    if(!game_area.msgFrame.visible)
    {
      _processor.redraw = _test1_1.bind(this);
      _showAlways = !_showAlways;
    }    
  }

  
  function _ctor()
  {
    game_area.msgFrame.close();
    _processor = new Sprite(_sprites);
    new ImageSprite("bg02.jpg", _sprites, 0, 0, 1);
    _ground = new RepeatedBackground("ground01.png", _sprites, 0, game_area.drawContext.height - 30, game_area.drawContext.width, null, false, 2);
    _ground.groundLevel = new levelDescription(5, _ground);
    _faces = new SpriteContainer(_sprites, 3);
    
    _processor.redraw = _test1_1.bind(this);    
  }
  
  game_area.cacheImages(_image_source_array, _ctor);
}

Cache.levelLoaded(1001, Level1001);