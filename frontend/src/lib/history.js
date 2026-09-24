export function actionColor(a) {
  return { add: 'green', takeout: 'orange', restock: 'blue', relocate: 'grey' }[a] || 'grey'
}

export function actionIcon(a) {
  return { add: 'mdi-plus-circle', takeout: 'mdi-minus-circle', restock: 'mdi-refresh', relocate: 'mdi-arrow-right-bold' }[a] || 'mdi-information'
}
