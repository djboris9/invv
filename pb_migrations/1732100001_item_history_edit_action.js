migrate((app) => {
  const itemHistory = app.findCollectionByNameOrId("item_history");
  const action = itemHistory.fields.getByName("action");
  action.values = ["add", "takeout", "restock", "relocate", "edit"];
  app.save(itemHistory);
}, (app) => {
  const itemHistory = app.findCollectionByNameOrId("item_history");
  const action = itemHistory.fields.getByName("action");
  action.values = ["add", "takeout", "restock", "relocate"];
  app.save(itemHistory);
});
