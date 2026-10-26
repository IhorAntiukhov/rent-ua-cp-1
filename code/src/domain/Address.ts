import { TRIE_SEPARATOR } from "@/core/data-structures/Trie.ts";

export interface AddressData {
  country: string;
  city: string;
  street: string;
  building: string;
  apartment: string;
}

// Рівні адреси, за якими можна шукати (квартира в пошуку не використовується)
export const ADDRESS_SEARCH_LEVELS = ["country", "city", "street", "building"] as const;

export type AddressSearchLevel = (typeof ADDRESS_SEARCH_LEVELS)[number];

export type AddressSearchParts = Partial<Record<AddressSearchLevel, string>>;

export class Address {
  private constructor(
    readonly country: string,
    readonly city: string,
    readonly street: string,
    readonly building: string,
    readonly apartment: string,
  ) {}

  static create(data: AddressData): Address {
    return new Address(data.country, data.city, data.street, data.building, data.apartment);
  }

  // Нижній регістр, один пробіл між словами, єдиний апостроф
  static normalize(text: string): string {
    return text.trim().replace(/\s+/g, " ").replace(/[’ʼ`]/g, "'").toLocaleLowerCase("uk");
  }

  // Префікс шляху Trie для пошуку: рівні задаються послідовно, без пропусків.
  // Усі рівні, крім останнього, трактуються як повні, останній – як початок слова
  static searchPrefix(parts: AddressSearchParts): string {
    const segments: string[] = [];
    for (const level of ADDRESS_SEARCH_LEVELS) {
      const value = Address.normalize(parts[level] ?? "");
      if (value === "") break;
      segments.push(value);
    }
    return segments.join(TRIE_SEPARATOR);
  }

  // Префікс для підказок рівня level: попередні рівні повні, поточний – початок слова.
  // Якщо якийсь із попередніх рівнів не заповнений, підказок немає (null)
  static suggestionPrefix(level: AddressSearchLevel, parts: AddressSearchParts): string | null {
    const segments: string[] = [];
    for (const current of ADDRESS_SEARCH_LEVELS) {
      const value = Address.normalize(parts[current] ?? "");
      if (current === level) {
        segments.push(value);
        return segments.join(TRIE_SEPARATOR);
      }
      if (value === "") return null;
      segments.push(value);
    }
    return null;
  }

  // Єдиний рядок з приставками: Україна, місто Запоріжжя, вулиця Полякова, буд. 21, кв. 71
  format(): string {
    return `${this.country}, місто ${this.city}, вулиця ${this.street}, буд. ${this.building}, кв. ${this.apartment}`;
  }

  // Вихідний текст сегментів у порядку шляху
  segments(): string[] {
    return [this.country, this.city, this.street, this.building, this.apartment];
  }

  toTriePath(): string {
    return this.segments().map(Address.normalize).join(TRIE_SEPARATOR);
  }

  toData(): AddressData {
    return {
      country: this.country,
      city: this.city,
      street: this.street,
      building: this.building,
      apartment: this.apartment,
    };
  }
}
