atom.declare( 'Animator.Viewports.Axonometric', Animator.Viewports.Base, //камера аксонометрической проекции (axonometric projection)
{
  _buildViewGraph : function (p)
  {
    if(p instanceof Animator.Containers.Base)
    {
      if(p.primitives)
        p.primitives.forEach(this._buildViewGraph, this);
    }
    else if(p instanceof Animator.Primitives.Base)
    {
    }
  },
  
  _redraw : function()
  {
    if(this.container)
      this._buildViewGraph(this.container);
  },
  
  initialize : function _ap_ctor(app, args)
  {
    _ap_ctor.previous.call(this, app, args);    
  },
});