atom.declare( 'Animator.Helpers.AsyncLoader', 
{
/* Private */  

  //число зарегистрированных ресурсов, нуждающихся в асинхронной загрузке
  _regCount : 0,
  //число загруженных ресурсов
  _loadCount : 0,
  //число ошибок загрузки
  _errorCount : 0,
  
  _joining : false,
  
  _join : function(args)
  {
    if(this._regCount == this._loadCount)
    {
      if(args.on_progress)
        args.on_progress(1.0);
      if(args.on_complete)
        args.on_complete();
    }
    else if(this._regCount == (this._loadCount + this._errorCount))
    {
      if(args.on_progress)
        args.on_progress(1.0);
      if(args.on_error)
        args.on_error();
    }
    else
    {
      if(args.on_progress)
        args.on_progress((this._loadCount + this._errorCount) / this._regCount);
      setTimeout(this._join.bind(this, args), 10);
    }
  },
  
  _imgLoadingError : function(evt)
  {
    console.error(evt);
    this._errorCount++;
  },
  
  _imgLoading : function(evt)
  {
    this._loadCount++;
  },

  _createDomImage : function(src)
  {
    var img = Animator.Helpers.System.createImage();
    var ile = this._imgLoadingError.bind(this);
    if(img.onabort !== undefined)
      Animator.Helpers.System.addEventHandler(img, "abort", ile);
    if(img.onerror !== undefined)
      Animator.Helpers.System.addEventHandler(img, "abort", ile);
    if(img.onload !== undefined)
      Animator.Helpers.System.addEventHandler(img, "load", this._imgLoading.bind(this));
    img.src = this.resourcePrefix + src;
    return img;    
  },

/* Public */  

  //префикс ресурсов, может отсутствовать, содержать относительный или полный путь
  resourcePrefix : "",

  regTexture : function(src)
  {
    Animator.Helpers.System.argumentAssertion(arguments, "string");
    var img = this._createDomImage(src);
    this._regCount++;
    return new Animator.Textures.Simple(img);
  },

  regTextureMap : function(src, box)
  {
    Animator.Helpers.System.argumentAssertion(arguments, "string", "array");
    var img = this._createDomImage(src);
    this._regCount++;
    return new Animator.Textures.Map(img, box);
  },

  regSolidColor : function(color)
  {
    Animator.Helpers.System.argumentAssertion(arguments, "string");
    return new Animator.Textures.SolidColor(color);  
  },
  
  join : function(on_progress, on_error, on_complete)
  {
    if(!this._joining)
    {
      this._joining = true;
      this._join({on_progress:on_progress, on_error:on_error, on_complete:on_complete});
    }
    else
      alert("@!#");
  },
  
});