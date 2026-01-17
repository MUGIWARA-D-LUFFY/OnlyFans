import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const firstNames = [
    'Aria', 'Chloe', 'Scarlett', 'Zoey', 'Luna',
    'Bella', 'Aurora', 'Savannah', 'Brooklyn', 'Paisley',
    'Skylar', 'Violet', 'Everly', 'Nova', 'Hazel',
    'Lily', 'Riley', 'Ellie', 'Nora', 'Camila',
    'Penelope', 'Layla', 'Madelyn', 'Addison', 'Grace'
];

const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
    'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris'
];

const bioTemplates = [
    'Exclusive content just for you ✨',
    'Welcome to my world 💋',
    'Daily uploads & personal chat 💖',
    'Your favorite content creator 🔥',
    'Subscribe for VIP access 👑',
    'Fitness model & lifestyle vlogger 🏋️‍♀️',
    'Cosplay & gaming 🎮',
    'Artistic vibes & photos 📸',
    'Travel with me ✈️',
    'Behind the scenes footage 🎥'
];

const postTitles = [
    'Morning sunshine ☀️',
    'Workout done 💪',
    'Exclusive set preview',
    'Feeling cute today',
    'Check your DMs 👀',
    'Special treat for subs',
    'Late night thoughts 🌙',
    'New outfit check 👗',
    'Sunday funday',
    'Just for you ❤️'
];

async function main() {
    console.log('Seeding 25 more creators...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (let i = 0; i < 25; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Math.floor(Math.random() * 1000)}`;
        const email = `${username}@example.com`;

        // Create User
        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                username,
                password: hashedPassword,
                role: 'CREATOR',
                ageVerified: true,
                avatarUrl: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`, // Random avatar
            },
        });

        // Create Creator Profile
        const isVerified = Math.random() > 0.3; // 70% chance of verification
        const creator = await prisma.creator.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                bio: bioTemplates[Math.floor(Math.random() * bioTemplates.length)],
                subscriptionFee: parseFloat((Math.random() * 20 + 5).toFixed(2)),
                verified: isVerified,
                verificationDate: isVerified ? new Date() : null,
                coverImageUrl: `https://picsum.photos/seed/${username}/1200/300`,
            },
        });

        console.log(`Created creator: ${username}`);

        // Create Posts for this creator
        const numPosts = Math.floor(Math.random() * 5) + 5; // 5-10 posts
        for (let j = 0; j < numPosts; j++) {
            const isPaid = Math.random() > 0.7;
            await prisma.post.create({
                data: {
                    creatorId: creator.id,
                    title: postTitles[Math.floor(Math.random() * postTitles.length)],
                    mediaUrl: `https://picsum.photos/seed/${username}-${j}/800/600`, // Placeholder image
                    mediaType: 'image',
                    isPaid,
                    price: isPaid ? parseFloat((Math.random() * 10 + 5).toFixed(2)) : null,
                    visibility: isPaid ? 'PAID' : 'PUBLIC',
                    views: Math.floor(Math.random() * 1000),
                    likeCount: Math.floor(Math.random() * 200),
                    commentCount: Math.floor(Math.random() * 20),
                },
            });
        }
    }

    console.log('Done! Added 25 creators with posts.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
