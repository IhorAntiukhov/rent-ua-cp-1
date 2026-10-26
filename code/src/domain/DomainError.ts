// Порушення правил домену; повідомлення призначене для користувача
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}
