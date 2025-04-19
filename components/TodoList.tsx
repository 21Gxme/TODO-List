"use client"

import { useState, useEffect } from "react"
import TodoItem from "./TodoItem"
import { createClient } from "@/utils/supabase/client"
import { Filter, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export type Todo = {
  id: string
  user_id: string
  title: string
  description: string
  status: string
  created_at: string
  due_date: string | null
}

export default function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>(initialTodos)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const supabase = createClient()

  useEffect(() => {
    // Set up real-time subscription to todos
    const channel = supabase
      .channel("todos-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Todo",
        },
        async (payload) => {
          // Refresh the todos list when changes occur
          const { data } = await supabase.from("Todo").select("*").order("created_at", { ascending: false })

          if (data) {
            setTodos(data)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Apply filters whenever todos or statusFilter changes
  useEffect(() => {
    console.log("Filtering todos with status:", statusFilter)
    console.log("Current todos:", todos)

    if (statusFilter === "all") {
      setFilteredTodos(todos)
    } else {
      const filtered = todos.filter((todo) => todo.status === statusFilter)
      setFilteredTodos(filtered)
    }

    console.log("Filtered todos:", filteredTodos)
  }, [todos, statusFilter])

  // Handle todo deletion locally
  const handleDelete = (id: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id))
  }

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    console.log("Setting status filter to:", status)
    setStatusFilter(status)
  }

  // Count todos by status
  const todoCount = todos.filter((todo) => todo.status === "Todo").length
  const inProgressCount = todos.filter((todo) => todo.status === "In Progress").length
  const doneCount = todos.filter((todo) => todo.status === "Done").length
  const totalCount = todos.length

  if (todos.length === 0) {
    return (
      <div className="text-center p-12 border rounded-xl bg-muted/10 shadow-sm">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <SlidersHorizontal className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-medium mb-2">No todos yet</h3>
        <p className="text-muted-foreground">Create your first todo to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            Your Tasks
            <Badge variant="outline" className="rounded-full ml-2 bg-background">
              {totalCount}
            </Badge>
          </h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge
              variant={statusFilter === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleStatusFilterChange("all")}
            >
              All: {totalCount}
            </Badge>
            <Badge
              variant={statusFilter === "Todo" ? "default" : "outline"}
              className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors cursor-pointer"
              onClick={() => handleStatusFilterChange("Todo")}
            >
              Todo: {todoCount}
            </Badge>
            <Badge
              variant={statusFilter === "In Progress" ? "default" : "outline"}
              className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 transition-colors whitespace-nowrap cursor-pointer"
              onClick={() => handleStatusFilterChange("In Progress")}
            >
              In Progress: {inProgressCount}
            </Badge>
            <Badge
              variant={statusFilter === "Done" ? "default" : "outline"}
              className="bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors cursor-pointer"
              onClick={() => handleStatusFilterChange("Done")}
            >
              Done: {doneCount}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {statusFilter !== "all"
              ? `Showing ${filteredTodos.length} ${statusFilter} items`
              : `Showing all ${totalCount} items`}
          </div>
        </div>
      </div>

      {filteredTodos.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">No todos match the current filter.</p>
          <Button variant="link" onClick={() => handleStatusFilterChange("all")} className="mt-2">
            Show all todos
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
