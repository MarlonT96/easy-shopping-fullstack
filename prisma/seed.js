const { PrismaClient } = require('@prisma/client')
const departmentsSeed = require('./seeds/department')
const permissionsSeed = require('./seeds/permission')
const rolesSeed = require('./seeds/role')
const sectionsSeed = require('./seeds/section')
const usersSeed = require('./seeds/user')

const prisma = new PrismaClient()

async function seed() {
  await prisma.permission.deleteMany()
  await prisma.role.deleteMany()
  await prisma.user.deleteMany()
  await prisma.department.deleteMany()
  await prisma.section.deleteMany()

  await permissionsSeed()
  await rolesSeed()
  await usersSeed()
  await departmentsSeed()
  await sectionsSeed()

  console.log(`Database has been seeded. 🌱`)
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
