'use client'

import { useState, useEffect, SetStateAction } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function RollUpChart() {
  const [data, setData] = useState([])
  const [yearRange, setYearRange] = useState([2010, 2025])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [yearRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/roll-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({yearRange}),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleYearRangeChange = (newRange: SetStateAction<number[]>) => {
    setYearRange(newRange)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle><i><center>
          This query rolls up the average positive and negative review count and metacritic score from individual games to the year level.
          </center></i></CardTitle>
        <hr/><br/>
        <CardTitle>Yearly Average Metacritic Score, Positive Reviews, and Negative Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year Range</label>
            <Slider
              min={1997}
              max={2025}
              step={1}
              value={yearRange}
              onValueChange={handleYearRangeChange}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-sm text-gray-600">
              <span>{yearRange[0]}</span>
              <span>{yearRange[1]}</span>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <p>Loading...</p>
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="avg_positive_reviews" fill="#8884d8" name="Average Positive Reviews" />
            <Bar yAxisId="left" dataKey="avg_negative_reviews" fill="#82ca9d" name="Average Negative Reviews" />
            <Line yAxisId="right" type="monotone" dataKey="avg_mc_score" stroke="#ff7300" name="Avg Metacritic Score" />
          </ComposedChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}