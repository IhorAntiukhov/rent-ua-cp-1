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

// «1 кімната», «2 кімнати», «5 кімнат»
export function formatRoomCount(rooms: number): string {
  const lastDigit = rooms % 10;
  const lastTwoDigits = rooms % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) return `${rooms} кімната`;
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)) return `${rooms} кімнати`;

  return `${rooms} кімнат`;
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
