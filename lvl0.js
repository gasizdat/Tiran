/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/
function Level0(game_area, money, health_pc, lifes_count, z)
{
  var _image_source_array = ["bg00.png"];
  var _sprites = new SpriteContainer(game_area.spriteContainer, z);
  var _saveList;
  var _background;
  var _lastSelectedItem;
  var _load;
  var _delete;
  var _newGame;
  var _exit;
  var YELLOW_COLOR = "#FFDF03";
  
  PropertyHelper.defineGetter(this, "money", function() { return money; }); //число честно заработанных денег
  PropertyHelper.defineAccessors(this, "healthPc", [function() { return health_pc; }, function(v) { health_pc = v; }]); //процент здоровья
  PropertyHelper.defineAccessors(this, "lifes", [function() { return lifes_count; }, function(v) { lifes_count = v; }]); //число жизней

  this.finalize = function()
  {
    game_area.removeMouseMoveHandler(_onMouseMove);
    game_area.removeMouseDownHandler(_onMouseDown);  

    game_area.removeCacheImages(_image_source_array);
    game_area.spriteContainer.removeSprite(_sprites);
  }

  function _onMouseMove(event)
  {
    if(!_saveList)
      return;
    if(_isMouseOver(_newGame, event))
      _newGame.color = "red";
    else
    {
      _newGame.color = YELLOW_COLOR;
      if(_isMouseOver(_exit, event))
        _exit.color = "red";
      else
        _exit.color = YELLOW_COLOR;
    }
    
    for(var i = 0; i < _saveList.length; i++)
    {
      var s = _saveList.sprite(i);
      if((s.y - 15) <= event.offsetY && s.y >= event.offsetY)
      {
        var w = s.width;
        if(!_load)
          _load = new TextSprite(function(){return "[" + StringResources.LOAD_BTN + "]"}, "20px Comic Sans MS", "green", _saveList, 0, 0, null, _saveList.length);
        if(!_delete)
          _delete = new TextSprite(function(){return "[" + StringResources.DELETE_BTN + "]"}, "20px Comic Sans MS", "green", _saveList, 0, 0, null, _saveList.length + 1);
        if(s != _load && s != _delete)
        {
          s.color = "red";
          _load.x = _background.width - 250;
          _load.y = s.y;
          _load.state = s.state;
          _delete.x = _load.x + _load.width + 20;
          _delete.y = s.y;
          _delete.state = s.state;
        }
        else if(s.x <= event.offsetX && (s.x + s.width) >= event.offsetX)
        {
          s.color = "red";
        }
        else
          s.color = "green";
      }
      else if(s != _load && s != _delete)
      {
        s.color = YELLOW_COLOR;        
      }
    }
  }
  
  function _isMouseOver(sprite, event)
  {
    return (sprite.y - 15) <= event.offsetY && sprite.y >= event.offsetY && sprite.x <= event.offsetX && (sprite.x + sprite.width) >= event.offsetX
  }
  
  function _onMouseDown(event)
  {
    if(_isMouseOver(_newGame, event))
      game_area.startWithLevel(1); //по сути старт новой игры
    else if(_isMouseOver(_exit, event))
      document.close();
    else if(_load && _isMouseOver(_load, event))
      game_area.loadState(_load.state);
    else if(_delete && _isMouseOver(_delete, event))
    {
      game_area.deleteState(_delete.state);    
      _updateList();
    }
  }
  
  function _updateList()
  {
    if(_saveList)
    {
      delete _saveList;
      _sprites.removeSprite(_saveList);
      delete _load;
      _load = null;
      delete _delete;
      _delete = null;
    }
    _saveList = new SpriteContainer(_sprites, 3);
    var ssl = game_area.savedStatesList();
    var y = _background.y + 40;
    
/*    var item = new TextSprite("Unit-testing", "15px Comic Sans MS", YELLOW_COLOR, _saveList, _background.x + 15, y, _background.width - 100, i);
    item.state = {level:99, money:0, health:0, lifes:0, skill:0};
    y += 15;*/
    for(var i = 0; i < ssl.length; i++)
    {
      var item = new TextSprite(null, "15px Comic Sans MS", YELLOW_COLOR, _saveList, _background.x + 15, y, _background.width - 265, i);
      item.text = StringResources.LEVELS_NAMES[ssl[i].level] + " (" + ssl[i].date.toGMTString() + ")";
      item.state = ssl[i];
      y += 15;
    }
    
  }
  
  function _ctor()
  {
    game_area.msgFrame.show(StringResources.INTRODUCE, true, "blue", Infinity);
    _background = new ImageSprite("bg00.png", _sprites, 0, 0, 2);
    _background.x = (game_area.drawContext.width - _background.width) / 2;
    _background.y = 20 + (game_area.drawContext.height - _background.height) / 2;
    var bg_redraw = _background.redraw.bind(_background);
    _background.redraw = function(dc)
    {
      game_area.showDefaultBackground();
      bg_redraw(dc);
    }
    
    var img1 = new ImageSprite("dlgbtn01.png", _sprites, 0, 0, 4);
    var img2 = new ImageSprite("dlgbtn01.png", _sprites, 0, 0, 5);
    img1.x = (game_area.drawContext.width - img1.width - img2.width - 20) / 2;
    img2.x = img1.x + img1.width + 20;
    img1.y = img2.y = _background.y + _background.height - img1.height - 15;
    _newGame = new TextSprite(function(){ return StringResources.NEW_BTN }, "40px Comic Sans MS", YELLOW_COLOR, _sprites, 0, 0, img1.width - 10, 6);
    _newGame.redraw(game_area.drawContext);
    _newGame.x = img1.x + (img1.width - _newGame.width)/2;
    _newGame.y = img1.y + img1.height / 2 + 10;
    _exit = new TextSprite(function(){ return StringResources.EXIT_BTN }, "40px Comic Sans MS", YELLOW_COLOR, _sprites, 0, 0, img2.width - 10, 7);
    _exit.redraw(game_area.drawContext);
    _exit.x = img2.x + (img2.width - _exit.width)/2;
    _exit.y = img2.y + img2.height / 2 + 15;
    
    _updateList();
    
    game_area.addMouseMoveHandler(_onMouseMove);
    game_area.addMouseDownHandler(_onMouseDown);  
  }
  
  game_area.cacheImages(_image_source_array, _ctor);
}

Cache.levelLoaded(0, Level0);