export enum ListingStatus {
  Open = "OPEN",
  Closed = "CLOSED",
}

export enum ApplicationStatus {
  Pending = "PENDING",
  Approved = "APPROVED",
  Rejected = "REJECTED",
  // Орендар більше не мешкає в квартирі: оголошення поновлено після виселення
  Ended = "ENDED",
}

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  [ListingStatus.Open]: "Здається",
  [ListingStatus.Closed]: "Закрито",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Pending]: "Очікує",
  [ApplicationStatus.Approved]: "Схвалена",
  [ApplicationStatus.Rejected]: "Відхилена",
  [ApplicationStatus.Ended]: "Оренду завершено",
};
