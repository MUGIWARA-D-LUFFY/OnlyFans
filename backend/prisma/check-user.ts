import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const username = 'mohana_sri'; // Based on the screenshot
    // OR search by partial match if not exact
    const user = await prisma.user.findFirst({
        where: { username: { contains: 'mohana', mode: 'insensitive' } },
        include: { creator: true }
    });

    if (user) {
        console.log('User found:', user.username);
        console.log('Avatar URL:', user.avatarUrl);
        console.log('Creator Profile:', user.creator);
    } else {
        console.log('User not found');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
