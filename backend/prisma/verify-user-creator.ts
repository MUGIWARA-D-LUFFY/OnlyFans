
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userId = 'aa0a0652-158f-4d57-bfa8-02fc902e7a37'; // ID from user logs

    console.log(`Checking user: ${userId}`);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            creator: true
        }
    });

    if (!user) {
        console.log('User not found!');
    } else {
        console.log('User found:');
        console.log(`- Username: ${user.username}`);
        console.log(`- Role: ${user.role}`);
        console.log(`- Creator Profile:`, user.creator);

        if (user.role === 'CREATOR' && !user.creator) {
            console.error('CRITICAL: User has CREATOR role but no Creator profile record!');
            // Attempt to fix it?
            // For now, just report.
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
