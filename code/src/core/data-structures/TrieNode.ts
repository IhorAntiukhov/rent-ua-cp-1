import { HashSet } from "./HashSet";
import { HashTable } from "./HashTable";

export class TrieNode {
  readonly children = new HashTable<string, TrieNode>();
  // id записів, шлях яких закінчується в цьому вузлі
  readonly ids = new HashSet<string>();
  // Вихідний текст сегмента, що закінчується в цьому вузлі (для підказок)
  label: string | null = null;
}
