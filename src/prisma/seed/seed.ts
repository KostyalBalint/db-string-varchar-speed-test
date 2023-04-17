import { PrismaClient, User, Post, Comment } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

function createRandomUser(): Omit<User, 'id'> {
  return {
    name: faker.name.firstName(),
    email: faker.internet.email(),
  };
}

async function seedUsers(count: number) {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(createRandomUser());
    if (i % 1000 === 0) {
      await prisma.user.createMany({
        data: users,
      });
      users.length = 0;
    }
  }
  await prisma.user.createMany({
    data: users,
  });
}

async function seedPosts(postsPerUser: number) {
  const userCount = await prisma.user.count({});

  for (let i = 0; i < userCount / 10_000; i++) {
    const users = await prisma.user.findMany({
      skip: i * 10_000,
      take: 10_000,
    });
    const posts: Omit<Post, 'id'>[] = [];
    for (const user of users) {
      for (let i = 0; i < postsPerUser; i++) {
        posts.push({
          authorId: user.id,
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraph().substring(0, 255),
        });
      }
    }
    await prisma.post.createMany({
      data: posts,
    });
  }
}

async function seedComments(commentPerPost: number) {
  const postCount = await prisma.post.count({});

  for (let i = 0; i < postCount / 10_000; i++) {
    const posts = await prisma.post.findMany({
      skip: i * 10_000,
      take: 10_000,
    });
    const comments: Omit<Comment, 'id'>[] = [];
    for (const post of posts) {
      for (let i = 0; i < commentPerPost; i++) {
        comments.push({
          postId: post.id,
          content: faker.lorem.sentence(),
        });
      }
    }
    await prisma.comment.createMany({
      data: comments,
    });
  }
}

async function main() {
  console.log('Start seeding ...');

  await seedUsers(100_000);
  console.log('🔥 Users seeded, took: ');

  await seedPosts(20);
  console.log('🔥 Posts seeded, took: ');

  await seedComments(5);
  console.log('🔥 Comments seeded: ');

  console.log('🔥 Seeding finished');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
