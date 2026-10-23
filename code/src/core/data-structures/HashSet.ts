import { HashTable } from "./HashTable";

// Множина – набір унікальних значень без порядку. Реалізована на хеш-таблиці:
// значення є ключами, а у вузлах лежить лише мітка true, тому add, has і delete
// працюють за O(1) у середньому
export class HashSet<T extends string | number> {
  private readonly table = new HashTable<T, true>();

  get size(): number {
    return this.table.size;
  }

  add(value: T): void {
    this.table.set(value, true);
  }

  has(value: T): boolean {
    return this.table.has(value);
  }

  delete(value: T): boolean {
    return this.table.delete(value);
  }

  clear(): void {
    this.table.clear();
  }

  values(): IterableIterator<T> {
    return this.table.keys();
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.values();
  }

  // Перетин: обходимо меншу множину
  static intersect<T extends string | number>(a: HashSet<T>, b: HashSet<T>): HashSet<T> {
    const [small, large] = a.size <= b.size ? [a, b] : [b, a];
    const result = new HashSet<T>();
    for (const value of small) {
      if (large.has(value)) result.add(value);
    }
    return result;
  }

  static union<T extends string | number>(a: HashSet<T>, b: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>();
    for (const value of a) result.add(value);
    for (const value of b) result.add(value);
    return result;
  }
}
