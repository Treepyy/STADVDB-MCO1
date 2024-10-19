'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RollUpChart from './components/roll-up-chart'
import DrillDownChart from './components/drill-down-chart'
import SliceDiceChart from './components/slice-dice-chart'
import PivotChart from './components/pivot-chart'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('roll-up')

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Steam Games OLAP Dashboard</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roll-up">Roll Up</TabsTrigger>
          <TabsTrigger value="drill-down">Drill Down</TabsTrigger>
          <TabsTrigger value="slice-dice">Slice and Dice</TabsTrigger>
          <TabsTrigger value="pivot">Pivot</TabsTrigger>
        </TabsList>
        <TabsContent value="roll-up">
          <RollUpChart />
        </TabsContent>
        <TabsContent value="drill-down">
          <DrillDownChart />
        </TabsContent>
        <TabsContent value="slice-dice">
          <SliceDiceChart />
        </TabsContent>
        <TabsContent value="pivot">
          <PivotChart />
        </TabsContent>
      </Tabs>
    </div>
  )
}