import { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql2/promise'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { yearRange, preset } = req.body

    let startYear, endYear
    if (preset === 'last_5') {
      startYear = 2018
      endYear = 2025
    } else if (preset === 'last_10') {
      startYear = 2013
      endYear = 2025
    } else {
      [startYear, endYear] = yearRange
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: 21345,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    })

    try {
      const [rows] = await connection.execute(`
        SELECT 
          t.year,
          AVG(CASE WHEN g.mc_score > 0 THEN g.mc_score END) AS avg_mc_score,
          AVG(gs.positive_reviews) AS avg_positive_reviews,
          AVG(gs.negative_reviews) AS avg_negative_reviews
        FROM 
          game_sales gs
        JOIN game g ON gs.game_key = g.game_key
        JOIN time t ON gs.time_key = t.time_key
        WHERE
          t.year BETWEEN ? AND ?
        GROUP BY 
          t.year
        ORDER BY 
          t.year;
      `, [startYear, endYear])

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