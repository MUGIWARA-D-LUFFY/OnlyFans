import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCreators() {
  console.log('\n🔍 Testing Creators API Data Structure\n');
  console.log('='.repeat(80));
  
  const creators = await prisma.creator.findMany({
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          subscriptions: true,
          posts: true,
        },
      },
    },
    take: 2, // Just show 2 for testing
  });

  console.log('\nAPI Response Structure:');
  console.log(JSON.stringify(creators, null, 2));
  
  console.log('\n' + '='.repeat(80));
  console.log('✓ Avatar URLs present:', creators.every(c => c.user.avatarUrl));
  console.log('✓ Cover URLs present:', creators.every(c => c.coverImageUrl));
}

testCreators()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
