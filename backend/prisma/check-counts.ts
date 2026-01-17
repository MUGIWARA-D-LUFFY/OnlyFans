import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        const creatorCount = await prisma.creator.count();
        const postCount = await prisma.post.count();

        console.log('\n--- Updated Database Counts ---');
        console.log(`Users: ${userCount}`);
        console.log(`Creators: ${creatorCount}`);
        console.log(`Posts: ${postCount}`);
        console.log('-------------------------------\n');
    } catch (error) {
        console.error('Error fetching counts:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
