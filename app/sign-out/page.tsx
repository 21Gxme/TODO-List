"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Loader2 } from "lucide-react"

export default function SignOutPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const signOut = async () => {
      try {
        // Sign out using the client-side Supabase instance
        const { error } = await supabase.auth.signOut()

        if (error) {
          throw error
        }

        // Redirect to the login page after successful sign-out
        router.push("/protected/sign-in")
      } catch (err) {
        console.error("Error signing out:", err)
        setError("An error occurred while signing out. Please try again.")
      }
    }

    signOut()
  }, [router, supabase.auth])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg border">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Signing Out</h1>
          <div className="mt-4 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="mt-4 text-muted-foreground">Please wait while we sign you out...</p>
          {error && <p className="mt-4 text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  )
}
