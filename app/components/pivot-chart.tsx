'use client'

import { useState, useEffect, SetStateAction } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function PivotChart() {
  const [data, setData] = useState([])
  const [publisher, setPublisher] = useState('Valve')
  const [inputPublisher, setInputPublisher] = useState('Valve')

  useEffect(() => {
    fetchData()
  }, [publisher])

  const fetchData = async () => {
    const response = await fetch('/api/pivot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publisher }),
    })
    const result = await response.json()
    setData(result)
  }

  const handlePublisherSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPublisher(inputPublisher)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle><i><center>This query pivots the data to show the number of games released by a publisher for each year.</center></i></CardTitle>
        <hr/><br/>
        <CardTitle>Games Released by Publisher Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <form onSubmit={handlePublisherSubmit} className="flex items-end gap-2">
            <div className="flex-grow">
              <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-1">
                Publisher
              </label>
              <Input
                id="publisher"
                value={inputPublisher}
                onChange={(e: { target: { value: SetStateAction<string> } }) => setInputPublisher(e.target.value)}
                placeholder="Enter publisher name"
              />
            </div>
            <Button type="submit">Update</Button>
          </form>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="games_released" stroke="#8884d8" name="Games Released" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}