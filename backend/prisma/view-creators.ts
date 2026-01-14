import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function viewCreators() {
  const creators = await prisma.creator.findMany({
    include: {
      user: {
        select: {
          username: true,
          email: true,
        },
      },
      _count: {
        select: {
          posts: true,
          subscriptions: true,
        },
      },
    },
  });

  console.log('\n📸 CREATORS LIST\n');
  console.log('='.repeat(80));
  
  creators.forEach((creator, index) => {
    console.log(`\n${index + 1}. @${creator.user.username}`);
    console.log(`   Email: ${creator.user.email}`);
    console.log(`   Bio: ${creator.bio}`);
    console.log(`   Subscription Fee: $${creator.subscriptionFee}/month`);
    console.log(`   Verified: ${creator.verified ? '✓' : '✗'}`);
    console.log(`   Posts: ${creator._count.posts}`);
    console.log(`   Subscribers: ${creator._count.subscriptions}`);
  });
  
  console.log('\n' + '='.repeat(80) + '\n');
}

viewCreators()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
