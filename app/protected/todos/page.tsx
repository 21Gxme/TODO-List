import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import TodoList from "@/components/TodoList"
import CreateTodoForm from "@/components/CreateTodoForm"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
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
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/sign-out">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex">
        <div className="w-[350px] border-r p-6 shrink-0">
          <CreateTodoForm />
        </div>
        <div className="flex-1 p-6">
          <TodoList initialTodos={todos || []} />
        </div>
      </main>
    </div>
  )
}
