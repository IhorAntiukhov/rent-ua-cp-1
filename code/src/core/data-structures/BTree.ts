import { BTreeNode } from "./BTreeNode.ts";

const DEFAULT_MIN_DEGREE = 4;

// B-дерево з мінімальним степенем t: кожен вузол, крім кореня, має від t - 1 до 2t - 1 ключів,
// усі листки лежать на одній глибині. Ключі унікальні: повторна вставка оновлює значення
export class BTree<K, V> {
  private root = new BTreeNode<K, V>(true);
  private count = 0;

  constructor(
    private readonly compare: (a: K, b: K) => number,
    private readonly minDegree: number = DEFAULT_MIN_DEGREE,
  ) {
    if (minDegree < 2) throw new RangeError("Мінімальний степінь має бути не менше 2");
  }

  get size(): number {
    return this.count;
  }

  get height(): number {
    let height = 1;
    for (let node = this.root; !node.leaf; node = node.children[0]) height++;
    return height;
  }

  get(key: K): V | undefined {
    const found = this.findEntry(key);
    return found ? found.node.values[found.index] : undefined;
  }

  has(key: K): boolean {
    return this.findEntry(key) !== null;
  }

  clear(): void {
    this.root = new BTreeNode<K, V>(true);
    this.count = 0;
  }

  insert(key: K, value: V): void {
    const found = this.findEntry(key);
    if (found) {
      found.node.values[found.index] = value;
      return;
    }
    const maxKeys = 2 * this.minDegree - 1;
    if (this.root.keys.length === maxKeys) {
      const newRoot = new BTreeNode<K, V>(false);
      newRoot.children.push(this.root);
      this.splitChild(newRoot, 0);
      this.root = newRoot;
    }
    this.insertNonFull(this.root, key, value);
    this.count++;
  }

  delete(key: K): boolean {
    if (!this.has(key)) return false;
    this.deleteFromNode(this.root, key);
    if (this.root.keys.length === 0 && !this.root.leaf) this.root = this.root.children[0];
    this.count--;
    return true;
  }

  // Обхід за зростанням ключів
  *entries(): IterableIterator<[K, V]> {
    yield* this.walkAscending(this.root);
  }

  // Обхід за спаданням ключів
  *entriesDescending(): IterableIterator<[K, V]> {
    yield* this.walkDescending(this.root);
  }

  // Записи з ключами від from до to включно, за зростанням
  *rangeScan(from: K, to: K): IterableIterator<[K, V]> {
    yield* this.walkRange(this.root, from, to);
  }

  private findEntry(key: K): { node: BTreeNode<K, V>; index: number } | null {
    let node = this.root;
    for (;;) {
      const i = this.lowerBound(node, key);
      if (i < node.keys.length && this.compare(key, node.keys[i]) === 0) {
        return { node, index: i };
      }
      if (node.leaf) return null;
      node = node.children[i];
    }
  }

  // Індекс першого ключа вузла, що не менший за key
  private lowerBound(node: BTreeNode<K, V>, key: K): number {
    let i = 0;
    while (i < node.keys.length && this.compare(node.keys[i], key) < 0) i++;
    return i;
  }

  // Ділить повний дочірній вузол: середній ключ піднімається в parent
  private splitChild(parent: BTreeNode<K, V>, index: number): void {
    const t = this.minDegree;
    const child = parent.children[index];
    const right = new BTreeNode<K, V>(child.leaf);
    const middleKey = child.keys[t - 1];
    const middleValue = child.values[t - 1];

    right.keys = child.keys.splice(t);
    right.values = child.values.splice(t);
    if (!child.leaf) right.children = child.children.splice(t);
    child.keys.length = t - 1;
    child.values.length = t - 1;

    parent.keys.splice(index, 0, middleKey);
    parent.values.splice(index, 0, middleValue);
    parent.children.splice(index + 1, 0, right);
  }

  // Спускається до листка, заздалегідь ділячи повні вузли на шляху
  private insertNonFull(start: BTreeNode<K, V>, key: K, value: V): void {
    const maxKeys = 2 * this.minDegree - 1;
    let node = start;
    while (!node.leaf) {
      let i = this.lowerBound(node, key);
      if (node.children[i].keys.length === maxKeys) {
        this.splitChild(node, i);
        if (this.compare(key, node.keys[i]) > 0) i++;
      }
      node = node.children[i];
    }
    const position = this.lowerBound(node, key);
    node.keys.splice(position, 0, key);
    node.values.splice(position, 0, value);
  }

  // Видалення за схемою Кормена: перед спуском у дочірній вузол гарантуємо, що в ньому не менше t ключів
  private deleteFromNode(node: BTreeNode<K, V>, key: K): void {
    const t = this.minDegree;
    let i = this.lowerBound(node, key);

    if (i < node.keys.length && this.compare(key, node.keys[i]) === 0) {
      if (node.leaf) {
        node.keys.splice(i, 1);
        node.values.splice(i, 1);
        return;
      }
      const left = node.children[i];
      const right = node.children[i + 1];
      if (left.keys.length >= t) {
        const [predKey, predValue] = this.maxEntry(left);
        node.keys[i] = predKey;
        node.values[i] = predValue;
        this.deleteFromNode(left, predKey);
      } else if (right.keys.length >= t) {
        const [succKey, succValue] = this.minEntry(right);
        node.keys[i] = succKey;
        node.values[i] = succValue;
        this.deleteFromNode(right, succKey);
      } else {
        this.mergeChildren(node, i);
        this.deleteFromNode(left, key);
      }
      return;
    }

    if (node.leaf) return;

    if (node.children[i].keys.length < t) {
      i = this.fillChild(node, i);
    }
    this.deleteFromNode(node.children[i], key);
  }

  // Збільшує кількість ключів у дочірньому вузлі до t; повертає його новий індекс
  private fillChild(parent: BTreeNode<K, V>, index: number): number {
    const t = this.minDegree;
    if (index > 0 && parent.children[index - 1].keys.length >= t) {
      this.borrowFromPrevious(parent, index);
      return index;
    }
    if (index < parent.keys.length && parent.children[index + 1].keys.length >= t) {
      this.borrowFromNext(parent, index);
      return index;
    }
    if (index < parent.keys.length) {
      this.mergeChildren(parent, index);
      return index;
    }
    this.mergeChildren(parent, index - 1);
    return index - 1;
  }

  private borrowFromPrevious(parent: BTreeNode<K, V>, index: number): void {
    const child = parent.children[index];
    const sibling = parent.children[index - 1];
    child.keys.unshift(parent.keys[index - 1]);
    child.values.unshift(parent.values[index - 1]);
    if (!child.leaf) child.children.unshift(sibling.children.pop()!);
    parent.keys[index - 1] = sibling.keys.pop()!;
    parent.values[index - 1] = sibling.values.pop()!;
  }

  private borrowFromNext(parent: BTreeNode<K, V>, index: number): void {
    const child = parent.children[index];
    const sibling = parent.children[index + 1];
    child.keys.push(parent.keys[index]);
    child.values.push(parent.values[index]);
    if (!child.leaf) child.children.push(sibling.children.shift()!);
    parent.keys[index] = sibling.keys.shift()!;
    parent.values[index] = sibling.values.shift()!;
  }

  // Зливає дочірні вузли index та index + 1 разом з ключем батька між ними
  private mergeChildren(parent: BTreeNode<K, V>, index: number): void {
    const left = parent.children[index];
    const right = parent.children[index + 1];
    left.keys.push(parent.keys[index], ...right.keys);
    left.values.push(parent.values[index], ...right.values);
    if (!left.leaf) left.children.push(...right.children);
    parent.keys.splice(index, 1);
    parent.values.splice(index, 1);
    parent.children.splice(index + 1, 1);
  }

  private minEntry(start: BTreeNode<K, V>): [K, V] {
    let node = start;
    while (!node.leaf) node = node.children[0];
    return [node.keys[0], node.values[0]];
  }

  private maxEntry(start: BTreeNode<K, V>): [K, V] {
    let node = start;
    while (!node.leaf) node = node.children[node.children.length - 1];
    const last = node.keys.length - 1;
    return [node.keys[last], node.values[last]];
  }

  private *walkAscending(node: BTreeNode<K, V>): IterableIterator<[K, V]> {
    for (let i = 0; i < node.keys.length; i++) {
      if (!node.leaf) yield* this.walkAscending(node.children[i]);
      yield [node.keys[i], node.values[i]];
    }
    if (!node.leaf) yield* this.walkAscending(node.children[node.keys.length]);
  }

  private *walkDescending(node: BTreeNode<K, V>): IterableIterator<[K, V]> {
    if (!node.leaf) yield* this.walkDescending(node.children[node.keys.length]);
    for (let i = node.keys.length - 1; i >= 0; i--) {
      yield [node.keys[i], node.values[i]];
      if (!node.leaf) yield* this.walkDescending(node.children[i]);
    }
  }

  // Пропускає піддерева ліворуч від from і завершує обхід, щойно ключ перевищив to
  private *walkRange(node: BTreeNode<K, V>, from: K, to: K): IterableIterator<[K, V]> {
    for (let i = this.lowerBound(node, from); i < node.keys.length; i++) {
      if (!node.leaf) yield* this.walkRange(node.children[i], from, to);
      if (this.compare(node.keys[i], to) > 0) return;
      yield [node.keys[i], node.values[i]];
    }
    if (!node.leaf) yield* this.walkRange(node.children[node.keys.length], from, to);
  }
}
