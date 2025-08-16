"use client"
import { CalendarPlanner } from "@/components/calendar-planner"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">캘린더 플래너</h1>
          <p className="text-muted-foreground">주간 및 월간 일정을 관리하세요</p>
        </div>
        <CalendarPlanner />
      </div>
    </div>
  )
}
