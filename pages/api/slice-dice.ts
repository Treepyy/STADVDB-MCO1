import { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql2/promise'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { platforms } = req.body

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
          JSON_UNQUOTE(JSON_EXTRACT(c.genres, '$[0]')) AS genre,
          CASE 
            WHEN gs.positive_reviews < 100 THEN 'Under 100 reviews'
            WHEN gs.positive_reviews >= 100 AND gs.positive_reviews < 1000 THEN '100 - 999 reviews'
            ELSE '1000 reviews and above'
          END AS review_range,
          COUNT(*) AS game_count
        FROM 
          game_sales gs
        JOIN classifications c ON gs.class_key = c.class_key
        JOIN creators cr ON gs.creators_key = cr.creators_key
        JOIN availability a ON gs.avail_key = a.avail_key
        WHERE 
          a.windows = ? AND a.mac = ? AND a.linux = ?
        GROUP BY 
          genre, review_range
        ORDER BY 
          genre, review_range;
      `, [platforms.windows, platforms.mac, platforms.linux])

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