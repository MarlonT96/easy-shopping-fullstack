const { PrismaClient } = require('@prisma/client')
const csv = require('csv-parser')
const fs = require('fs')

const prisma = new PrismaClient()

async function sectionsSeed() {
  const rowsData = []
  const departmentIds = new Map(
    (
      await prisma.department.findMany({
        select: { id: true, code: true },
      })
    ).map((d) => [d.code, d.id])
  )

  const readStream = fs.createReadStream('documents/sections.csv', 'utf8')
  return new Promise(async (resolve) => {
    return readStream
      .pipe(csv())
      .on('data', ({ code, name }) => {
        const depCode = code.substring(0, 2)
        const departmentId = departmentIds.get(depCode)
        rowsData.push({
          code,
          name,
          departmentId,
        })
      })
      .on('end', async () => {
        await prisma.section.createMany({ data: rowsData })
        await console.log(`${rowsData.length} sections seeded`)
        resolve()
      })
  })
}

module.exports = sectionsSeed
