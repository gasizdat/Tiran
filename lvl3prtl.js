/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/
function WaterBox(sc, src, z, start_point, stop_point, show_index)
{
  var _bg = new ImageSprite(src, null, null, null, z);
  _bg.intPos = false;
  var _lineWidth = (_bg.width + _bg.height) / 9;
  var _bgRedraw = _bg.redraw.bind(_bg);
  
  PropertyHelper.initializeSprite(this, sc, 
    [function() {return _bg.x; }, function(v) { _bg.x = v; }], 
    [function() {return _bg.y; }, function(v) { _bg.y = v; }], z, 
    function() { return _bg.width; }, 
    function() { return _bg.height; }, 
    function() { return _bg.visible; });
  PropertyHelper.defineGetter(this, "lineWidth", function() { return _lineWidth });
  PropertyHelper.defineGetter(this, "startPoint", function(){ return {x:_bg.x + start_point.x, y:_bg.y + start_point.y}; });
  PropertyHelper.defineGetter(this, "endPoint", function(){ return {x:_bg.x + stop_point.x, y:_bg.y + stop_point.y}; });
  this.connectedColor;
  this.borderColor = "#004080";
  this.emptyColor = "#ece9e9";
  
  this.redraw = function(dc)
  {
    _bgRedraw(dc);
    if(_bg.visible)
    {
      if(show_index)
      {
        dc.context.font = "12px";
        dc.context.fillStyle = "yellow";
        dc.context.fillText(this.zOrder, _bg.x + 2, _bg.y + 12);
      }
      
      dc.context.lineWidth = _lineWidth;
      dc.context.save();
      for(var i = 0; i < 2; i++)
      {

        dc.context.beginPath();
        if(i == 0)
        {
          if(this.connectedColor)
            dc.context.globalAlpha = 0.8;
          else
            dc.context.globalAlpha = 0.5;

          dc.context.strokeStyle = this.borderColor;
        }
        else if(!this.connectedColor)
        {
          dc.context.strokeStyle = this.emptyColor;
          dc.context.globalAlpha -= 0.2;
        }
        else
        {
          dc.context.strokeStyle = this.connectedColor;
          dc.context.globalAlpha -= 0.4;
        }
        var sp = this.startPoint;
        var ep = this.endPoint;
        dc.context.moveTo(sp.x, sp.y);
        if(start_point.x == 0)
          dc.context.lineTo(ep.x, sp.y);
        else if(start_point.y == 0)
          dc.context.lineTo(sp.x, ep.y);
        else if(start_point.y < stop_point.y)
          dc.context.lineTo(ep.x, sp.y);
        else
          dc.context.lineTo(sp.x, ep.y);
        dc.context.lineTo(ep.x, ep.y);
        dc.context.stroke();
        dc.context.lineWidth -= 5;
      }
      dc.context.restore();
    }
  }
}


function Level3Portal(game_area, wb_src, sc, x, y, z)
{
  var _waterBoxArray = [];
  var _waterFlowEffect = 0;
  var _width;
  var _height;
  var _inputPipeDx = 25;
  var _lastX = x;
  var _lastY = y;
  var _moveTargets = {none:0, right:1, left:2, up:3, down:4};
  var _completed = false;

  PropertyHelper.initializeSprite(this, sc, [function(){ return x; }, function(v){ x = v; }], [function(){ return y; }, function(v){ y = v; }], z, function(){ return _width; }, function() { return _height; });
  PropertyHelper.defineGetter(this, "isCompleted", function(){ return _completed; });
  
  this.finalize = function()
  {
    game_area.removeMouseDownHandler(_onMouseDown);
  }
  
  function _softEquality(x1, x2)
  {
    return Math.abs(x1 - x2) <= 0.1;
  }

  function _softPointEquality(p1, p2)
  {
    return _softEquality(p1.x, p2.x) && _softEquality(p1.y, p2.y);
  }
  
  function _getWaterBox(x, y)
  {
    for(var i = 0; i < _waterBoxArray.length; i++)
    {
      var wb = _waterBoxArray[i];
      if(wb.x <= x && (wb.x + wb.width) >= x && wb.y <= y && (wb.y + wb.height) >= y)
        return wb;
    }
    return null;
  }
  
  function _getPossibleMoveTarget(wb)
  {
    if(wb)//проверяем куды можем сдвинуть
    {       
      var new_x = wb.x + wb.width + 1; //вправо?
      if(new_x < (x + _width) && !_getWaterBox(new_x, wb.y + 1))
        return _moveTargets.right;
      else
      {
        new_x = wb.x - 1; //влево?
        if(new_x > (x + wb.width + _inputPipeDx) && !_getWaterBox(new_x, wb.y + 1))
          return _moveTargets.left;
        else
        {
          var new_y = wb.y + wb.height + 1; //вниз?
          if(new_y <= (y + _height)  && !_getWaterBox(wb.x + 1, new_y))
            return _moveTargets.down;
          else
          {
            new_y = wb.y - 1; //вверх?
            if(new_y > y && !_getWaterBox(wb.x + 1, new_y))
              return _moveTargets.up;
          }
        }
      }
    }
    return _moveTargets.none;
  }
  
  function _onMouseDown(event)
  {
    var wb = _getWaterBox(event.offsetX, event.offsetY);
    switch(_getPossibleMoveTarget(wb))
    {
      case _moveTargets.right:
        wb.x += wb.width;
        break;
      case _moveTargets.left:
        wb.x -= wb.width;
        break;
      case _moveTargets.up:
        wb.y -= wb.height;
        break;
      case _moveTargets.down:
        wb.y += wb.height;
        break;
    }
  }
  
  this.redraw = function(dc)
  {
    var typical_wb = _waterBoxArray[0];
    dc.context.lineWidth = typical_wb.lineWidth + 3;
    var local_x = this.x + dc.context.lineWidth / 2;
    var water_flow = dc.context.createLinearGradient(local_x, this.y, this.x + _width, y + _height);
    for(var i = 0, c = true; i < 1; i += 0.13, c = !c)
      water_flow.addColorStop((i + _waterFlowEffect) % 1, c ? "#0080FF" : "#296969");
    _waterFlowEffect = (_waterFlowEffect + 0.01) % 100;
    
    var source_point = {x:local_x + _inputPipeDx, y:this.y + 40}
    var target_point = {x:local_x + 3*typical_wb.width + _inputPipeDx, y:this.y + typical_wb.height * 1.5}
    
    for(var i = 0; i < _waterBoxArray.length; i++)
    {
      var wb = _waterBoxArray[i];
      wb.x += local_x - _lastX;
      wb.y += this.y - _lastY;
      wb.connectedColor = null;
    }
    
    _lastX = local_x;
    _lastY = this.y;
    var last_source_point = source_point;
    for(var k = 0; k < _waterBoxArray.length; k++)
    {
      for(var i = k; i < _waterBoxArray.length; i++)
      {
        var wb = _waterBoxArray[i];
        if(_softPointEquality(wb.startPoint, last_source_point))
        {
          last_source_point = wb.endPoint;
          wb.connectedColor = water_flow;
          _completed |= _softPointEquality(target_point, last_source_point);
        }
        else if(_softPointEquality(wb.endPoint, last_source_point))
        {
          last_source_point = wb.startPoint;
          wb.connectedColor = water_flow;
          _completed |= _softPointEquality(target_point, last_source_point);
        }
      }
    }
    
    if(_completed)
      game_area.removeMouseDownHandler(_onMouseDown);
    
    dc.context.save();

    for(var i = 0; i < 2; i++)
    {
      //рисуем источник
      dc.context.beginPath();
      dc.context.moveTo(local_x, this.y + _height);
      if(i == 0)
      {
        if(this.connectedColor)
          dc.context.globalAlpha = 0.9;
        else
          dc.context.globalAlpha = 0.7;
        dc.context.strokeStyle = typical_wb.borderColor;
      }
      else
      {
        dc.context.strokeStyle = water_flow;
        dc.context.globalAlpha -= 0.2;
      }
      dc.context.lineTo(local_x, source_point.y);
      dc.context.lineTo(source_point.x, source_point.y);
      dc.context.stroke();
      dc.context.beginPath();
      //рисуем приемник
      dc.context.moveTo(target_point.x, target_point.y);
      if(i != 0)
        dc.context.strokeStyle = _completed ? water_flow : typical_wb.emptyColor;
      dc.context.lineTo(target_point.x + _inputPipeDx, target_point.y);
      dc.context.lineTo(target_point.x + _inputPipeDx, this.y + _height);
      dc.context.stroke();
      dc.context.lineWidth -= 5;
    }
    dc.context.restore();

    for(var i = 0; i < _waterBoxArray.length; i++)
      _waterBoxArray[i].redraw(dc);
  }
  
  function _ctor(_this)
  {
    var img = Cache.getImage(wb_src);
    var show_index = game_area.skill <= GAME_LEVEL.beginner;
    //первый ряд
    _waterBoxArray.push(new WaterBox(null, wb_src, 1, {x:0, y:40}, {x:img.width, y:40}, show_index));
    _waterBoxArray.push(new WaterBox(null, wb_src, 2, {x:0, y:40}, {x:img.width * 3 / 4, y:img.height}, show_index));
    //второй ряд
    _waterBoxArray.push(new WaterBox(null, wb_src, 4, {x:img.width, y:img.height * 2 / 3}, {x:img.width / 2, y:img.height}, show_index));
    _waterBoxArray.push(new WaterBox(null, wb_src, 5, {x:img.width * 3 / 4, y:0}, {x:0, y:img.height * 2 / 3}, show_index));
    _waterBoxArray.push(new WaterBox(null, wb_src, 6, {x:img.width * 2 / 3, y:img.height}, {x:img.width, y:img.height / 2}, show_index));
    //третий ряд
    _waterBoxArray.push(new WaterBox(null, wb_src, 7, {x:img.width / 2, y:0}, {x:img.width, y:img.height * 5 / 8}, show_index));
    _waterBoxArray.push(new WaterBox(null, wb_src, 8, {x:0, y:img.height * 5 / 8}, {x:img.width, y:img.height * 5 / 8}, show_index));
    _waterBoxArray.push(new WaterBox(null, wb_src, 9, {x:0, y:img.height * 5 / 8}, {x:img.width * 2 / 3, y:0}, show_index));
    
    for(var i = 0; i < _waterBoxArray.length; i++)
    {
      _waterBoxArray[i].x = _this.x + _inputPipeDx + ((_waterBoxArray[i].zOrder - 1) % 3) * _waterBoxArray[i].width;
      _waterBoxArray[i].y = _this.y + Math.floor((_waterBoxArray[i].zOrder - 1) / 3) * _waterBoxArray[i].height;
    }
    _width = img.width * 3 + _inputPipeDx;
    _height = img.height * 3;
    
    //перемешивать нужно по чеснаку (т.е. сдвигать в возможных направлениях, но не переставлять),
    //иначе - можно получить нерешаемую комбинацию (http://ru.wikipedia.org/wiki/Пятнашки)
    var moves = [];
    for(var i = Random.int(107, 233),
        iter_count = Math.ceil(5 * game_area.skill * game_area.skill); iter_count; i++)
    {
      var index = i % _waterBoxArray.length;
      var wb = _waterBoxArray[index];
      var pt = _getPossibleMoveTarget(wb);
      if(pt != _moveTargets.none && moves[index] != pt)
      {
        moves[index] = pt;
        iter_count--;
        switch(pt)
        {
          case _moveTargets.right:
            console.log(wb.zOrder + " rigth");
            wb.x += wb.width;
            break;
          case _moveTargets.left:
            console.log(wb.zOrder + " left");
            wb.x -= wb.width;
            break;
          case _moveTargets.up:
            console.log(wb.zOrder + " up");
            wb.y -= wb.height;
            break;
          case _moveTargets.down:
            console.log(wb.zOrder + " down");
            wb.y += wb.height;
            break;
        }
        if(wb.x < (x + _inputPipeDx) || wb.x > (x + _inputPipeDx + 3*wb.width))
          alert("!");
      }
    }
    
    game_area.addMouseDownHandler(_onMouseDown);
  }
  _ctor(this);
};

Cache.scriptLoaded();