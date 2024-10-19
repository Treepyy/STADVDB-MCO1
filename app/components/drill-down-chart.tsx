'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export default function DrillDownChart() {
  const [data, setData] = useState([])
  const [year, setYear] = useState(2024)
  const [metric, setMetric] = useState('both')

  useEffect(() => {
    fetchData()
  }, [year, metric])

  const fetchData = async () => {
    const response = await fetch('/api/drill-down', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ year }),
    })
    const result = await response.json()
    const formattedData = result.map((item: { month: number; avg_playtime: string }) => ({
      ...item,
      monthName: monthNames[item.month - 1],
      avg_playtime: parseFloat(item.avg_playtime).toFixed(2)
    }))
    setData(formattedData)
  }

  const currentYear = new Date().getFullYear()

  return (
    <Card>
      <CardHeader>
        <CardTitle><i><center>This query drills down from yearly data to monthly data for a specific year, showing either the number of games released or their average playtime.</center></i></CardTitle>
        <hr/><br/>
        <CardTitle>{metric === 'both' ? 'Monthly Games Released and Average Playtime' : metric === 'games_released' ? 'Monthly Games Released' : 'Average Playtime'} ({year})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <Slider
              min={1997}
              max={currentYear + 1}
              step={1}
              value={[year]}
              onValueChange={(value) => setYear(value[0])}
              className="w-full"
            />
            <div className="flex justify-between mt-1">
              <span>1997</span>
              <span>{currentYear + 1}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
            <RadioGroup value={metric} onValueChange={setMetric}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both">Both</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="games_released" id="games_released" />
                <Label htmlFor="games_released">Games Released</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="avg_playtime" id="avg_playtime" />
                <Label htmlFor="avg_playtime">Average Playtime</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="monthName" />
            <YAxis yAxisId="left" />
            {metric === 'both' && <YAxis yAxisId="right" orientation="right" />}
            <Tooltip 
              labelFormatter={(value) => `Month: ${value}`}
              formatter={(value, name) => [value, name]}
            />
            <Legend />
            {(metric === 'games_released' || metric === 'both') && (
              <Bar 
                yAxisId="left"
                dataKey="games_released" 
                fill="#8884d8" 
                name="Games Released" 
              />
            )}
            {(metric === 'avg_playtime' || metric === 'both') && (
              <Bar 
                yAxisId={metric === 'both' ? "right" : "left"}
                dataKey="avg_playtime" 
                fill="#82ca9d" 
                name="Average Playtime (Hours)" 
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}