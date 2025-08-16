"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Plus, X, Calendar, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface Task {
  id: string
  title: string
  description?: string
  date: string
}

type ViewMode = "week" | "month"

export function CalendarPlanner() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const isMobile = useIsMobile()
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? "week" : "month")
  const [tasks, setTasks] = useState<Task[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    const savedTasks = localStorage.getItem("calendar-tasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("calendar-tasks", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    if (isMobile && viewMode === "month") {
      setViewMode("week")
    }
  }, [isMobile, viewMode])

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        date: selectedDate,
      }
      setTasks([...tasks, task])
      resetDialog()
    }
  }

  const updateTask = () => {
    if (editingTask && newTaskTitle.trim()) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id
            ? { ...task, title: newTaskTitle.trim(), description: newTaskDescription.trim() || undefined }
            : task,
        ),
      )
      resetDialog()
    }
  }

  const resetDialog = () => {
    setNewTaskTitle("")
    setNewTaskDescription("")
    setEditingTask(null)
    setIsDialogOpen(false)
  }

  const openAddDialog = (dateStr: string) => {
    setSelectedDate(dateStr)
    setEditingTask(null)
    setNewTaskTitle("")
    setNewTaskDescription("")
    setIsDialogOpen(true)
  }

  const openEditDialog = (task: Task) => {
    setSelectedDate(task.date)
    setEditingTask(task)
    setNewTaskTitle(task.title)
    setNewTaskDescription(task.description || "")
    setIsDialogOpen(true)
  }

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  const getTasksForDate = (date: string) => {
    return tasks.filter((task) => task.date === date)
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    }
    setCurrentDate(newDate)
  }

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    const totalDays = isMobile ? 28 : 42
    for (let i = 0; i < totalDays; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }

    return days
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return formatDate(date) === formatDate(today)
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"]
  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]

  const days = viewMode === "month" ? getMonthDays() : getWeekDays()

  return (
    <div className="max-w-6xl mx-auto space-y-4 p-2 sm:p-4 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate("prev")}
            className="h-12 w-12 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>

          <h2 className="text-xl font-semibold sm:text-2xl text-center">
            {viewMode === "month"
              ? `${currentDate.getFullYear()}년 ${monthNames[currentDate.getMonth()]}`
              : `${currentDate.getFullYear()}년 ${monthNames[currentDate.getMonth()]} ${Math.ceil(currentDate.getDate() / 7)}주차`}
          </h2>

          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate("next")}
            className="h-12 w-12 sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("week")}
            className="flex-1 sm:flex-none h-12 sm:h-10 text-base sm:text-sm"
          >
            <CalendarDays className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
            주간
          </Button>
          {!isMobile && (
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("month")}
              className="flex-1 sm:flex-none h-12 sm:h-10 text-base sm:text-sm"
            >
              <Calendar className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
              월간
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {(!isMobile || viewMode === "month") && (
            <div className="grid grid-cols-7 border-b">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="p-3 sm:p-4 text-center font-medium text-muted-foreground border-r last:border-r-0 text-base sm:text-base"
                >
                  {day}
                </div>
              ))}
            </div>
          )}

          <div
            className={cn(
              viewMode === "month"
                ? "grid grid-cols-7" + (isMobile ? " grid-rows-4" : " grid-rows-6")
                : isMobile
                  ? "grid grid-cols-2 gap-2 p-2"
                  : "grid grid-cols-7 grid-rows-1",
            )}
          >
            {days.map((date, index) => {
              const dateStr = formatDate(date)
              const dayTasks = getTasksForDate(dateStr)
              const isCurrentMonthDay = viewMode === "week" || isCurrentMonth(date)

              return (
                <div
                  key={index}
                  className={cn(
                    "cursor-pointer hover:bg-muted/50 transition-colors rounded-lg",
                    viewMode === "month"
                      ? "border-r border-b last:border-r-0 p-2 sm:p-3 min-h-[140px] sm:min-h-[120px]"
                      : isMobile
                        ? "border border-border p-4 min-h-[200px]"
                        : "border-r border-b last:border-r-0 p-2 sm:p-3 min-h-[200px] sm:min-h-[180px]",
                    !isCurrentMonthDay && "text-muted-foreground bg-muted/20",
                  )}
                  onClick={() => openAddDialog(dateStr)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col items-start">
                      {isMobile && viewMode === "week" && (
                        <span className="text-sm text-muted-foreground mb-1">{weekDays[date.getDay()]}</span>
                      )}
                      <span
                        className={cn(
                          "text-xl font-medium sm:text-base",
                          isToday(date) &&
                            "bg-primary text-primary-foreground rounded-full w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-base sm:text-sm",
                        )}
                      >
                        {date.getDate()}
                      </span>
                    </div>
                    {dayTasks.length > 0 && (
                      <Badge variant="secondary" className="text-sm h-7 px-3 sm:text-xs sm:h-6 sm:px-2">
                        {dayTasks.length}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 sm:space-y-1">
                    {dayTasks.slice(0, viewMode === "week" ? (isMobile ? 6 : 8) : isMobile ? 2 : 3).map((task) => (
                      <div
                        key={task.id}
                        className="bg-primary/10 text-primary px-3 py-2 sm:px-2 sm:py-1.5 rounded flex items-center justify-between group"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(task)
                        }}
                      >
                        <div className="truncate flex-1">
                          <div className="truncate text-base sm:text-sm font-medium">{task.title}</div>
                          {task.description && (
                            <div className="truncate text-sm sm:text-xs text-muted-foreground">{task.description}</div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "p-0 transition-opacity ml-2 sm:ml-1 shrink-0",
                            isMobile ? "h-8 w-8 opacity-100" : "h-6 w-6 opacity-0 group-hover:opacity-100",
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            removeTask(task.id)
                          }}
                          onTouchEnd={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            removeTask(task.id)
                          }}
                        >
                          <X className="h-4 w-4 sm:h-3 sm:w-3" />
                        </Button>
                      </div>
                    ))}
                    {dayTasks.length > (viewMode === "week" ? (isMobile ? 6 : 8) : isMobile ? 2 : 3) && (
                      <div className="text-sm text-muted-foreground px-3 sm:px-2">
                        +{dayTasks.length - (viewMode === "week" ? (isMobile ? 6 : 8) : isMobile ? 2 : 3)}개 더
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "할 일 수정" : "새 할 일 추가"}
              {selectedDate && (
                <span className="block text-sm font-normal text-muted-foreground mt-1">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  })}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">제목</label>
              <Input
                placeholder="할 일 제목을 입력하세요..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    editingTask ? updateTask() : addTask()
                  }
                }}
                className="h-12 text-base"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">상세 내용 (선택사항)</label>
              <Textarea
                placeholder="자세한 내용을 입력하세요..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="min-h-[100px] text-base resize-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={resetDialog} variant="outline" className="flex-1 h-12 bg-transparent">
                취소
              </Button>
              <Button
                onClick={editingTask ? updateTask : addTask}
                className="flex-1 h-12"
                disabled={!newTaskTitle.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                {editingTask ? "수정" : "추가"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
