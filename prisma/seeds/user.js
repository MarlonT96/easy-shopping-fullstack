const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function usersSeed() {
  return new Promise(async (resolve) => {
    const superAdminData = {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'super_admin@gmail.com',
      username: 'superadmin',
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
    }

    const superAdmin = await prisma.user.create({
      data: superAdminData,
    })

    const superAdminRole = await prisma.role.findFirst({
      where: { name: 'Super Admin' },
    })

    await prisma.generalUser.create({
      data: {
        userId: superAdmin.id,
        roleId: superAdminRole.id,
      },
    })

    console.log('1 user seeded')
    resolve()
  })
}

module.exports = usersSeed
