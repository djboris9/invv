migrate((app) => {
  // container_history - append-only audit log for container mutations.
  // Stores snapshots (id/name) instead of relations so entries survive
  // deletion of the referenced container.
  const containerHistory = new Collection();
  containerHistory.type = "base";
  containerHistory.name = "container_history";
  containerHistory.listRule = "@request.auth.id != ''";
  containerHistory.viewRule = "@request.auth.id != ''";
  containerHistory.createRule = "@request.auth.id != ''";
  containerHistory.updateRule = null;
  containerHistory.deleteRule = null;
  containerHistory.fields.add(new TextField({ name: "container_id", max: 100 }));
  containerHistory.fields.add(new TextField({ name: "container_name", max: 200 }));
  containerHistory.fields.add(new TextField({ name: "item_name", max: 300 }));
  containerHistory.fields.add(
    new SelectField({
      name: "action",
      values: ["create", "edit", "delete", "item_delete"],
      required: true,
      maxSelect: 1,
    })
  );
  containerHistory.fields.add(new TextField({ name: "note", max: 500 }));
  containerHistory.fields.add(new TextField({ name: "user", max: 200 }));
  containerHistory.fields.add(new AutodateField({ name: "datetime", onCreate: true }));
  app.save(containerHistory);
}, (app) => {
  const containerHistory = app.findCollectionByNameOrId("container_history");
  app.delete(containerHistory);
});
