import { z } from "zod";

export const LIMITS = {
  textMax: 100,
  nameMax: 50,
  contactMin: 3,
  descriptionMax: 2000,
  commentMax: 500,
  roomsMin: 1,
  roomsMax: 10,
  areaMin: 5,
  areaMax: 1000,
  priceMax: 1_000_000,
  passwordMin: 6,
  loginPattern: /^[a-z0-9._-]{3,20}$/,
  phonePattern: /^\+380\d{9}$/,
} as const;

// Керуючі символи заборонені, зокрема розділювач сегментів шляху Trie
function hasNoControlChars(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) < 32) return false;
  }
  return true;
}

const requiredText = (label: string, max: number = LIMITS.textMax) =>
  z
    .string()
    .trim()
    .min(1, `${label}: поле обов'язкове`)
    .max(max, `${label}: максимум ${max} символів`)
    .refine(hasNoControlChars, `${label}: містить недопустимі символи`);

const numberField = (label: string) => z.number({ error: `${label}: вкажіть число` });

export const addressSchema = z.object({
  country: requiredText("Країна"),
  city: requiredText("Місто"),
  street: requiredText("Вулиця"),
  building: requiredText("Будинок"),
  apartment: requiredText("Квартира"),
});

export const listingFormSchema = z.object({
  ownerName: requiredText("Ім'я власника"),
  ownerPhone: z.string().trim().regex(LIMITS.phonePattern, "Телефон: формат +380XXXXXXXXX"),
  address: addressSchema,
  rooms: numberField("Кількість кімнат")
    .int("Кількість кімнат: ціле число")
    .min(LIMITS.roomsMin, `Кількість кімнат: від ${LIMITS.roomsMin}`)
    .max(LIMITS.roomsMax, `Кількість кімнат: до ${LIMITS.roomsMax}`),
  area: numberField("Площа")
    .min(LIMITS.areaMin, `Площа: від ${LIMITS.areaMin} м²`)
    .max(LIMITS.areaMax, `Площа: до ${LIMITS.areaMax} м²`),
  description: z.string().trim().max(LIMITS.descriptionMax, `Опис: максимум ${LIMITS.descriptionMax} символів`),
  pricePerMonth: numberField("Ціна")
    .int("Ціна: ціле число")
    .min(1, "Ціна: має бути додатною")
    .max(LIMITS.priceMax, `Ціна: до ${LIMITS.priceMax} грн`),
});

export const applicationFormSchema = z.object({
  applicantName: requiredText("Ім'я", LIMITS.nameMax),
  contact: requiredText("Контактні дані").min(LIMITS.contactMin, `Контактні дані: мінімум ${LIMITS.contactMin} символи`),
  comment: z.string().trim().max(LIMITS.commentMax, `Коментар: максимум ${LIMITS.commentMax} символів`),
});

export const loginFormSchema = z.object({
  login: z.string().trim().min(1, "Введіть логін"),
  password: z.string().min(1, "Введіть пароль"),
});

export const registerFormSchema = z
  .object({
    login: z
      .string()
      .trim()
      .toLowerCase()
      .regex(LIMITS.loginPattern, "Логін: 3–20 символів, латинські літери, цифри, «.», «_», «-»"),
    firstName: requiredText("Ім'я", LIMITS.nameMax),
    lastName: requiredText("Прізвище", LIMITS.nameMax),
    password: z.string().min(LIMITS.passwordMin, `Пароль: мінімум ${LIMITS.passwordMin} символів`),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"],
  });

export type ListingFormValues = z.infer<typeof listingFormSchema>;
export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
