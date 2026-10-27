import { HashSet } from "../data-structures/HashSet.ts";
import { HashTable } from "../data-structures/HashTable.ts";

type BucketKey = string | number;

// У індексах кошик – це множина id, що відповідають одному ключу (наприклад, усі
// оголошення з 2 кімнатами). Таблиця «ключ → кошик» дає пошук за рівністю за O(1)

// Додає id до кошика за ключем, створюючи кошик за потреби
export function addToBucket<K extends BucketKey>(
  table: HashTable<K, HashSet<string>>,
  key: K,
  id: string,
): void {
  let bucket = table.get(key);

  if (!bucket) {
    bucket = new HashSet<string>();
    table.set(key, bucket);
  }

  bucket.add(id);
}

// Видаляє id з кошика, порожній кошик прибирається
export function removeFromBucket<K extends BucketKey>(
  table: HashTable<K, HashSet<string>>,
  key: K,
  id: string,
): void {
  const bucket = table.get(key);
  if (!bucket) return;

  bucket.delete(id);

  if (bucket.size === 0) table.delete(key);
}
