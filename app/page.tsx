import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/protected/todos")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] gap-8 p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="flex flex-col items-center text-center gap-4 max-w-md">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
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
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Todo App
        </h1>
        <p className="text-muted-foreground text-lg">
          A beautiful and intuitive application to help you manage your tasks efficiently.
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          asChild
          size="lg"
          className="rounded-full px-8 shadow-lg transition-all hover:shadow-primary/20 hover:scale-105"
        >
          <Link href="/protected/sign-in">Login</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-full px-8 shadow-sm hover:shadow-md transition-all hover:scale-105"
        >
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    </div>
  )
}
