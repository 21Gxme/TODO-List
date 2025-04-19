import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import TodoList from "@/components/TodoList"
import CreateTodoForm from "@/components/CreateTodoForm"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

export default async function TodosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user initials for avatar
  const userInitials = user.email ? user.email.substring(0, 2).toUpperCase() : "U"

  // Fetch todos for the current user
  const { data: todos, error } = await supabase.from("Todo").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching todos:", error)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - Responsive for all screen sizes */}
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container flex h-16 items-center justify-between py-4 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">Todo App</h1>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">{userInitials}</AvatarFallback>
            </Avatar>
            <Button asChild variant="ghost" size="sm" className="gap-2 hidden sm:flex">
              <Link href="/signout">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </Link>
            </Button>
            {/* Mobile-only sign out button */}
            <Button asChild variant="ghost" size="icon" className="sm:hidden">
              <Link href="/signout">
                <LogOut className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content - Responsive layout */}
      <div className="container px-4 md:px-6 py-6">
        {/* Mobile: Form at top, Desktop: Form on left and list on right */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Create Todo Form - Top on mobile, Left on desktop */}
          <div className="w-full lg:w-[350px] lg:shrink-0">
            <Card className="p-4 sm:p-6 shadow-sm lg:sticky lg:top-24">
              <CreateTodoForm />
            </Card>
          </div>

          {/* Todo list - Below form on mobile, Right side on desktop */}
          <div className="flex-1">
            <TodoList initialTodos={todos || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
