// Вузол B-дерева: keys[i] і values[i] – запис; children[i] містить ключі менші за keys[i]
export class BTreeNode<K, V> {
  keys: K[] = [];
  values: V[] = [];
  children: Array<BTreeNode<K, V>> = [];

  constructor(public leaf: boolean) {}
}
