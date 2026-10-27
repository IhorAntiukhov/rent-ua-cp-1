type HashKey = string | number;

class HashNode<K extends HashKey, V> {
  constructor(
    public readonly key: K,
    public value: V,
    public next: HashNode<K, V> | null = null,
  ) {}
}

const INITIAL_CAPACITY = 16;
const MAX_LOAD_FACTOR = 0.75;

// Хеш-таблиця з ланцюжками (метод роздільних ланцюжків)
export class HashTable<K extends HashKey, V> {
  // Кошик – комірка масиву з номером, який дає хеш ключа. Зберігає початок
  // ланцюжка вузлів: ключі з однаковим номером (колізії) стають у той самий ланцюжок
  private buckets: Array<HashNode<K, V> | null>;
  private count = 0;

  constructor(initialCapacity: number = INITIAL_CAPACITY) {
    this.buckets = new Array(Math.max(1, initialCapacity)).fill(null);
  }

  get size(): number {
    return this.count;
  }

  get capacity(): number {
    return this.buckets.length;
  }

  get loadFactor(): number {
    return this.count / this.buckets.length;
  }

  // FNV-1a, 32 біти
  private static hash(key: HashKey): number {
    const text = String(key);
    let hash = 0x811c9dc5;

    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }

    return hash >>> 0;
  }

  private indexOf(key: HashKey, capacity: number): number {
    return HashTable.hash(key) % capacity;
  }

  private findNode(key: K): HashNode<K, V> | null {
    let node = this.buckets[this.indexOf(key, this.buckets.length)];

    while (node !== null) {
      if (node.key === key) return node;
      node = node.next;
    }

    return null;
  }

  set(key: K, value: V): void {
    const existing = this.findNode(key);
    if (existing) {
      existing.value = value;
      return;
    }

    const index = this.indexOf(key, this.buckets.length);
    this.buckets[index] = new HashNode(key, value, this.buckets[index]);
    this.count++;

    if (this.loadFactor > MAX_LOAD_FACTOR) this.resize(this.buckets.length * 2);
  }

  get(key: K): V | undefined {
    return this.findNode(key)?.value;
  }

  has(key: K): boolean {
    return this.findNode(key) !== null;
  }

  delete(key: K): boolean {
    const index = this.indexOf(key, this.buckets.length);
    let previous: HashNode<K, V> | null = null;
    let node = this.buckets[index];

    while (node !== null) {
      if (node.key === key) {
        if (previous) previous.next = node.next;
        else this.buckets[index] = node.next;
        this.count--;

        return true;
      }

      previous = node;
      node = node.next;
    }

    return false;
  }

  clear(): void {
    this.buckets = new Array(INITIAL_CAPACITY).fill(null);
    this.count = 0;
  }

  *entries(): IterableIterator<[K, V]> {
    for (const head of this.buckets) {
      for (let node = head; node !== null; node = node.next) {
        yield [node.key, node.value];
      }
    }
  }

  *keys(): IterableIterator<K> {
    for (const [key] of this.entries()) yield key;
  }

  *values(): IterableIterator<V> {
    for (const [, value] of this.entries()) yield value;
  }

  // Перехешування: вузли переносяться в нову таблицю без копіювання
  private resize(newCapacity: number): void {
    const newBuckets: Array<HashNode<K, V> | null> = new Array(newCapacity).fill(null);

    for (const head of this.buckets) {
      let node = head;

      while (node !== null) {
        const next = node.next;
        const index = this.indexOf(node.key, newCapacity);

        node.next = newBuckets[index];
        newBuckets[index] = node;
        node = next;
      }
    }

    this.buckets = newBuckets;
  }
}
