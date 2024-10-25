'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Platform = 'windows' | 'mac' | 'linux'
type Platforms = Record<Platform, boolean>

interface GameData {
  genre: string | null
  review_range: string
  game_count: number
}

interface ProcessedGameData {
  genre: string
  [key: string]: string | number
}

export default function SliceDiceChart() {
  const [data, setData] = useState<ProcessedGameData[]>([])
  const [platforms, setPlatforms] = useState<Platforms>({
    windows: true,
    mac: false,
    linux: false
  })

  useEffect(() => {
    fetchData()
  }, [platforms])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/slice-dice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platforms }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const result: GameData[] = await response.json()
      
      const processedData = result.reduce<ProcessedGameData[]>((acc, item) => {
        const genreName = item.genre === null ? "(No Genre)" : item.genre
        const existingGenre = acc.find(d => d.genre === genreName)
        if (existingGenre) {
          existingGenre[item.review_range] = item.game_count
        } else {
          acc.push({
            genre: genreName,
            [item.review_range]: item.game_count
          })
        }
        return acc
      }, [])

      setData(processedData)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handlePlatformChange = (platform: Platform) => {
    setPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }))
  }

  const reviewRanges = [
    "Under 100 reviews",
    "100 - 999 reviews",
    "1000 reviews and above"
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle><i><center>This query will slice data to include only games for the selected availability (Windows, Mac, Linux) and dices it by game genre and review counts.</center></i></CardTitle>
        <hr/><br/>
        <CardTitle>Game Distribution by Genre and Review Range</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          {(Object.keys(platforms) as Platform[]).map((platform) => (
            <div key={platform} className="flex items-center space-x-2">
              <Checkbox
                id={platform}
                checked={platforms[platform]}
                onCheckedChange={() => handlePlatformChange(platform)}
              />
              <Label htmlFor={platform}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</Label>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={1000}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="genre" type="category" width={150} />
            <Tooltip />
            <Legend />
            {reviewRanges.map((range, index) => (
              <Bar 
                key={range} 
                dataKey={range} 
                stackId="a" 
                fill={`hsl(${index * 120}, 70%, 50%)`} 
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}