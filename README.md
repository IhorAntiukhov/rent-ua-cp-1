# RentUA

Довгострокова оренда житла в містах України. Next.js, TypeScript, Tailwind CSS, shadcn/ui, Firebase (Auth + Firestore).

Увесь код лежить у теці `code`.

## Запуск

1. У Firebase Console увімкніть Authentication (Email/Password) і Firestore, у Rules вставте вміст `code/firestore.rules`.
2. У теці `code` скопіюйте `.env.local.example` у `.env.local` і заповніть його даними веб-застосунку Firebase.
3. Встановіть залежності та запустіть:

```bash
cd code
npm install --legacy-peer-deps
npm run dev
```

Застосунок буде на `http://localhost:3000`.

## Демо-дані

```bash
npm run seed
```

Створює демо-акаунти (`demo.owner1@example.com`, `demo.tenant1@example.com` тощо) із паролем `SEED_DEMO_PASSWORD` з `.env.local` та оголошення. Перевірка правил – `npm run check-rules`.
