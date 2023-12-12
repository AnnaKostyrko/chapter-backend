# **CHAPTER** - social network for book-lovers

## Description

Team-pet-project named **CHAPTER**. This is a web app - social network for book-lovers.

People can create post with caption and image to our service and share them with their followers. 
They can also view, comment and like posts shared by their friends on Chapter.
Anyone can create an account by registering an email address or via Google and selecting a username.
Then registered users can create bookshelf with their favorite books and share their opinion about the book.

You are in repository of backend part of the project. It is based on NestJS REST API boilerplate.
* Link to sign up in our social network: [CHAPTER sign up]()
* Boilerplate: [Full documentation here](https://github.com/brocoders/nestjs-boilerplate/blob/main/docs/readme.md)
* Frontend repository is here: [GitHub Repository]()
* Design part in Figma is here: [Figma design]()

Deploy of backend part is on Heroku, frontend part is on AWS, database is on Vercel 

## Table of Contents

- [Features](#features)
- [Quick run](#quick-run)
- [Comfortable development](#comfortable-development)
- [Links](#links)
- [Database utils](#database-utils)
- [Backend team](#backend-team)

## Features

- [x] Database ([typeorm](https://www.npmjs.com/package/typeorm)).
- [x] Seeding.
- [x] Config Service ([@nestjs/config](https://www.npmjs.com/package/@nestjs/config)).
- [x] Mailing ([nodemailer](https://www.npmjs.com/package/nodemailer)).
- [x] Sign in and sign up via email.
- [x] Social sign in (Google).
- [x] Create, edit, delete, restore account.
- [x] Follow, unfollow friends.
- [x] Create, edit, delete own bookshelf.
- [x] Create, delete, edit post (image, title, caption).
- [x] Create, delete, edit comments, answer on someone comment (text).
- [x] Like, unlike post or comment.
- [x] Get feed.
- [x] Admin and User roles.
- [x] Swagger.
- [x] Docker.
- [x] CI (Github Actions).

## Quick run

```bash
git clone --depth 1 https://github.com/brocoders/nestjs-boilerplate.git my-app
cd my-app/
cp env-example .env
docker compose up -d
```

For check status run

```bash
docker compose logs
```

## Comfortable development

```bash
git clone --depth 1 https://github.com/brocoders/nestjs-boilerplate.git my-app
cd my-app/
cp env-example .env
```

Change `DATABASE_HOST=postgres` to `DATABASE_HOST=localhost`

Change `MAIL_HOST=maildev` to `MAIL_HOST=localhost`

Run additional container:

```bash
docker compose up -d postgres adminer maildev
```

```bash
npm install

npm run migration:run

npm run seed:run

npm run start:dev
```

## Links

- Swagger: http://localhost:3000/docs
- Adminer (client for DB): http://localhost:8080
- Maildev: http://localhost:1080

## Database utils

Generate migration

```bash
npm run migration:generate -- src/database/migrations/CreateNameTable
```

Run migration

```bash
npm run migration:run
```

Revert migration

```bash
npm run migration:revert
```

Drop all tables in database

```bash
npm run schema:drop
```

Run seed

```bash
npm run seed:run
```

## Backend team

* [Anna Kostyrko](https://www.linkedin.com/in/annafffox/)
* [Vlad Virchenko](https://www.linkedin.com/in/vlad-virchenko/)
* [Valera Shevchuk](https://www.linkedin.com/in/valera-shevchuk-86261b206/)
* [Михайло Іляш](https://www.linkedin.com/in/mikeleilyash/)
* [Денис Кононученко](https://www.linkedin.com/in/denis-kononuchenko/)
