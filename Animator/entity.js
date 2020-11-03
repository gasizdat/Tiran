atom.declare( 'Animator.Entity',
{
  toStady : function() //приведение свойств к консистентному состоянию
  {
    this.triggers.forEach(function(t_info)
    {
      if(t_info.p)
      {
        var v = t_info.p();
        if(t_info.v != v)
        {
          t_info.t(this, t_info.v, v);
          t_info.v = v;
        }
      }
      else
        t_info.t(this);
    }, this);
  },
  
  initialize : function(args)
  {
    Animator.Helpers.System.argumentAssertion(arguments, "object");
    this.container = null; //родительский контейнер
    this.location = Animator.Helpers.Triplet.get(args.location);
    this.pivot = Animator.Helpers.Triplet.get(args.pivot);
    this.angle = Animator.Helpers.Triplet.get(args.angle);
    this.triggers = []; //триггеры
  },
  
  //Добавить функцию триггера. 
  //=> t_func - функция триггера, вида: void function(sender, old_value, new_value)
  //   prop - имя свойства, при изменении которого вызывается триггер,
  //          или null (тогда, триггер вызывается при каждом вызове toStady)
  //<= Id триггера
  addTrigger : function(t_func, prop)
  {
    Animator.Helpers.System.argumentAssertion(arguments, "function", "null|string");
    var prop_getter = prop ? Animator.Entity.buildPropGetter(prop, this) : null;
    var id = this.triggers.push({t:t_func, p:prop_getter, v:prop_getter ? prop_getter() : null}) - 1;
    return 0x123456 ^ (id << 3);
  },
  
  removeTrigger : function(t_id)
  {
    t_id = (0x123456 ^ t_id ) >> 3;
    if(t_id >= 0 && t_id < this.triggers.length)
      this.triggers[t_id] = null;//this.triggers.splice(t_id, 1);
    else
      throw new Animator.Helpers.ArgumentException("Invalid trigger id", t_id);
  }
}).own(
{
  buildPropGetter : function(prop, instance)
  {
    return (new Function("return this." + prop + ";")).bind(instance);
  },
});