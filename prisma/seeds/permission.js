const { PrismaClient } = require('@prisma/client')
const csv = require('csv-parser')
const fs = require('fs')

const prisma = new PrismaClient()

async function permissionsSeed() {
  const rowsData = []
  const readStream = fs.createReadStream('documents/permissions.csv', 'utf8')

  return new Promise((resolve) =>
    readStream
      .pipe(csv())
      .on('data', async (data) => {
        rowsData.push(data)
      })
      .on('end', async () => {
        await prisma.permission.createMany({
          data: rowsData,
        })

        console.log(`${rowsData.length} permissions seeded`)
        resolve()
      })
  )
}

module.exports = permissionsSeed
