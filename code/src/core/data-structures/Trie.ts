import { HashSet } from "./HashSet.ts";
import { TrieNode } from "./TrieNode.ts";

// Розділювач сегментів шляху (країна, місто, вулиця тощо)
export const TRIE_SEPARATOR = "\u001F";

// Префіксне дерево: шлях запису – рядок із сегментів, розділених TRIE_SEPARATOR
export class Trie {
  private readonly root = new TrieNode();

  clear(): void {
    this.root.children.clear();
    this.root.ids.clear();
  }

  // labels[k] – вихідний текст k-го сегмента шляху
  insert(path: string, id: string, labels: string[]): void {
    let node = this.root;
    let segment = 0;
    for (const char of path) {
      if (char === TRIE_SEPARATOR) {
        node.label ??= labels[segment];
        segment++;
      }
      let next = node.children.get(char);
      if (!next) {
        next = new TrieNode();
        node.children.set(char, next);
      }
      node = next;
    }
    node.label ??= labels[segment];
    node.ids.add(id);
  }

  // Видаляє id і прибирає гілки, що стали порожніми
  remove(path: string, id: string): boolean {
    const trail: Array<{ parent: TrieNode; char: string }> = [];
    let node = this.root;
    for (const char of path) {
      const next = node.children.get(char);
      if (!next) return false;
      trail.push({ parent: node, char });
      node = next;
    }
    if (!node.ids.delete(id)) return false;

    for (let i = trail.length - 1; i >= 0; i--) {
      if (node.ids.size > 0 || node.children.size > 0) break;
      trail[i].parent.children.delete(trail[i].char);
      node = trail[i].parent;
    }
    return true;
  }

  // id усіх записів, шлях яких починається з prefix
  findByPrefix(prefix: string): HashSet<string> {
    const result = new HashSet<string>();
    const start = this.descend(prefix);
    if (!start) return result;

    const stack = [start];
    while (stack.length > 0) {
      const node = stack.pop()!;
      for (const id of node.ids) result.add(id);
      for (const child of node.children.values()) stack.push(child);
    }
    return result;
  }

  // Варіанти завершення останнього (неповного) сегмента prefix, відсортовані за алфавітом
  suggest(prefix: string, limit: number): string[] {
    const start = this.descend(prefix);
    if (!start) return [];

    const labels: string[] = [];
    const stack = [start];
    while (stack.length > 0) {
      const node = stack.pop()!;
      const endsSegment = node.ids.size > 0 || node.children.has(TRIE_SEPARATOR);
      if (endsSegment && node.label !== null) labels.push(node.label);
      for (const [char, child] of node.children.entries()) {
        if (char !== TRIE_SEPARATOR) stack.push(child);
      }
    }
    return labels.sort((a, b) => a.localeCompare(b, "uk")).slice(0, limit);
  }

  private descend(prefix: string): TrieNode | null {
    let node = this.root;
    for (const char of prefix) {
      const next = node.children.get(char);
      if (!next) return null;
      node = next;
    }
    return node;
  }
}
