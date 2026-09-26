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

Hozircha faqat loyiha asosi va MongoDB ulanishi mavjud. Auth, post, feed va boshqa biznes funksiyalari qo‘shilmagan.
