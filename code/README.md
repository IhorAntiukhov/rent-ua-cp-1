# RentUA

Довгострокова оренда житла в містах України. Next.js, TypeScript, Tailwind CSS, shadcn/ui, Firebase (Auth + Firestore).

## Запуск

1. У Firebase Console увімкніть Authentication (Email/Password) і Firestore, у Rules вставте вміст `firestore.rules`.
2. Скопіюйте `.env.local.example` у `.env.local` і заповніть його даними веб-застосунку Firebase.
3. Встановіть залежності та запустіть:

```bash
npm install --legacy-peer-deps
npm run dev
```

Застосунок буде на `http://localhost:3000`.

## Демо-дані

```bash
npm run seed
```

Створює демо-акаунти (`demo.owner1@example.com`, `demo.tenant1@example.com` тощо, пароль `Demo12345`) та оголошення. Перевірка правил – `npm run check-rules`.
