import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProfileImages() {
  console.log('Updating profile images for existing creators...\n');

  const updates = [
    {
      email: 'sophia@creators.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      coverImageUrl: 'https://picsum.photos/seed/sophia-cover/1200/300',
    },
    {
      email: 'emma@creators.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=5',
      coverImageUrl: 'https://picsum.photos/seed/emma-cover/1200/300',
    },
    {
      email: 'olivia@creators.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=9',
      coverImageUrl: 'https://picsum.photos/seed/olivia-cover/1200/300',
    },
    {
      email: 'mia@creators.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=16',
      coverImageUrl: 'https://picsum.photos/seed/mia-cover/1200/300',
    },
    {
      email: 'isabella@creators.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=20',
      coverImageUrl: 'https://picsum.photos/seed/bella-cover/1200/300',
    },
  ];

  for (const update of updates) {
    const user = await prisma.user.findUnique({
      where: { email: update.email },
      include: { creator: true },
    });

    if (user) {
      // Update user avatar
      await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: update.avatarUrl },
      });

      // Update creator cover image
      if (user.creator) {
        await prisma.creator.update({
          where: { id: user.creator.id },
          data: { coverImageUrl: update.coverImageUrl },
        });
      }

      console.log(`✓ Updated ${user.username} - Avatar & Cover`);
    }
  }

  console.log('\n✅ All profile images updated successfully!');
}

updateProfileImages()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
