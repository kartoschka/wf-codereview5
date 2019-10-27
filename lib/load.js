class Application {
  constructor(config) {
    this._root_domobj = config.root_elmt
    this._workers = []
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
    filters_box.appendChild(this.make_filter_domobj(love_interests, "gender"))

    this._root_domobj.appendChild(filters_box)
    love_interests.appendTo(this._root_domobj)
    this._root_domobj.appendChild(between)
    subset.appendTo(this._root_domobj)

    this._workers.push(love_interests)
    this._workers.push(subset)
  }

  make_filter_domobj(collection, propname) {
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

    let onchange = (e) => {
      let active_vals = checkboxes
        .reduce((acc, chb) => chb.checked ? acc.concat(chb.value) : acc, [])
      if(active_vals.length > 0) {
        collection.filter_domobj_by_itemdata(
          (item_data) => {
            let valset = new Set([item_data[propname]].flat())
            return active_vals.some(v => valset.has(v))
          }
        )
      } else {
        collection.filter_domobj_by_itemdata(_ => true)
      }
    }

    checkboxes.forEach(chb => chb.onchange = onchange)

    let ui_box = Util.make_domobj("div", null, "my-filter-box col-xs-1 ml-5",
      [["h5",null,"my-filter-box-label","Filter by gender"]])
    checkboxes.forEach(chb => {
      let chb_label_pair = Util.make_domobj("div", null, "my-checkbox-with-label",
        [chb, ["label", null, "my-filter-label", chb.value, 
                        lb => lb.setAttribute("for",`filt-chb-${chb.value}`)]])
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
