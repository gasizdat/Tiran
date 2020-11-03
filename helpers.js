/*   Copyright 2012: gasizdat
 *          License: GNU GPLv3 [1] http://www.gnu.org/licenses/ [2] http://www.gnu.org/licenses/gpl-3.0.html
 * Original sources: http://gasizdat.narod.ru/projects/game2/ at http://gasizdat.narod.ru/projects/game2/h.html
 *  Game project at: http://code.google.com/p/tiran/
 * This file is part of TIRAN game.
*/
var PropertyHelper =
{
  defineGetter : function(entity, name, getter)
  {
    if(getter instanceof Function)
    {
      if(entity.__defineGetter__)
        entity.__defineGetter__(name, getter);
      else
        Object.defineProperty(entity, name, {get: getter, enumerable : true, configurable: true});
    }
    else
      entity[name] = getter;
  },

  defineSetter : function(entity, name, setter)
  {
    if(setter instanceof Function)
    {
      if(entity.__defineSetter__)
        entity.__defineSetter__(name, setter);
      else
        Object.defineProperty(entity, name, {set: setter, enumerable : true, configurable: true});
    }
    else
      entity[name] = setter;
  },

  defineAccessors : function(entity, name, accessors)
  {
    try
    {
      if(!entity.__defineSetter__ && (accessors.length > 1 && accessors[0] && accessors[1]))
      {
        if(accessors[0] instanceof Function && accessors[1] instanceof Function)
          Object.defineProperty(entity, name, {get: accessors[0], set:accessors[1], enumerable : true, configurable: true});
        else if(accessors[0] != accessors[1])
          alert("Value type accessors must be equaled");
        else
          entity[name] = accessors[0];
      }
      else
      {
        if(accessors.length > 0 && accessors[0])
          PropertyHelper.defineGetter(entity, name, accessors[0]);
        if(accessors.length > 1 && accessors[1])
          PropertyHelper.defineSetter(entity, name, accessors[1]);
      }
    }
    catch(err)
    {
      alert("Error occurred while defining assessors: " + err);    
    }
  },
  
  initializeSprite : function(sprite, sc, x, y, z, w, h, v)
  {
    if(x instanceof Array)
      PropertyHelper.defineAccessors(sprite, "x", x);
    else
      PropertyHelper.defineGetter(sprite, "x", x);
    if(y instanceof Array)
      PropertyHelper.defineAccessors(sprite, "y", y);
    else
      PropertyHelper.defineGetter(sprite, "y", y);
    if(z instanceof Array)
      PropertyHelper.defineAccessors(sprite, "zOrder", z);
    else
      PropertyHelper.defineGetter(sprite, "zOrder", z);
    if(w instanceof Array)
      PropertyHelper.defineAccessors(sprite, "width", w);
    else
      PropertyHelper.defineGetter(sprite, "width", w);
    if(h instanceof Array)
      PropertyHelper.defineAccessors(sprite, "height", h);
    else
      PropertyHelper.defineGetter(sprite, "height", h);
    if(v instanceof Array)
      PropertyHelper.defineAccessors(sprite, "visible", v);
    else
      PropertyHelper.defineGetter(sprite, "visible", v);
    sprite.effects = null;
    function redrawWithEffect(dc)
    {
      dc.context.save();
      for(var e = 0; e < this.effects.length; e++)
        this.effects[e](this, dc);
      dc.context.restore();
    }
    sprite.addEffect = function(e)
    {
      if(!sprite.effects)
      {
        //добавляем фиктивный эффект перерисовки спрайта
        var sprite_redraw_effect = sprite.redraw;
        sprite.effects = [sprite_redraw_effect.call.bind(sprite_redraw_effect)];
      }
      sprite.effects.push(e);
      //важно, чтобы фиктивный эффект перерисовки оставался последним
      var e = sprite.effects[sprite.effects.length - 1];
      sprite.effects[sprite.effects.length - 1] = sprite.effects[sprite.effects.length - 2];
      sprite.effects[sprite.effects.length - 2] = e;
      sprite.redraw = redrawWithEffect.bind(sprite);
    }
    if(sc)
      sc.addSprite(sprite);
  },

}

var DebugHelper =
{
  redrawOrder : 0,
  showSpriteBounds : false,
  showSpriteRedrawOrder : false, //только совместно с showSpriteBounds
  showMouseChoords : false,
}

function getPos(el)
{
  var x = 0;
  var y = 0;
  if (el.offsetParent) 
  {
    x = el.offsetLeft
    y = el.offsetTop
    while (el = el.offsetParent) 
    {
      x += el.offsetLeft
      y += el.offsetTop
    }
  }
  return {left:x, top:y};
}

function DrawContext(canvas)
{
  var pos = getPos(canvas);
  this.canvas = canvas;
  this.context = canvas.getContext("2d");
  this.x = pos.left;
  this.y = pos.top;
  PropertyHelper.defineGetter(this, "width", function(){ return canvas.width; });
  PropertyHelper.defineGetter(this, "height", function(){ return canvas.height; });
  Object.freeze(this);
}

//Кэш ресурсов
function ResourceCache()
{
  var imgs = new Object();
  _addedImageCount = 0;
  _loadedImgsCount = 0;
  _addedScriptsCount = 0;
  _loadedScriptsCount = 0;
  var messages = new Object();
  var scrips = new Object();
  
  PropertyHelper.defineGetter(this, "loadedImgsCount", function() { return _loadedImgsCount; });
  PropertyHelper.defineGetter(this, "addedImageCount", function() { return _addedImageCount; });
  PropertyHelper.defineGetter(this, "addedScriptsCount", function() { return _addedScriptsCount; });
  PropertyHelper.defineGetter(this, "loadedScriptsCount", function() { return _loadedScriptsCount; });
  
  this.addScriptSource = function(fn)
  {
    var e = document.createElement('script');
    e.src = fn;
    e.type = "text/javascript";
    e.async = true;
    document.head.appendChild(e);
    _addedScriptsCount++;
  }
  
  this.levelLoaded = function(index, ctor)
  {  
    this.scriptLoaded();
    scrips[index] = ctor;
  }
  
  this.scriptLoaded = function()
  {  
    _loadedScriptsCount++;
  }

  this.getLevel = function(index)
  {
    if(!scrips[index])
      alert("Level" + index + " not yet loaded");
    return scrips[index];
  }
  

  this.addSpriteSource = function(src)
  {
    var img = new Image();
    img.onload = function()
    {
      _loadedImgsCount++;
    };
    img.src = /*"http://gasizdat.narod.ru/projects/game1/" + */ "meta/" + src;
    imgs[src] = img;
    _addedImageCount++;
  }
  this.removeSpriteSource = function(src)
  {
    if(imgs[src])
    {
      var img_src = imgs[src];
      delete img_src;
      delete imgs[src];
    }
  }
  this.getImage = function(src)
  {
    return imgs[src];
  }
  this.hasMessage = function(txt)
  {
    return !!messages[txt];
  }
  this.addMessageToCache = function(txt, msg_canvas)
  {
    messages[txt] = msg_canvas;
  }
  this.getMessage = function(txt)
  {
    return messages[txt];
  }
}

//© http://www.astral-consultancy.co.uk/cgi-bin/hunbug/doco.cgi?11180
var CookieHelper =
{
  getCookie : function( name ) 
  {
    var start = document.cookie.indexOf( name + "=" );
    var len = start + name.length + 1;
    if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) ) 
    {
      return null;
    }
    if ( start == -1 ) return null;
    var end = document.cookie.indexOf( ";", len );
    if ( end == -1 ) end = document.cookie.length;
    return unescape( document.cookie.substring( len, end ) );
  },
	
  setCookie : function( name, value, expires, path, domain, secure ) 
  {
    var today = new Date();
    today.setTime( today.getTime() );
    if ( expires ) 
    {
      expires = expires * 1000 * 60 * 60 * 24;
    }
    var expires_date = new Date( today.getTime() + (expires) );
    document.cookie = name+"="+escape( value ) +
      ( ( expires ) ? ";expires="+expires_date.toGMTString() : "" ) + //expires.toGMTString()
      ( ( path ) ? ";path=" + path : "" ) +
      ( ( domain ) ? ";domain=" + domain : "" ) +
      ( ( secure ) ? ";secure" : "" );
  },
	
  deleteCookie : function( name, path, domain ) 
  {
    if ( this.getCookie( name ) ) document.cookie = name + "=" +
        ( ( path ) ? ";path=" + path : "") +
        ( ( domain ) ? ";domain=" + domain : "" ) +
        ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
  }
}

var Cache = new ResourceCache();

var GAME_LEVEL =
{
  novice : 1,
  beginner : 1.1,
  intermediate : 1.5,
  expert : 2,
  nightmare : 4
}

var SUPPLY_TYPE = 
{
  coin : 1,
  ruby : 2,
  health : 3,
}

if(Object.freeze)
{
  Object.freeze(GAME_LEVEL);
  Object.freeze(SUPPLY_TYPE);
}

function levelDescription(d, sprite)
{
  this.d = d;
  PropertyHelper.defineGetter(this, "y", function() { return sprite.y; });  
  PropertyHelper.defineGetter(this, "sprite", function() { return sprite; });  

  this.ended = function(x)
  {
    return x < sprite.x || x > (sprite.x + sprite.width);
  }
}

var Random = 
{
  _$rndArray : 
  [
  0.8878596435269255,
  0.7262617628429523,
  0.32108836450836287,
  0.3040269380402987,
  0.5115118337831606,
  0.16090737577894665,
  0.4005597777294626,
  0.41382056905928144,
  0.9951279816995313,
  0.04818081527750229,
  0.6950303138924465,
  0.4913706869078297,
  0.5162889251260167,
  0.4347536898183637,
  0.05742431613933652,
  0.5681148107586597,
  0.44541217326912774,
  0.8447924096757023,
  0.3081005409766481,
  0.47405899862815526,
  0.7369953612510651,
  0.417850663154826,
  0.31426296389709685,
  0.4942431148972506,
  0.39610222494550784,
  0.09402923396676743,
  0.4519565274962466,
  0.6467827735674059,
  0.5285918265482072,
  0.6813820741031321,
  0.9634759075445221,
  0.19008687514636646,
  0.5470482506466475,
  0.9429177010675485,
  0.5826692024044431,
  0.31924532863009625,
  0.3126391081181641,
  0.07736834062104303,
  0.9841789379338358,
  0.5656383992095881,
  0.36487707118518165,
  0.8826968906679551,
  0.8643015185426889,
  0.936603607150095,
  0.09857530412918225,
  0.32264314427894514,
  0.7317722296598161,
  0.9597946439060554,
  0.5669046682663905,
  0.7268668398446172,
  0.43715216362499354,
  0.7719496141795018,
  0.5225062237230066,
  0.4402926089865805,
  0.41656982664697406,
  0.42686518230332027,
  0.3472233125886379,
  0.24885197267630166,
  0.9669333372055784,
  0.5005107389446439,
  0.7983560504754931,
  0.375152612867237,
  0.7768722089682499,
  0.09667707779414836,
  0.6097258349789993,
  0.9954716405395979,
  0.5892227820101483,
  0.29164693703793165,
  0.831194122732311,
  0.6020982963298245,
  0.5445824900419104,
  0.5954468889570991,
  0.5930676808082123,
  0.7594038587493684,
  0.8654864811015828,
  0.20956132166156616,
  0.14076948913926357,
  0.03803784498504559,
  0.5295672943629315,
  0.3121214446494256,
  0.6129341782333367,
  0.20846675769116774,
  0.7715439884921201,
  0.14455812689966763,
  0.7222791470578117,
  0.7118921993934161,
  0.21237672461605372,
  0.6495984553646628,
  0.499974932742845,
  0.5327040079840248,
  0.4347998368125229,
  0.7319450881135394,
  0.5464660660005984,
  0.023436762521444554,
  0.8637368924077168,
  0.5113548436697419,
  0.9320238139455179,
  0.5077779022908421,
  0.9932585295988937,
  0.34500280225911995,
  0.04150292780146492,
  0.5004820901598158,
  0.8736592506771413,
  0.9257089805159812,
  0.0840348608801803,
  0.4814048649186413,
  0.36705562224678867,
  0.7816912984334522,
  0.6584356162689033,
  0.9042137996308256,
  0.1442157890401462,
  0.6428562699075544,
  0.3310875727152711,
  0.6569378595981956,
  0.6664062360180322,
  0.38817901920909503,
  0.21449551126279243,
  0.3349912067825508,
  0.758457290812988,
  0.2903726871269212,
  0.418197932765613,
  0.6232954247518684,
  0.032006521016002876,
  0.2889054814802817,
  0.3876837420217937,
  0.17751350635295038,
  0.9198076331069016,
  0.6240405768399356,
  0.676932691969552,
  0.9783750030490782,
  0.9752821671187119,
  0.5254391225694509,
  0.05409445303466975,
  0.8871005548877373,
  0.9203781757557624,
  0.1544134414461492,
  0.1666663039371188,
  0.844210823717279,
  0.8790088326067332,
  0.9663251477759761,
  0.42372775923619665,
  0.9775827563644369,
  0.814117549589886,
  0.3235798283592921,
  0.09473361195350405,
  0.3922414959267443,
  0.13816061835640514,
  0.5600138503334127,
  0.8363796630198796,
  0.11408271794114488,
  0.8386948289361357,
  0.5614412097984113,
  0.7682297153201388,
  0.42951524320392254,
  0.6140958981651498,
  0.6918755893982963,
  0.28028359039355133,
  0.5323292079720079,
  0.4155433822921003,
  0.5989443045758468,
  0.6927558467815382,
  0.3931071086491752,
  0.12203969029663941,
  0.023070660099079765,
  0.8102523541056986,
  0.8922995298294503,
  0.38080855319776996,
  0.1915831799274107,
  0.525442595644401,
  0.03672387013458456,
  0.29396416660778624,
  0.6111067387891052,
  0.4283686001942194,
  0.22421081131684306,
  0.29258594945272964,
  0.6958790332503305,
  0.5737260476780375,
  0.8089416015601564,
  0.9756913079532609,
  0.5097366799793777,
  0.7864187804176451,
  0.9245335813239164,
  0.8354109464750993,
  0.9216887855254291,
  0.5102163085609338,
  0.7467085085346561,
  0.8816469220113077,
  0.858117875139504,
  0.8731099604073485,
  0.7927452858433057,
  0.36170607870615923,
  0.13129962072720391,
  0.21165945948040965,
  0.23333787208451273,
  0.9938215448465946,
  0.7616231503680828,
  0.9265985671206197,
  0.8710470635533663,
  0.813058208528271,
  0.6337921471551138
  ],
  _$rndIndex : 0,
  real : function (min, max)
  { 
    return Math.random()*(max - min) + min; 
  //  return (_$rndArray[_$rndIndex++ % _$rndArray.length]*(max - min))+min;
  },

  int : function(min, max)
  { 
    return Math.floor(Random.real(min, max)); 
  },

  chance : function(probability)
  {
    return Math.random() <= probability;
  },
}