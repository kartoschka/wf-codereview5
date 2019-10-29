class Application {
  constructor(config) {
    this._root_domobj = config.root_elmt
    this._workers = []
    this._filters = []
  }

  open(json_file) {
    let loader = new LoveInterestsLoader()
    loader.load(json_file, x => this.draw(x))
  }

  draw(love_interests) {
    let subset = new LoveInterestCollectionSubset(love_interests)
    let between = Util.make_domobj("div",null, 
      "row jumbotron jumbotron-fluid my-header", [],
      el => el.innerHTML = "<h4 class=ml-5>your faved ho<mark>ttt</mark>ies</h4>")

    let filters_box = Util.make_domobj("div", null, "row")
    filters_box.appendChild(this.make_filter_domobj("Gender: ", love_interests, "gender"))
    filters_box.appendChild(this.make_filter_domobj("Looks for: ", love_interests, "fanciedGenders"))
    filters_box.appendChild(this.make_number_range_filter("Age range: ", love_interests, "age", 20))
    filters_box.appendChild(this.make_number_range_filter("Height range (cm): ", love_interests, "height", 30))

    this._root_domobj.appendChild(filters_box)
    love_interests.appendTo(this._root_domobj)
    this._root_domobj.appendChild(between)
    subset.appendTo(this._root_domobj)

    this._workers.push(love_interests)
    this._workers.push(subset)
  }

  make_filter_domobj(filter_title, collection, propname) {
    let propvalues = collection._members.reduce(
      (acc, el) => {
        let vs = [el._data[propname]].flat()
        vs.forEach(v => acc.add(v))
        return acc
      }, new Set()
    )

    let checkboxes = []
    propvalues.forEach(
      val => checkboxes.push(Util.make_domobj("input",`filt-chb-${val}`,[],[],
        chb => {chb.type = "checkbox"; chb.value = val}))
    )

    let filter_f = (item_data) => {
      let active_vals = checkboxes
        .reduce((acc, chb) => chb.checked ? acc.concat(chb.value) : acc, [])
      if(active_vals.length > 0) {
        let valset = new Set([item_data[propname]].flat())
        return active_vals.some(v => valset.has(v))
      } else {
        return true
      }
    }

    this._filters.push(filter_f)

    let onchange = 
      (e) => collection.filter_domobj_by_itemdata(item_data => this._filters.every(f => f(item_data)))

    checkboxes.forEach(chb => chb.onchange = onchange)

    let ui_box = Util.make_domobj("div", null, "my-filter-box col-xs-1 ml-5",
      [["h5",null,"my-filter-box-label", filter_title]])
    checkboxes.forEach(chb => {
      let chb_label_pair = Util.make_domobj("div", null, "my-checkbox-with-label",
        [chb, ["label", null, "my-filter-label", chb.value, 
                        lb => lb.setAttribute("for",`filt-chb-${chb.value}`)]])
      ui_box.appendChild(chb_label_pair)
    })
    return ui_box
  }

  make_number_range_filter(filter_title, collection, propname, step) {
    let propvalues = collection._members.map(item => Number(item._data[propname]))
    let minmax  = [Math.min(...propvalues), Math.max(...propvalues)]
    let [lo,hi] = minmax.map(x => Math.floor(x/step) * step)
    let all_steps = Array(((hi-lo)/step) + 1)
      .fill(null)
      .reduce(([rs, x]) => [[...rs, [x, x+step-1]], x+step], [[],lo])[0] // [[start1,end1],[start2,end2],...]

    let range_includes = ([start, end], val) => val <= end && val >= start

    let steps = all_steps.filter(range => propvalues.some(val => range_includes(range, val)))

    let checkboxes = []
    steps.forEach(
      val => checkboxes.push(Util.make_domobj("input",`rangefilt-chb-${val[0]}-${val[1]}`,[],[],
        chb => {chb.type = "checkbox"; chb.value = val}))
    )

    let filter_f = (item_data) => {
      let active_ranges = checkboxes
        .reduce((acc, chb) => chb.checked ? [...acc, chb.value.split(",").map(x=>Number(x))] : acc, [])
      if(active_ranges.length > 0) {
        return active_ranges.some(range => range_includes(range, item_data[propname]))
      } else {
        return true
      }
    }

    this._filters.push(filter_f)

    let onchange = 
      (e) => collection.filter_domobj_by_itemdata(item_data => this._filters.every(f => f(item_data)))

    checkboxes.forEach(chb => chb.onchange = onchange)

    let ui_box = Util.make_domobj("div", null, "my-filter-box col-xs-1 ml-5",
      [["h5",null,"my-filter-box-label", filter_title]])

    checkboxes.forEach(chb => {
      let rangeval = chb.value.split(",").map(x=>Number(x))
      let chb_label_pair = Util.make_domobj("div", null, "my-checkbox-with-label",
        [chb, ["label", null, "my-filter-label", chb.value.replace(","," to "), 
                        lb => lb.setAttribute("for",`rangefilt-chb-${rangeval[0]}-${rangeval[1]}`)]])
      ui_box.appendChild(chb_label_pair)
    })
    return ui_box
  }
}

// simple wrapper for the json loading process
class LoveInterestsLoader {
  load(json_file, procedure) {
    let xhr = new XMLHttpRequest()
    xhr.open("GET", json_file)
    xhr.onload = () => {
      let data_objs = JSON.parse(xhr.response)
      let items = this.make_items(data_objs)
      procedure(new LoveInterestCollection(items))
    }
    xhr.send()
  }

  make_items(data_objects) {
    return Object.keys(data_objects).map(
      i => {
        let o = data_objects[i]
        o.id = i
        return new LoveInterest(o)
      }
    )
  }
}
