export function actionColor(a) {
  return {
    add: 'green',
    takeout: 'orange',
    restock: 'blue',
    relocate: 'grey',
    edit: 'purple',
    create: 'green',
    delete: 'red',
    item_delete: 'deep-orange',
  }[a] || 'grey'
}

export function actionIcon(a) {
  return {
    add: 'mdi-plus-circle',
    takeout: 'mdi-minus-circle',
    restock: 'mdi-refresh',
    relocate: 'mdi-arrow-right-bold',
    edit: 'mdi-pencil',
    create: 'mdi-plus-circle',
    delete: 'mdi-delete',
    item_delete: 'mdi-package-variant-remove',
  }[a] || 'mdi-information'
}

export function containerActionLabel(a) {
  return { create: 'created', edit: 'edited', delete: 'deleted', item_delete: 'item deleted' }[a] || a
}
