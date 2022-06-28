const { PrismaClient } = require('@prisma/client')
const csv = require('csv-parser')
const fs = require('fs')

const prisma = new PrismaClient()

async function rolesSeed() {
  const roleNames = ['Super Admin', 'Store Admin', 'Employee', 'Client']
  const rolePermissionIds = new Map(roleNames.map((r) => [r, []]))
  const readStream = fs.createReadStream(
    'documents/rolePermissions.csv',
    'utf8'
  )

  return new Promise((resolve) =>
    readStream
      .pipe(csv())
      .on('data', async (row) => {
        for (const name of roleNames) {
          if (row[name] === 'X') {
            const permissions = rolePermissionIds.get(name)

            if (permissions.length) {
              rolePermissionIds.set(name, [...permissions, row.id])
            } else {
              rolePermissionIds.set(name, [row.id])
            }
          }
        }
      })
      .on('end', async () => {
        for (const [name, permissionIds] of rolePermissionIds.entries()) {
          const newRole = await prisma.role.create({
            data: {
              name,
              description: `Default role for ${name}`,
            },
          })

          for (const permissionId of permissionIds) {
            await prisma.rolePermissions.create({
              data: {
                roleId: newRole.id,
                permissionId,
              },
            })
          }
        }

        console.log(`${roleNames.length} roles seeded`)
        resolve()
      })
  )
}

module.exports = rolesSeed
