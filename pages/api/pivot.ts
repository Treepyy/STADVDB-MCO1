import { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql2/promise'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { yearRange, publisher } = req.body

    const connection = await mysql.createConnection({
      host: "mysql-53200c2-dlsu-7e2e.c.aivencloud.com",
      port: 21345,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    })

    try {
      const [rows] = await connection.execute(`
        SELECT 
          t.year,
          JSON_UNQUOTE(JSON_EXTRACT(c.publishers, '$[0]')) AS publisher,
          COUNT(DISTINCT gs.game_key) AS games_released
        FROM 
          game_sales gs
        JOIN time t ON gs.time_key = t.time_key
        JOIN creators c ON gs.creators_key = c.creators_key
        WHERE 
          JSON_SEARCH(LOWER(c.publishers), 'one', LOWER(?))
        GROUP BY 
          t.year, publisher
        ORDER BY 
          t.year, games_released DESC;
      `, [`%${publisher}%`])

      res.status(200).json(rows)
    } catch (error) {
      res.status(500).json({ message: 'Error fetching data from database' })
    } finally {
      await connection.end()
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}