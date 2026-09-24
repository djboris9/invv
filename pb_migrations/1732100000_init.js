migrate((app) => {
  // containers
  const containers = new Collection();
  containers.type = "base";
  containers.name = "containers";
  containers.listRule = "@request.auth.id != ''";
  containers.viewRule = "@request.auth.id != ''";
  containers.createRule = "@request.auth.id != ''";
  containers.updateRule = "@request.auth.id != ''";
  containers.deleteRule = "@request.auth.id != ''";
  containers.fields.add(new TextField({ name: "name", required: true, max: 200 }));
  containers.fields.add(new TextField({ name: "location", max: 200 }));
  containers.fields.add(new AutodateField({ name: "created", onCreate: true }));
  app.save(containers);

  // items - belong to exactly one (or no) container
  const items = new Collection();
  items.type = "base";
  items.name = "items";
  items.listRule = "@request.auth.id != ''";
  items.viewRule = "@request.auth.id != ''";
  items.createRule = "@request.auth.id != ''";
  items.updateRule = "@request.auth.id != ''";
  items.deleteRule = "@request.auth.id != ''";
  items.fields.add(new TextField({ name: "name", required: true, max: 300 }));
  items.fields.add(new TextField({ name: "manufacturer", max: 200 }));
  items.fields.add(new TextField({ name: "order_number", max: 200 }));
  items.fields.add(new TextField({ name: "mfr_part_number", max: 200 }));
  items.fields.add(new NumberField({ name: "quantity_full", required: true }));
  items.fields.add(new NumberField({ name: "quantity_stock" }));
  items.fields.add(new DateField({ name: "date_added" }));
  items.fields.add(new TextField({ name: "code_raw", max: 500 }));
  items.fields.add(new SelectField({ name: "distributor", values: ["lcsc"], maxSelect: 1 }));
  items.fields.add(
    new RelationField({
      name: "container",
      collectionId: containers.id,
      maxSelect: 1,
      minSelect: 0,
      cascadeDelete: false,
    })
  );
  items.fields.add(new AutodateField({ name: "created", onCreate: true }));
  app.save(items);

  // item_history - all item mutations are logged
  const itemHistory = new Collection();
  itemHistory.type = "base";
  itemHistory.name = "item_history";
  itemHistory.listRule = "@request.auth.id != ''";
  itemHistory.viewRule = "@request.auth.id != ''";
  itemHistory.createRule = "@request.auth.id != ''";
  itemHistory.updateRule = null;
  itemHistory.deleteRule = null;
  itemHistory.fields.add(
    new RelationField({
      name: "item",
      collectionId: items.id,
      maxSelect: 1,
      minSelect: 1,
      cascadeDelete: true,
    })
  );
  itemHistory.fields.add(
    new SelectField({
      name: "action",
      values: ["add", "takeout", "restock", "relocate"],
      required: true,
      maxSelect: 1,
    })
  );
  itemHistory.fields.add(new NumberField({ name: "quantity" }));
  itemHistory.fields.add(new TextField({ name: "user", max: 200 }));
  itemHistory.fields.add(new TextField({ name: "note", max: 500 }));
  itemHistory.fields.add(new AutodateField({ name: "datetime", onCreate: true }));
  app.save(itemHistory);
}, (app) => {
  const itemHistory = app.findCollectionByNameOrId("item_history");
  app.delete(itemHistory);

  const items = app.findCollectionByNameOrId("items");
  app.delete(items);

  const containers = app.findCollectionByNameOrId("containers");
  app.delete(containers);
});
