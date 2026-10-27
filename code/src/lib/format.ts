const priceFormatter = new Intl.NumberFormat("uk-UA");
const areaFormatter = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 1 });
const dateFormatter = new Intl.DateTimeFormat("uk-UA");

export function formatPrice(pricePerMonth: number): string {
  return `${priceFormatter.format(pricePerMonth)} грн/міс`;
}

export function formatArea(area: number): string {
  return `${areaFormatter.format(area)} м²`;
}

export function formatRooms(rooms: number): string {
  return `${rooms} кімн.`;
}

export function formatDate(timestamp: number): string {
  return dateFormatter.format(timestamp);
}

// «1 оголошення», «3 оголошення», «5 оголошень», «11 оголошень», «21 оголошення»
export function formatListingsCount(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  const isFew = lastDigit >= 1 && lastDigit <= 4 && !(lastTwoDigits >= 11 && lastTwoDigits <= 14);

  return `${count} ${isFew ? "оголошення" : "оголошень"}`;
}
