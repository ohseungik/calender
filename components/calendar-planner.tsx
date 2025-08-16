"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description?: string
  date: string
  startTime: string // "09:00" 형태
  endTime: string // "10:00" 형태
}

export function CalendarPlanner() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskStartTime, setNewTaskStartTime] = useState<string>("")
  const [newTaskEndTime, setNewTaskEndTime] = useState<string>("")
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const timeOptions = []
  for (let hour = 9; hour <= 23; hour++) {
    const timeStr = `${hour.toString().padStart(2, "0")}:00`
    const displayTime = hour < 12 ? `오전 ${hour}시` : hour === 12 ? `오후 12시` : `오후 ${hour - 12}시`
    timeOptions.push({ value: timeStr, label: displayTime })
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = []
  for (let year = currentYear - 5; year <= currentYear + 5; year++) {
    yearOptions.push(year)
  }

  const monthOptions = [
    { value: 1, label: "1월" },
    { value: 2, label: "2월" },
    { value: 3, label: "3월" },
    { value: 4, label: "4월" },
    { value: 5, label: "5월" },
    { value: 6, label: "6월" },
    { value: 7, label: "7월" },
    { value: 8, label: "8월" },
    { value: 9, label: "9월" },
    { value: 10, label: "10월" },
    { value: 11, label: "11월" },
    { value: 12, label: "12월" },
  ]

  const getWeekOfMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()

    // 해당 월의 1일
    const firstDay = new Date(year, month, 1)

    // 현재 주의 시작일 (일요일)
    const currentWeekStart = new Date(date)
    currentWeekStart.setDate(date.getDate() - date.getDay())

    // 1일이 포함된 주의 시작일 (일요일)
    const firstWeekStart = new Date(firstDay)
    firstWeekStart.setDate(firstDay.getDate() - firstDay.getDay())

    // 주차 계산 (밀리초 차이를 주 단위로 변환)
    const weekDiff = Math.floor((currentWeekStart.getTime() - firstWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000))

    return weekDiff + 1
  }

  useEffect(() => {
    const savedTasks = localStorage.getItem("calendar-tasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("calendar-tasks", JSON.stringify(tasks))
  }, [tasks])

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const addTask = () => {
    if (newTaskTitle.trim() && newTaskStartTime && newTaskEndTime) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        date: selectedDate,
        startTime: newTaskStartTime,
        endTime: newTaskEndTime,
      }
      setTasks([...tasks, task])
      resetDialog()
    }
  }

  const updateTask = () => {
    if (editingTask && newTaskTitle.trim() && newTaskStartTime && newTaskEndTime) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                title: newTaskTitle.trim(),
                description: newTaskDescription.trim() || undefined,
                startTime: newTaskStartTime,
                endTime: newTaskEndTime,
              }
            : task,
        ),
      )
      resetDialog()
    }
  }

  const resetDialog = () => {
    setNewTaskTitle("")
    setNewTaskDescription("")
    setNewTaskStartTime("")
    setNewTaskEndTime("")
    setEditingTask(null)
    setIsDialogOpen(false)
  }

  const openAddDialog = (dateStr: string, timeStr: string) => {
    setSelectedDate(dateStr)
    setSelectedTime(timeStr)
    setEditingTask(null)
    setNewTaskTitle("")
    setNewTaskDescription("")
    setNewTaskStartTime(timeStr)
    const startHour = Number.parseInt(timeStr.split(":")[0])
    const endHour = Math.min(startHour + 1, 23)
    setNewTaskEndTime(`${endHour.toString().padStart(2, "0")}:00`)
    setIsDialogOpen(true)
  }

  const openEditDialog = (task: Task) => {
    setSelectedDate(task.date)
    setEditingTask(task)
    setNewTaskTitle(task.title)
    setNewTaskDescription(task.description || "")
    setNewTaskStartTime(task.startTime)
    setNewTaskEndTime(task.endTime)
    setIsDialogOpen(true)
  }

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
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

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    setCurrentDate(newDate)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return formatDate(date) === formatDate(today)
  }

  const getTasksForDateAndTime = (date: string, time: string) => {
    return tasks.filter((task) => {
      if (task.date !== date) return false
      if (!task.startTime || !task.endTime || !time) return false

      const taskStart = Number.parseInt(task.startTime.split(":")[0])
      const taskEnd = Number.parseInt(task.endTime.split(":")[0])
      const currentHour = Number.parseInt(time.split(":")[0])
      return currentHour >= taskStart && currentHour < taskEnd
    })
  }

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"]
  const days = getWeekDays()

  const changeDateTo = () => {
    const newDate = new Date(selectedYear, selectedMonth - 1, 1)
    setCurrentDate(newDate)
    setIsDatePickerOpen(false)
  }

  const openDatePicker = () => {
    setSelectedYear(currentDate.getFullYear())
    setSelectedMonth(currentDate.getMonth() + 1)
    setIsDatePickerOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h2
            className="text-2xl font-semibold cursor-pointer hover:text-blue-600 transition-colors"
            onClick={openDatePicker}
          >
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 {getWeekOfMonth(currentDate)}주차
          </h2>

          <Button variant="outline" size="icon" onClick={() => navigateWeek("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* 날짜 헤더 */}
          <div className="grid grid-cols-8 border-b">
            <div className="p-4 border-r"></div> {/* 시간 컬럼 헤더 */}
            {days.map((date, index) => (
              <div key={index} className="p-4 text-center border-r last:border-r-0">
                <div className="text-sm text-muted-foreground">{weekDays[date.getDay()]}</div>
                <div
                  className={cn(
                    "text-2xl font-medium mt-1",
                    isToday(date) &&
                      "bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto",
                  )}
                >
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* 시간 그리드 */}
          <div className="grid grid-cols-8">
            {timeOptions.map((timeOption, timeIndex) => (
              <div key={timeOption.value} className="contents">
                {/* 시간 라벨 */}
                <div
                  className={cn(
                    "p-4 border-r text-sm text-muted-foreground bg-muted/20",
                    timeIndex < timeOptions.length - 1 && "border-b",
                  )}
                >
                  {timeOption.label}
                </div>

                {/* 각 날짜별 시간 슬롯 */}
                {days.map((date, dayIndex) => {
                  const dateStr = formatDate(date)
                  const tasksInSlot = getTasksForDateAndTime(dateStr, timeOption.value)

                  return (
                    <div
                      key={`${dateStr}-${timeOption.value}`}
                      className={cn(
                        "border-r last:border-r-0 min-h-[60px] p-1 cursor-pointer hover:bg-muted/50 relative",
                        timeIndex < timeOptions.length - 1 && "border-b",
                      )}
                      onClick={() => openAddDialog(dateStr, timeOption.value)}
                    >
                      {tasksInSlot.map((task) => (
                        <div
                          key={task.id}
                          className="bg-blue-500 text-white text-xs p-2 rounded mb-1 cursor-pointer hover:bg-blue-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditDialog(task)
                          }}
                        >
                          <div className="font-medium truncate">{task.title}</div>
                          <div className="text-xs opacity-90">
                            {task.startTime} - {task.endTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "일정 수정" : "새 일정 추가"}
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
                placeholder="일정 제목을 입력하세요..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="h-12 text-base"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">시작 시간</label>
                <Select value={newTaskStartTime} onValueChange={setNewTaskStartTime}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="시작 시간" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">종료 시간</label>
                <Select value={newTaskEndTime} onValueChange={setNewTaskEndTime}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="종료 시간" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                disabled={!newTaskTitle.trim() || !newTaskStartTime || !newTaskEndTime}
              >
                <Plus className="h-4 w-4 mr-2" />
                {editingTask ? "수정" : "추가"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>날짜 선택</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">년도</label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="년도 선택" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}년
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">월</label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="월 선택" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={() => setIsDatePickerOpen(false)} variant="outline" className="flex-1 h-12">
                취소
              </Button>
              <Button onClick={changeDateTo} className="flex-1 h-12">
                이동
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
