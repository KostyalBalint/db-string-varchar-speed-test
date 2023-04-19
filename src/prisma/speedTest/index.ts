import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query'],
});

let time = new Date();
const start = () => (time = new Date());
// @ts-ignore
const end = (msg?: string) => new Date() - time;

const loopTest = async (msg: string, callback: () => Promise<void>) => {
  const times = [];
  for (let i = 0; i < 5; i++) {
    start();
    await callback();
    times.push(end());
  }
  console.log(`${msg};${times.join('; ')}`);
};

async function main() {
  await loopTest("User's posts total count query", async () => {
    await prisma.$executeRaw`select count(*) from "Post" inner join "User" on "Post"."authorId" = "User".id`;
  });

  //ORDER BY name ASC/DESC
  start();
  await loopTest("User's posts order by title asc LIMIT 50", async () => {
    await prisma.$executeRaw`select * from "Post" order by "title" asc LIMIT 50`;
  });

  //WHERE name = 'ABC
  start();
  await loopTest("User's posts where title = 'A ab beatae.'", async () => {
    await prisma.$executeRaw`select * from "Post" where "title" = 'A ab beatae.'`;
  });

  //WHERE name != 'ABC'
  start();
  await loopTest("User's posts where title != 'A ab beatae.'", async () => {
    await prisma.$executeRaw`select * from "Post" where "title" != 'A ab beatae.' LIMIT 50`;
  });

  //WHERE name LIKE 'ABC%'
  start();
  await loopTest("User's posts where title LIKE 'A ab beatae%'", async () => {
    await prisma.$executeRaw`select * from "Post" where "title" LIKE 'A ab beatae%'`;
  });

  //IN subselect
  start();
  await loopTest("User's posts where title IN", async () => {
    await prisma.$executeRaw`select * from "Post" where "title" IN ('A ab beatae.', 'A ab beatae delectus.', 'Culpa debitis ut.', 'Molestias ipsum vero.')`;
  });

  //HAVING
  start();
  await loopTest(
    "User's posts group by title having count(*) > 1",
    async () => {
      await prisma.$executeRaw`select "title", count(*) from "Post" group by "title" having count(*) > 2`;
    },
  );
}

main();

//Cache
//IN (Subselect)
//5-6 mezőre vizsgálat, stb...
//~15% hogyan változik a teljesítmény, több / kevesebb rekorddal
//Indexelt string mezők
//Postgre tud-e? varchar() -> a rövid mezők varchar, a hosszúak string
//Postgre specifikáció varchar max méret?
