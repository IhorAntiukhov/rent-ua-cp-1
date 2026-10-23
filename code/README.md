# RentUA

Довгострокова оренда житла в містах України. Next.js, TypeScript, Tailwind CSS, shadcn/ui, Firebase (Auth + Firestore). Детальний план – у [PLAN.md](PLAN.md).

## Запуск

1. Створити проєкт у Firebase Console, увімкнути Authentication (Email/Password) і Firestore.
2. Скопіювати `.env.local.example` у `.env.local` і заповнити значеннями з налаштувань веб-застосунку Firebase.
3. Встановити залежності та запустити:

```bash
npm install --legacy-peer-deps
npm run dev
```

Застосунок буде доступний на `http://localhost:3000`.
