class Util {
  // Converts array-based spec into a DOM Element object.
  // Takes upto 5 args: <elmt type>, <css id>, [<css classes>], [<children>], <function>.
  // The first arg is mandatory.
  // <elmt type> must be a string like "div", "p",etc...
  // <id> must be a string. `null` and empty string skip id
  // <classes> can be a single string or a list of strings or empty.
  // <children> can be an array or a string or an actual DOM object. If it is an
  //   array, the content can be a mix of arrays, strings and DOM objects. Any
  //   inner array is treated as args to recursion. Any string is converted to
  //   a TextNode, and a DOM Element is appended as-is.
  // <function> gets the elmt currently being described as arg and should modify
  //   it directly, any return value is ignored.
  static make_domobj(...args) {
    if(args.length < 1 || args.length > 5) throw "number of args must be 1 to 5"

    return _make_domobj(args)

    function _make_domobj(a) {
      if(a instanceof Element) {
        return a
      }
      else if(a && !Array.isArray(a)) {
        return document.createTextNode(a)
      } else if(a.length == 0) {
        return null
      } else {
        let type  = a[0],
            cssid  = a[1],
            classes = a[2] || [],
            children = a[3] || [],
            processor = a[4]

        if(Array.isArray(type)) throw "Element Type arg cannot be Array"
        if(Array.isArray(cssid)) throw "CSS id arg cannot be Array"
        if(!Array.isArray(classes)) classes=[classes]

        let elmt = document.createElement(type)
        if(cssid) elmt.id=cssid
        if(classes.length > 0) elmt.classList.add(...classes.flatMap(cl => cl.split(/ +/))) // account for multi class string with space args
        if(processor) processor(elmt)

        let rs
        if(Array.isArray(children)) {
          rs = children.map(_make_domobj)
        } else {
          rs = [_make_domobj(children)]
        }

        for(let r of rs) {
          if(r) elmt.appendChild(r)
        }
        return elmt
      }
    }
  }

  static clear_domobj(o) {
    while(o.firstChild) {
      o.removeChild(o.firstChild)
    }
  }
}
