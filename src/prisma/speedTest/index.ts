import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query'],
});

let time = new Date();
const start = () => (time = new Date());
const end = (msg: string) =>
  // @ts-ignore
  console.info(`${msg} [Time: %dms]`, new Date() - time);

async function main() {
  start();
  await prisma.$executeRaw`select count(*) from "Post" inner join "User" on "Post"."authorId" = "User".id`;
  end("User's posts total count query");

  //ORDER BY name ASC/DESC
  start();
  await prisma.$executeRaw`select * from "Post" order by "title" asc LIMIT 50`;
  end("User's posts order by title asc LIMIT 50");

  //WHERE name = 'ABC
  start();
  await prisma.$executeRaw`select * from "Post" where "title" = 'A ab beatae.'`;
  end("User's posts where title = 'A ab beatae.'");

  //WHERE name != 'ABC'
  start();
  await prisma.$executeRaw`select * from "Post" where "title" != 'A ab beatae.' LIMIT 50`;
  end("User's posts where title != 'A ab beatae.'");

  //WHERE name LIKE 'ABC%'
  start();
  await prisma.$executeRaw`select * from "Post" where "title" LIKE 'A ab beatae%'`;
  end("User's posts where title LIKE 'A ab beatae%'");

  //IN subselect
  start();
  await prisma.$executeRaw`select * from "Post" where "title" IN ('A ab beatae.', 'A ab beatae delectus.', 'Culpa debitis ut.', 'Molestias ipsum vero.')`;
  end("User's posts where title IN");

  //HAVING
  start();
  await prisma.$executeRaw`select "title", count(*) from "Post" group by "title" having count(*) > 2`;
  end("User's posts group by title having count(*) > 1");
}

main();
