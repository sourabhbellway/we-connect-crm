
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = `test_force_pwd_${Date.now()}@example.com`;
    const password = 'Password123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Creating user ${email}...`);

    // 1. Create user directly in DB (simulating UserService.create)
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            firstName: 'Test',
            lastName: 'User',
            mustChangePassword: true, // Explicitly setting it
            isActive: true,
            emailVerified: true
        }
    });

    console.log('User created:', user.id, 'mustChangePassword:', user.mustChangePassword);

    // 2. Simulate Login (fetching user as AuthService does)
    const fetchedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            id: true,
            email: true,
            mustChangePassword: true
        }
    });

    console.log('Fetched user on login:', fetchedUser);

    if (fetchedUser?.mustChangePassword === true) {
        console.log('SUCCESS: mustChangePassword is TRUE');
    } else {
        console.error('FAILURE: mustChangePassword is NOT TRUE');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
