// This models a list of collectible items that can be sorted by
// item data. It plays together with CollectionSubset.
class CollectionBase {
  constructor(members) {
    this._members = members
    this._observers = []
  }

  addObserver(o) {
    this._observers.push(o)
  }

  notice(i_w_chgd_accept_state) {
    this._observers.forEach(o => o.notice(i_w_chgd_accept_state)) // pass item change through
  }

  load(json_file, onload) {
    this.load_json(json_file,
      data_objects => {
        let items = this.make_items(data_objects)
        this.display(items)
        if(onload) onload(items)
      }
    )
  }

  filter(...xs) { this._members.filter(...xs) }
  reduce(...xs) { this._members.reduce(...xs) }

  sort_members_by_itemdata(data_compare_fun) {
    this._members = this._members.sort(
      (item_a, item_b) => data_compare_fun(item_a._data, item_b._data)
    )
    post_sort()
  }
  post_sort() { }
}

class LoveInterestCollection extends CollectionBase {
  constructor(...xs) {
    super(...xs)
    this.make_domobj()
  }

  appendTo(domobj) {
    domobj.appendChild(this._domobj)
  }

  make_domobj() {
    this._domobj_item_map = new Map()
    this._item_domobj_map = new Map()
    this._domobj = Util.make_domobj("div", null, ["collection", CONFIG.collectionClass])
    this._members.forEach(
      i => {
        let card = i.make_small_card()
        this._domobj.appendChild(card)
        this._domobj_item_map.set(card, i)
        this._item_domobj_map.set(i, card)
      }
    )
    return this._domobj
  }

  reorder_domobj() {
    this._domobj = Util.make_domobj("div", null, ["collection", CONFIG.collectionClass])
    this._members.forEach(
      i => {
        let item_domobj = this._item_domobj_map.get(i)
        this._domobj.appendChild(item_domobj)
      }
    )
  }

  post_sort() {
    reorder_domobj()
  }

  // restrict displayed item domobjects to those which return true on
  // predicate(<item_data>)
  filter_domobj_by_itemdata(data_predicate) {
    Array.from(this._domobj.children).forEach(
      ch => {
        let i = this._domobj_item_map.get(ch)
        if(data_predicate(i._data)) {
          ch.classList.remove("display-none")
        } else {
          ch.classList.add("display-none")
        }
      }
    )
  }
}

// A subset view into a CollectionBase, where that subset is based on an
// accept-state found in the data of collection items. The pair CollectionBase
// and CollectionSubset model a selection out of a list of things. The subset
// keeps all items in a set that have the right property set to a true value.
class CollectionSubset {
  constructor(reference_collection, predicate_propname="isAccepted") {
    this._ref = reference_collection
    this._predicate_propname = predicate_propname
    this._members = new Set(this._ref.filter(i => i[predicate_propname]))
  }

  // item accept-state change propagation (Item -> Collection -> Subset)
  notice(i_w_chgd_accept_state) {
    if(i_w_chgd_accept_state.isAccepted) {
      this.add(i_w_chgd_accept_state)
    } else {
      this.remove(i_w_chgd_accept_state)
    }
  }

  add(item) {
    this._members.add(item)
    this.post_add(item)
  }

  remove(item) {
    this._members.delete(item)
    this.post_remove(item)
  }

  post_add(item) {}
  post_remove(item) {}
}

class LoveInterestCollectionSubset extends CollectionSubset {
  constructor(...xs) {
    super(...xs)
    this.make_domobj()
  }
  
  post_add(item) {
    this._domobj.appendChild(i.make_big_card())
  }

  post_remove(item) {
    let domobj = this._item_domobj_map.get(item)
    this._domobj.removeChild(domobj)
    this._item_domobj_map.delete(item)
  }

  make_domobj() {
    this._item_domobj_map = new Map()
    this._domobj = Util.make_domobj("div", null, ["subset", CONFIG.selectionClass])
    this._members.forEach(
      i => {
        let card = i.make_big_card()
        this._domobj.appendChild(card)
        this._item_domobj_map.set(i, card)
      }
    )
    return this._domobj
  }
}
