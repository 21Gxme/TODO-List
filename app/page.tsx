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
    <div className="relative min-h-[100vh]">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-blue-500/20 animate-gradient-slow" />

        {/* Animated circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />

        {/* Gradient overlay to improve text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/50 to-background/30 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center min-h-[100vh] gap-8 p-4">
        <div className="flex flex-col items-center text-center gap-4 max-w-md">
          <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20 shadow-xl">
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
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent drop-shadow-sm">
            Todo App
          </h1>
          <p className="text-black text-lg drop-shadow-sm">
            A beautiful and intuitive application to help you manage your tasks efficiently.
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            asChild
            size="lg"
            className="rounded-full px-8 shadow-lg transition-all hover:shadow-primary/20 hover:scale-105 bg-primary/90 backdrop-blur-sm"
          >
            <Link href="/protected/sign-in">Login</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 shadow-sm hover:shadow-md transition-all hover:scale-105 backdrop-blur-sm bg-white/20 border-white/20 text-blue"
          >
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
