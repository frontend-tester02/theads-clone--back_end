# Threads clone backend

Node.js, Express, TypeScript va Mongoose asosidagi boshlang‘ich loyiha.
Node.js 24 LTS va npm ishlating.

## O‘rnatish

Loyiha ildizidan:

```sh
cd backend
npm install
cp .env.example .env
```

`.env` ichida `MONGODB_URI` qiymatini o‘zingizning MongoDB ulanish manzilingiz bilan to‘ldiring.
`PORT` standart qiymati `5000`, `CLIENT_URL` esa `http://localhost:3000`.
Haqiqiy ulanish manzili va `.env` faylini Git’ga qo‘shmang.
MongoDB ishga tushgan va serverdan unga ulanish mumkin bo‘lishi kerak.
`MONGODB_URI` bo‘sh bo‘lsa yoki ulanish amalga oshmasa, server ishga tushmaydi.

## Ishga tushirish

Ishlab chiqish rejimi (fayllar o‘zgarsa avtomatik qayta ishga tushadi):

```sh
npm run dev
```

TypeScript tekshiruvi va build:

```sh
npm run typecheck
npm run build
npm start
```

Qo‘shimcha kod tekshiruvi: `npm run lint`.

Server ishga tushgach:

```sh
curl http://localhost:5000/health
```

Javob: `{ "status": "ok" }`. Bu endpoint HTTP server holatini bildiradi.

## API

Barcha biznes endpointlari `/api` bilan boshlanadi (API versiyasi ishlatilmaydi).

### `POST /api/auth/register`

Yangi foydalanuvchini ro‘yxatdan o‘tkazadi. Parol hech qachon ochiq saqlanmaydi —
faqat uning bcrypt hash’i bazaga yoziladi va javobda `passwordHash` qaytarilmaydi.

Request body (JSON):

| Maydon        | Tur    | Talab                                                                    |
| ------------- | ------ | ------------------------------------------------------------------------ |
| `username`    | string | 3–30 belgi; faqat harf, raqam, `_`, `.`; trim + lowercase’ga keltiriladi |
| `email`       | string | To‘g‘ri email; trim + lowercase’ga keltiriladi                           |
| `password`    | string | 8–72 belgi                                                               |
| `displayName` | string | 1–50 belgi                                                               |

So‘rov namunasi:

```sh
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "jamshid",
    "email": "jamshid@example.com",
    "password": "supersecret1",
    "displayName": "Jamshid"
  }'
```

Muvaffaqiyatli javob — `201 Created`:

```json
{
  "data": {
    "user": {
      "id": "6ac103218fb094be1df8567d",
      "username": "jamshid",
      "email": "jamshid@example.com",
      "displayName": "Jamshid",
      "bio": "",
      "avatarUrl": "",
      "isPrivate": false,
      "createdAt": "2026-10-03T13:29:05.340Z"
    }
  }
}
```

Xato javoblari `{ "error": { "message": ... } }` formatida bo‘ladi:

- `400 Bad Request` — validatsiya xatosi (noto‘g‘ri email, qisqa parol, noto‘g‘ri
  username formati va h.k.). Javobda `error.details` ichida har bir maydon bo‘yicha
  tushuntirish bo‘ladi:

  ```json
  {
    "error": {
      "message": "The submitted data is invalid.",
      "details": [{ "field": "email", "message": "Invalid email address." }]
    }
  }
  ```

- `409 Conflict` — `username` yoki `email` allaqachon band (bir vaqtda kelgan bir xil
  so‘rovlardagi MongoDB duplicate-key holati ham shu kodga aylanadi):

  ```json
  { "error": { "message": "Email is already taken." } }
  ```

### `POST /api/auth/login`

Foydalanuvchini username orqali tekshiradi. Muvaffaqiyatda JWT token yaratilib,
`httpOnly` cookie (`access_token`) sifatida o‘rnatiladi — token javob tanasida
qaytarilmaydi. `JWT_SECRET` majburiy, token muddati `JWT_EXPIRES_IN`
(default `7d`) orqali boshqariladi va cookie `maxAge` ham shunga mos bo‘ladi.

Request body (JSON):

| Maydon     | Tur    | Talab                           |
| ---------- | ------ | ------------------------------- |
| `username` | string | Username (trim + lowercase)     |
| `password` | string | Bo‘sh bo‘lmasin                 |

So‘rov namunasi:

```sh
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{ "username": "jamshid", "password": "supersecret1" }'
```

Muvaffaqiyatli javob — `200 OK` (va `Set-Cookie: access_token=...; HttpOnly; SameSite=Lax`):

```json
{
  "data": {
    "id": "6ac103218fb094be1df8567d",
    "username": "jamshid",
    "email": "jamshid@example.com",
    "displayName": "Jamshid",
    "bio": "",
    "avatarUrl": "",
    "isPrivate": false,
    "createdAt": "2026-10-03T13:29:05.340Z"
  }
}
```

Username topilmasa yoki parol noto‘g‘ri bo‘lsa — ikkala holatda ham bir xil
`401 Unauthorized` (qaysi maydon xato ekani oshkor qilinmaydi):

```json
{ "error": { "message": "Invalid credentials." } }
```

Hozircha JWT bilan himoyalangan endpointlar, email tasdiqlash, follow va post
funksiyalari qo‘shilmagan.
