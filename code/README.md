# RentUA

Довгострокова оренда житла в містах України. Next.js, TypeScript, Tailwind CSS, shadcn/ui, Firebase (Auth + Firestore). Детальний план – у [PLAN.md](PLAN.md).

## Запуск

1. Створити проєкт у Firebase Console і налаштувати його:
   - Authentication: Get started, у Sign-in method увімкнути Email/Password;
   - Firestore Database: створити базу, у вкладці Rules вставити вміст `firestore.rules` і натиснути Publish.
2. Скопіювати `.env.local.example` у `.env.local` і заповнити значеннями з налаштувань веб-застосунку Firebase.
3. Встановити залежності та запустити:

```bash
npm install --legacy-peer-deps
npm run dev
```

Застосунок буде доступний на `http://localhost:3000`.

## Демонстраційні дані та перевірка правил

Скрипти працюють через клієнтський SDK, сервісний ключ не потрібен. Потрібні налаштований `.env.local`, ввімкнена Authentication (Email/Password) та опубліковані правила з `firestore.rules`.

```bash
npm run seed:dry
npm run seed
npm run check-rules
```

- `seed:dry` перевіряє дані без запису в Firebase.
- `seed` створює 6 демо-акаунтів (`demo.owner1@example.com`, `demo.tenant1@example.com` тощо, пароль `Demo12345`), 42 оголошення у 12 містах, заявки в різних станах і вподобання. Повторний запуск нічого не дублює.
- `check-rules` перевіряє правила Firestore: дозволені дії мають проходити, заборонені – завершуватись `permission-denied`. Запускати після `seed`.
