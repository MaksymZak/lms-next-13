/**
 * Seed: категории + демо-аккаунты с курсами и прогрессом.
 * Запуск: bun run db:seed
 *
 * Скрипт идемпотентен: демо-данные пересоздаются с нуля при каждом запуске.
 */
import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

import { DEMO_TEACHER, DEMO_STUDENT } from "../lib/demo";

const db = new PrismaClient();

const CATEGORIES = [
  "Computer science",
  "Music",
  "Fitness",
  "Photography",
  "Accounting",
  "Engineering",
  "Filming",
];

// Публичные демо-видео Google (стабильные URL)
const SAMPLE =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample";

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/450`;

const p = (text: string) => `<p>${text}</p>`;

async function createDemoUser(
  demo: { name: string; email: string; password: string },
  role: "teacher" | "student",
) {
  const id = randomUUID();

  await db.user.create({
    data: {
      id,
      name: demo.name,
      email: demo.email,
      emailVerified: true,
      role,
    },
  });

  // Better Auth хранит email/password-аккаунты с providerId "credential"
  await db.account.create({
    data: {
      id: randomUUID(),
      userId: id,
      accountId: id,
      providerId: "credential",
      password: await hashPassword(demo.password),
    },
  });

  return id;
}

async function main() {
  console.log("Seeding categories...");
  for (const name of CATEGORIES) {
    await db.category.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }

  console.log("Recreating demo users...");
  const demoEmails = [DEMO_TEACHER.email, DEMO_STUDENT.email];
  const existing = await db.user.findMany({
    where: { email: { in: demoEmails } },
  });

  for (const user of existing) {
    await db.course.deleteMany({ where: { userId: user.id } });
    await db.purchase.deleteMany({ where: { userId: user.id } });
    await db.userProgress.deleteMany({ where: { userId: user.id } });
    await db.stripeCustomer.deleteMany({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });
  }

  const teacherId = await createDemoUser(DEMO_TEACHER, "teacher");
  const studentId = await createDemoUser(DEMO_STUDENT, "student");

  const categoryByName = async (name: string) => {
    const category = await db.category.findUnique({ where: { name } });
    return category!.id;
  };

  console.log("Creating demo courses...");

  const nextjsCourse = await db.course.create({
    data: {
      userId: teacherId,
      title: "Next.js 14: From Zero to Production",
      description: p(
        "Build modern full-stack applications with the App Router, Server Components and Prisma. This hands-on course takes you from an empty folder to a deployed production app.",
      ),
      imageUrl: img("nextjs-course"),
      price: 49.99,
      isPublished: true,
      categoryId: await categoryByName("Computer science"),
      chapters: {
        create: [
          {
            title: "Introduction & Project Setup",
            description: p(
              "What we are going to build, how the course is structured, and how to set up the development environment.",
            ),
            videoUrl: `${SAMPLE}/BigBuckBunny.mp4`,
            position: 1,
            isPublished: true,
            isFree: true,
          },
          {
            title: "App Router Fundamentals",
            description: p(
              "Layouts, pages, route groups and dynamic segments — everything you need to structure a real application.",
            ),
            videoUrl: `${SAMPLE}/ElephantsDream.mp4`,
            position: 2,
            isPublished: true,
            isFree: false,
          },
          {
            title: "Server Components & Data Fetching",
            description: p(
              "Fetching data with Prisma directly in Server Components, caching and revalidation strategies.",
            ),
            videoUrl: `${SAMPLE}/ForBiggerBlazes.mp4`,
            position: 3,
            isPublished: true,
            isFree: false,
          },
          {
            title: "Deploying to Production",
            description: p(
              "Environment variables, database migrations and zero-downtime deployment.",
            ),
            videoUrl: `${SAMPLE}/ForBiggerEscapes.mp4`,
            position: 4,
            isPublished: true,
            isFree: false,
          },
        ],
      },
    },
  });

  await db.course.create({
    data: {
      userId: teacherId,
      title: "Photography Basics: Shoot Like a Pro",
      description: p(
        "A free introduction to photography: exposure triangle, composition and natural light. No expensive gear required — start with any camera you have.",
      ),
      imageUrl: img("photo-course"),
      price: 0,
      isPublished: true,
      categoryId: await categoryByName("Photography"),
      chapters: {
        create: [
          {
            title: "Understanding Exposure",
            description: p(
              "Aperture, shutter speed and ISO — how the exposure triangle really works.",
            ),
            videoUrl: `${SAMPLE}/ForBiggerFun.mp4`,
            position: 1,
            isPublished: true,
            isFree: true,
          },
          {
            title: "Composition Rules",
            description: p(
              "Rule of thirds, leading lines and framing — make your photos instantly better.",
            ),
            videoUrl: `${SAMPLE}/ForBiggerJoyrides.mp4`,
            position: 2,
            isPublished: true,
            isFree: false,
          },
          {
            title: "Working with Natural Light",
            description: p(
              "Golden hour, window light and simple reflectors for beautiful portraits.",
            ),
            videoUrl: `${SAMPLE}/ForBiggerMeltdowns.mp4`,
            position: 3,
            isPublished: true,
            isFree: false,
          },
        ],
      },
    },
  });

  const musicCourse = await db.course.create({
    data: {
      userId: teacherId,
      title: "Music Theory 101",
      description: p(
        "Notes, scales, chords and rhythm explained simply. Perfect for beginner producers and songwriters.",
      ),
      imageUrl: img("music-course"),
      price: 19.99,
      isPublished: true,
      categoryId: await categoryByName("Music"),
      chapters: {
        create: [
          {
            title: "Notes and the Keyboard",
            description: p(
              "The musical alphabet and how it maps to a piano keyboard.",
            ),
            videoUrl: `${SAMPLE}/Sintel.mp4`,
            position: 1,
            isPublished: true,
            isFree: true,
          },
          {
            title: "Major and Minor Scales",
            description: p("Whole and half steps, building scales in any key."),
            videoUrl: `${SAMPLE}/TearsOfSteel.mp4`,
            position: 2,
            isPublished: true,
            isFree: false,
          },
        ],
      },
    },
  });

  // Черновик — чтобы у демо-учителя был неопубликованный курс в таблице
  await db.course.create({
    data: {
      userId: teacherId,
      title: "Advanced TypeScript Patterns (draft)",
      categoryId: await categoryByName("Computer science"),
    },
  });

  console.log("Creating student purchases and progress...");

  await db.purchase.create({
    data: { userId: studentId, courseId: nextjsCourse.id },
  });
  await db.purchase.create({
    data: { userId: studentId, courseId: musicCourse.id },
  });

  const purchasedChapters = await db.chapter.findMany({
    where: { courseId: nextjsCourse.id, position: { lte: 2 } },
  });

  for (const chapter of purchasedChapters) {
    await db.userProgress.create({
      data: {
        userId: studentId,
        chapterId: chapter.id,
        isCompleted: true,
      },
    });
  }

  console.log("Seed complete.");
  console.log(`  Teacher: ${DEMO_TEACHER.email} / ${DEMO_TEACHER.password}`);
  console.log(`  Student: ${DEMO_STUDENT.email} / ${DEMO_STUDENT.password}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
