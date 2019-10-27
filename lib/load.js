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
      el => el.innerHTML = "<h4>YOUR FAVED HO<mark>TTT</mark>IES</h4>")

    love_interests.appendTo(this._root_domobj)
    this._root_domobj.appendChild(between)
    subset.appendTo(this._root_domobj)

    this._workers.push(love_interests)
    this._workers.push(subset)
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
