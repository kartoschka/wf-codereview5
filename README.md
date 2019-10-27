## Lib Files

- config.js: global style configuration thing (so I don't have bootstrap classes
  inside my base classes)
- util.js: independent utility functions
- item.js: classes describing a single Item with its data and functions and
  different html representations
- collection.js: classes describing a list of Items
- load.js: actual loading of json data and objects and drawing html elements

## Data relationships

Data for single entities is saved in a JSON array of objects. An Item represents
JSON data, has an accept/unaccept state and keeps track of its individual html
representations. A Collection owns a number of Items and provides methods for
sorting and filtering. A CollectionSubset contains a reference to a Collection
and includes members from it depending on the state of an Item property
(accept-state). There is an observer-notice chain going from any single Item
over the Collection containing it to the Subset which needs to know when an
accept-state changes so it can update its contents.
