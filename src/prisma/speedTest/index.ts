import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query'],
});

let time = new Date();
const start = () => (time = new Date());
// @ts-ignore
const end = () => new Date() - time;

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
  //Get the name of the DB
  console.log(await prisma.$queryRaw`select current_database()`);

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

  //IN array
  start();
  await loopTest("User's posts where title IN", async () => {
    await prisma.$executeRaw`select * from "Post" where "title" IN ('A ab beatae.', 'A ab beatae delectus.', 'Culpa debitis ut.', 'Molestias ipsum vero.')`;
  });

  //IN subselect
  start();
  await loopTest("User's posts where title IN subselect", async () => {
    await prisma.$executeRaw`select * from "Post" where "authorId" IN (select id from "User" where "name" like 'May%')`;
  });

  //HAVING
  start();
  await loopTest(
    "User's posts group by title having count(*) > 1",
    async () => {
      await prisma.$executeRaw`select "title", count(*) from "Post" group by "title" having count(*) > 2`;
    },
  );

  //WHERE multiple field
  start();
  await loopTest('WHERE on multiple fields', async () => {
    await prisma.$executeRaw`select * from "User" 
                              inner join "Post" on "Post"."authorId" = "User".id 
                              inner JOIN "Comment" ON "Post"."id" = "Comment"."postId"
                              \tWHERE "Post"."content" LIKE '%voluptatum%'
                              \tAND "User".email LIKE '%@gmail.com'
                              \tAND "Comment"."content" LIKE '%maxime%'
                              \tAND "User".id BETWEEN 100000 AND 150000
                              \tOR "User"."name" = 'Una'`;
  });
}

main();

//Cache
//IN (Subselect)
//5-6 mezőre vizsgálat, stb...
//Indexelt string mezők
//~15% hogyan változik a teljesítmény, több / kevesebb rekorddal
//Postgre tud-e? varchar() -> a rövid mezők varchar, a hosszúak string
//Postgre specifikáció varchar max méret? (10_485_760)
