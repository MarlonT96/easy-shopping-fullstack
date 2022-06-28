const { PrismaClient } = require('@prisma/client')
const csv = require('csv-parser')
const fs = require('fs')

const prisma = new PrismaClient()

async function departmentsSeed() {
  const rowsData = []
  const readStream = fs.createReadStream('documents/departments.csv', 'utf8')
  return new Promise((resolve) =>
    readStream
      .pipe(csv())
      .on('data', async (data) => {
        rowsData.push(data)
      })
      .on('end', async () => {
        await prisma.department.createMany({ data: rowsData })
        console.log(`${rowsData.length} departments seeded`)
        resolve()
      })
  )
}

module.exports = departmentsSeed
