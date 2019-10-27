// Models an item in a collection of items. An item has a number of properties
// inside a data property that describe the item. It can also have a state of
// being accepted, rejected or unmarked, reflecting a user's decision to include
// the item in their collection. It can also have observers that are informed
// when an accept-state change occurs.
class CollectionItem {
  constructor(data) {
    this._data = data
    this._observers = []

    this._cprefix = "libitem-"
  }

  get acceptCount() { 
    return Number(this._data.numAccepts) + Number(this.isAccepted) - Number(this.isRejected)
  }

  get acceptState() { return this._data.acceptState }
  get isAccepted() { return this.acceptState == 1  ? true : false }
  get isRejected() { return this.acceptState == -1 ? true : false }
  get isUnmarked() { return this.acceptState == 0  ? true : false }

  addObserver(o) {
    this._observers.push(o)
  }

  toggleAccept() {
    if(this.isAccepted) {
      this._data.acceptState = 0
      this.post_unaccept()
    } else {
      this._data.acceptState = 1
      this.post_accept()
    }
    this.inform_observers()
  }
  
  toggleReject() {
    if(this.isRejected) {
      this._data.acceptState = 0
      this.post_unreject()
    } else {
      this._data.acceptState = -1
      this.post_reject()
    }
    this.inform_observers()
  }

  // hooks executed after the accept/reject state of an item has been changed,
  // to be overridden in subclass.
  post_accept() {}
  post_reject() {}
  post_unreject() { this.post_accept() }
  post_unaccept() { this.post_reject() }

  inform_observers() {
    this._observers.forEach(o => o.notice(this))
  }

  increase_accept_count() {
    this._data.numAccepts++
    this._accept_count_elmt.textContent = this.acceptCount
  }
}

// A person in a collection of love interests (as in "user likes/dislikes X"). Person
// data include: imgurls, name, age, gender, fanciedGenders, ...
// The class knows how to create a domobj card for itself, and it keeps track
// of its own domobjs to update each one if something in its data changes.
class LoveInterest extends CollectionItem {
  constructor(data) {
    super(data)
    this._cprefix = "person-"
    this._card_domobjs = []
    this._accept_buttons = []
    this._reject_buttons = []
    this._accept_count_domobjs= []
  }

  post_accept() {
    this._accept_buttons.map(btn => btn.textContent = "🖤")
  }

  post_unaccept() {
    this._accept_buttons.map(btn => btn.textContent = "♡")
  }

  add_to(property_name, value) {
    this[property_name].push(value)
    return value
  }
  
  make_accept_count_elmt() {
    return this.add_to("_accept_count_domobjs",
      Util.make_domobj("li", null, "accept-count", this.acceptCount)
    )
  }

  make_accept_button() {
    let button_class = this.isAccepted ? "rating-active" : "rating-inactive"
    let button_text  = this.isAccepted ? "🖤" : "♡"

    return this.add_to("_accept_buttons",
      Util.make_domobj("button", null, button_class, button_text, 
        el => el.addEventListener("click", e => this.toggleAccept()))
    )
  }

  make_reject_button() {
    let button_class = this.isRejected ? "rating-active" : "rating-inactive"
    return this.add_to("_reject_buttons",
      Util.make_domobj("button", null, button_class, "👎",
        el => el.addEventListener("click", e => this.toggleReject()))
    )
  }

  make_small_card() {
    return this.add_to("_card_domobjs", Util.make_domobj(
      "div", this._cprefix + this._data.id, CONFIG.collectionItemClass,
        [["div", null, [this._cprefix + "card", CONFIG.collectionCardClass],
           [["img", null, [this._cprefix + "img", CONFIG.cardImgClass], [],
               el => el.src = this._data.imgurls[0]],
            ["div", null, [this._cprefix + "btndiv", CONFIG.acceptBtnClass], this.make_accept_button()],
            ["div", null, [this._cprefix + "info", CONFIG.cardBodyClass],
              [["q" , null, this._cprefix + "quote", this._data.quote]]]]]]
    ))
  }

  make_big_card() {
    return this.add_to("_card_domobjs", Util.make_domobj(
      "div",
      this._cprefix + this._data.id,
      [this._cprefix + "card", CONFIG.collectionBigItemClass],
      [["img", null, [this._cprefix + "img", CONFIG.cardImgClass], [],
          el => el.src = this._data.imgurls[0]],                     
       ["div", null, [this._cprefix + "info", CONFIG.bigCardBodyClass],
         [["p" , null, this._cprefix + "location", ["Location: ", this._data.location]],
          ["p" , null, this._cprefix + "name"    , ["Name: ", this._data.name]],
          ["p" , null, this._cprefix + "gender"  , ["Gender: ", this._data.gender]],
          ["p" , null, this._cprefix + "height"  , ["Height: ", this._data.height, " cm"]],
          ["p" , null, this._cprefix + "fancies" , ["Looking for: ", this._data.fanciedGenders.join(", ")]],
          ["p" , null, this._cprefix + "likes"   , ["Yay: ", this._data.likes.join(", ")]],
          ["p" , null, this._cprefix + "dislikes", ["Nay: ", this._data.dislikes.join(", ")]],
          ["p" , null, this._cprefix + "interest", ["Interests: ", this._data.interests.join(", ")]],
         ]]]))
  }
}
