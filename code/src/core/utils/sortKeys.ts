// Складений ключ індексу: значення (ціна, площа, дата) та id, щоб ключі були унікальними
export type SortKey = [number, string];

export function compareSortKeys(a: SortKey, b: SortKey): number {
  if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1;
  if (a[1] !== b[1]) return a[1] < b[1] ? -1 : 1;
  return 0;
}
