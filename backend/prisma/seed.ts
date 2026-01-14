import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Realistic fan-style comment templates
const commentTemplates = [
  '🔥🔥🔥',
  'So beautiful 😍',
  'Worth every penny',
  'Queen 👑',
  'This is my favorite so far',
  'Absolutely stunning',
  "Can't wait for more 💕",
  'You never disappoint',
  'Perfect vibes ✨',
  'OMG yesss 🙌',
  'Best content ever!',
  'Subscribed and never looking back',
  'This made my day 💖',
  'Goals 😩🔥',
  'How are you so perfect?',
  'Take my money 💸',
  'Instant like ❤️',
  'More of this please!',
  'Obsessed with you',
  'Pure perfection ✨',
];

async function main() {
  console.log('Starting database seeding...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@platform.com' },
    update: {},
    create: {
      email: 'admin@platform.com',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      ageVerified: true,
    },
  });
  console.log('✓ Created admin user');

  // Create Regular Users
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        username: `user${i}`,
        password: hashedPassword,
        role: 'USER',
        ageVerified: true,
        avatarUrl: `https://i.pravatar.cc/150?img=${20 + i}`,
      },
    });
    users.push(user);
  }
  console.log('✓ Created 10 regular users');

  // Create Creator Users with Creator profiles
  const creatorData = [
    {
      email: 'sophia@creators.com',
      username: 'sophia_belle',
      bio: 'Fashion & Lifestyle Content Creator ✨ | Exclusive photos & videos | New content daily',
      subscriptionFee: 9.99,
      verified: true,
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      coverImageUrl: 'https://picsum.photos/seed/sophia-cover/1200/300',
    },
    {
      email: 'emma@creators.com',
      username: 'emma_rose',
      bio: 'Fitness & Wellness | Premium workout content | Behind the scenes access',
      subscriptionFee: 14.99,
      verified: true,
      avatarUrl: 'https://i.pravatar.cc/150?img=5',
      coverImageUrl: 'https://picsum.photos/seed/emma-cover/1200/300',
    },
    {
      email: 'olivia@creators.com',
      username: 'olivia_jade',
      bio: 'Art & Photography | Exclusive photoshoots | Personal messages welcome',
      subscriptionFee: 12.99,
      verified: true,
      avatarUrl: 'https://i.pravatar.cc/150?img=9',
      coverImageUrl: 'https://picsum.photos/seed/olivia-cover/1200/300',
    },
    {
      email: 'mia@creators.com',
      username: 'mia_luna',
      bio: 'Travel & Adventure | Exotic locations | Subscribe for exclusive content',
      subscriptionFee: 11.99,
      verified: false,
      avatarUrl: 'https://i.pravatar.cc/150?img=16',
      coverImageUrl: 'https://picsum.photos/seed/mia-cover/1200/300',
    },
    {
      email: 'isabella@creators.com',
      username: 'bella_rose',
      bio: 'Beauty & Fashion | Tutorials & Tips | VIP access to premium content',
      subscriptionFee: 8.99,
      verified: true,
      avatarUrl: 'https://i.pravatar.cc/150?img=20',
      coverImageUrl: 'https://picsum.photos/seed/bella-cover/1200/300',
    },
  ];

  const creators = [];
  for (const data of creatorData) {
    const creatorUser = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        role: 'CREATOR',
        ageVerified: true,
        avatarUrl: data.avatarUrl,
      },
    });

    const creator = await prisma.creator.upsert({
      where: { userId: creatorUser.id },
      update: {},
      create: {
        userId: creatorUser.id,
        bio: data.bio,
        subscriptionFee: data.subscriptionFee,
        verified: data.verified,
        verificationDate: data.verified ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000) : null,
        coverImageUrl: data.coverImageUrl,
      },
    });

    creators.push({ user: creatorUser, creator });
  }
  console.log('✓ Created 5 creators with profiles');

  // Create Posts for each creator
  const postTitles = [
    'Good morning vibes ☀️',
    'New exclusive content just for you',
    'Behind the scenes',
    'Premium access only',
    'Special surprise for subscribers',
    'Weekend special',
    'VIP content unlocked',
    'Just for my fans 💕',
    'Exclusive photoshoot',
    'Limited time offer',
    'My latest adventure ✈️',
    'Something special for you all',
    'Can you handle this? 🔥',
    'Late night vibes 🌙',
    'Your favorite content creator 💋',
  ];

  const visibilityOptions = ['PUBLIC', 'SUBSCRIBERS', 'PAID'] as const;

  const postCount = await prisma.post.count();
  if (postCount === 0) {
    for (const { creator } of creators) {
      // Create 8-12 posts per creator
      const numPosts = Math.floor(Math.random() * 5) + 8;
      for (let i = 0; i < numPosts; i++) {
        const isPaid = Math.random() > 0.6;
        const visibility = isPaid ? 'PAID' : (Math.random() > 0.5 ? 'SUBSCRIBERS' : 'PUBLIC');

        await prisma.post.create({
          data: {
            creatorId: creator.id,
            title: postTitles[Math.floor(Math.random() * postTitles.length)],
            mediaUrl: `https://picsum.photos/seed/${creator.id}-${i}/800/600`,
            previewUrl: `https://picsum.photos/seed/blur-${creator.id}-${i}/400/300`,
            mediaType: Math.random() > 0.3 ? 'image' : 'video',
            isPaid,
            price: isPaid ? parseFloat((Math.random() * 20 + 5).toFixed(2)) : null,
            visibility,
            views: 0,
            likeCount: 0,
            commentCount: 0,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
    console.log('✓ Created posts for all creators');
  }

  // Add engagement data (views, likes, comments)
  console.log('Adding engagement data...');
  const allPosts = await prisma.post.findMany();

  // Clear existing likes and comments for clean seeding
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();

  for (const post of allPosts) {
    // Random engagement scale based on OnlyFans-like metrics
    const views = Math.floor(Math.random() * 8000) + 500;
    const likes = Math.floor(views * (Math.random() * 0.15 + 0.05)); // 5-20% of views
    const commentsCount = Math.floor(likes * (Math.random() * 0.3)); // Up to 30% of likes

    // Update post counters
    await prisma.post.update({
      where: { id: post.id },
      data: {
        views,
        likeCount: likes,
        commentCount: commentsCount,
      },
    });

    // Create Like rows (real users)
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
    const likesToCreate = Math.min(likes, shuffledUsers.length);

    for (let i = 0; i < likesToCreate; i++) {
      try {
        await prisma.like.create({
          data: {
            userId: shuffledUsers[i].id,
            postId: post.id,
          },
        });
      } catch {
        // Ignore duplicate key errors
      }
    }

    // Create comments
    const commentsToCreate = Math.min(commentsCount, 20); // Cap at 20 comments per post for seeding
    for (let i = 0; i < commentsToCreate; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      await prisma.comment.create({
        data: {
          userId: randomUser.id,
          postId: post.id,
          content: commentTemplates[Math.floor(Math.random() * commentTemplates.length)],
          createdAt: new Date(
            Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000
          ),
        },
      });
    }
  }
  console.log('✓ Added likes, comments, views to all posts');

  // Create Follow relationships
  console.log('Creating follow relationships...');
  await prisma.follow.deleteMany();

  for (const user of users) {
    // Each user follows 2-4 random creators
    const numFollows = Math.floor(Math.random() * 3) + 2;
    const shuffledCreators = [...creators].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numFollows && i < shuffledCreators.length; i++) {
      try {
        await prisma.follow.create({
          data: {
            followerId: user.id,
            creatorId: shuffledCreators[i].user.id,
            createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
          },
        });
      } catch {
        // Ignore duplicate key errors
      }
    }
  }
  console.log('✓ Created follow relationships');

  // Create Subscriptions (users subscribing to creators)
  const subscriptionCount = await prisma.subscription.count();
  if (subscriptionCount === 0) {
    for (const user of users) {
      // Each user subscribes to 1-3 random creators
      const numSubscriptions = Math.floor(Math.random() * 3) + 1;
      const shuffledCreators = [...creators].sort(() => Math.random() - 0.5);

      for (let i = 0; i < numSubscriptions && i < shuffledCreators.length; i++) {
        const { creator } = shuffledCreators[i];
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

        await prisma.subscription.create({
          data: {
            userId: user.id,
            creatorId: creator.id,
            expiresAt,
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
    console.log('✓ Created subscriptions');
  }

  // Create/Update CreatorStats
  console.log('Calculating creator stats...');
  await prisma.creatorStats.deleteMany();

  for (const { creator } of creators) {
    const posts = await prisma.post.findMany({
      where: { creatorId: creator.id },
    });

    const totalLikes = posts.reduce((sum, p) => sum + p.likeCount, 0);
    const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
    const subscribers = await prisma.subscription.count({
      where: { creatorId: creator.id },
    });

    await prisma.creatorStats.create({
      data: {
        creatorId: creator.id,
        totalLikes,
        totalPosts: posts.length,
        totalViews,
        subscribers,
      },
    });
  }
  console.log('✓ Created creator stats');

  // Create Transactions
  const transactionCount = await prisma.transaction.count();
  if (transactionCount === 0) {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        creator: true,
      },
    });

    for (const subscription of subscriptions) {
      await prisma.transaction.create({
        data: {
          userId: subscription.userId,
          creatorId: subscription.creatorId,
          amount: subscription.creator.subscriptionFee,
          type: 'SUBSCRIPTION',
          status: 'completed',
          metadata: JSON.stringify({
            subscriptionId: subscription.id,
            duration: '30 days',
          }),
        },
      });
    }

    // Add some PPV and TIP transactions
    for (let i = 0; i < 15; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomCreator = creators[Math.floor(Math.random() * creators.length)];
      const type = Math.random() > 0.5 ? 'PPV' : 'TIP';
      const amount = type === 'TIP'
        ? parseFloat((Math.random() * 50 + 5).toFixed(2))
        : parseFloat((Math.random() * 20 + 10).toFixed(2));

      await prisma.transaction.create({
        data: {
          userId: randomUser.id,
          creatorId: randomCreator.creator.id,
          amount,
          type,
          status: 'completed',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
    console.log('✓ Created transactions');
  }

  // Create Messages
  const messageCount = await prisma.message.count();
  if (messageCount === 0) {
    const messageTemplates = [
      'Hey! Love your content 😊',
      'Can you send me exclusive content?',
      'Thanks for the amazing posts!',
      'When will you post new content?',
      'Your latest post was incredible!',
      'Would love to see more of your work',
      'Keep up the great content!',
      'Can we chat?',
    ];

    for (const user of users) {
      // Each user sends 2-4 messages to random creators
      const numMessages = Math.floor(Math.random() * 3) + 2;
      const shuffledCreators = [...creators].sort(() => Math.random() - 0.5);

      for (let i = 0; i < numMessages && i < shuffledCreators.length; i++) {
        const isPaid = Math.random() > 0.7;
        await prisma.message.create({
          data: {
            senderId: user.id,
            receiverId: shuffledCreators[i].user.id,
            content: messageTemplates[Math.floor(Math.random() * messageTemplates.length)],
            isPaid,
            price: isPaid ? parseFloat((Math.random() * 10 + 5).toFixed(2)) : null,
            isRead: Math.random() > 0.5,
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
    console.log('✓ Created messages');
  }

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`   Users: ${await prisma.user.count()}`);
  console.log(`   Creators: ${await prisma.creator.count()}`);
  console.log(`   Posts: ${await prisma.post.count()}`);
  console.log(`   Likes: ${await prisma.like.count()}`);
  console.log(`   Comments: ${await prisma.comment.count()}`);
  console.log(`   Follows: ${await prisma.follow.count()}`);
  console.log(`   Subscriptions: ${await prisma.subscription.count()}`);
  console.log(`   Transactions: ${await prisma.transaction.count()}`);
  console.log(`   Messages: ${await prisma.message.count()}`);
  console.log(`   Creator Stats: ${await prisma.creatorStats.count()}`);
  console.log('\n🔑 Login credentials (all users):');
  console.log('   Password: password123');
  console.log('   Admin: admin@platform.com');
  console.log('   Creators: sophia@creators.com, emma@creators.com, olivia@creators.com, mia@creators.com, isabella@creators.com');
  console.log('   Users: user1@example.com through user10@example.com');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

