"use server"

import { encodedRedirect } from "@/utils/utils"
import { createClient } from "@/utils/supabase/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString()
  const password = formData.get("password")?.toString()
  const supabase = await createClient()
  const origin = (await headers()).get("origin")

  if (!email || !password) {
    return encodedRedirect("error", "/sign-up", "Email and password are required")
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error(error.code + " " + error.message)
    return encodedRedirect("error", "/sign-up", error.message)
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    )
  }
}

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message)
  }

  return redirect("/protected/todos")
}

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString()
  const supabase = await createClient()
  const origin = (await headers()).get("origin")
  const callbackUrl = formData.get("callbackUrl")?.toString()

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required")
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  })

  if (error) {
    console.error(error.message)
    return encodedRedirect("error", "/forgot-password", "Could not reset password")
  }

  if (callbackUrl) {
    return redirect(callbackUrl)
  }

  return encodedRedirect("success", "/forgot-password", "Check your email for a link to reset your password.")
}

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient()

  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!password || !confirmPassword) {
    encodedRedirect("error", "/protected/reset-password", "Password and confirm password are required")
  }

  if (password !== confirmPassword) {
    encodedRedirect("error", "/protected/reset-password", "Passwords do not match")
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    encodedRedirect("error", "/protected/reset-password", "Password update failed")
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated")
}

export const signOutAction = async () => {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect("/sign-in")
}

// New server action for creating todos
export async function createTodoAction(formData: FormData) {
  const supabase = await createClient()

  try {
    // Extract form data
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const status = formData.get("status") as string
    const dueDateString = formData.get("dueDate") as string
    const dueDate = dueDateString ? new Date(dueDateString).toISOString() : null

    // Validate required fields
    if (!title.trim()) {
      return { error: "Title is required" }
    }

    // Generate a UUID for the todo
    const todoId = uuidv4()

    // Create the todo in the database
    const { error: insertError } = await supabase.from("Todo").insert({
      id: todoId,
      title,
      description,
      status,
      due_date: dueDate,
    })

    if (insertError) {
      console.error("Error creating todo:", insertError)
      return { error: `Failed to create todo: ${insertError.message}` }
    }

    // Handle image upload if present
    const image = formData.get("image") as File
    if (image && image.size > 0) {
      if (image.size > 5 * 1024 * 1024) {
        return {
          success: true,
          todoId,
          warning: "Image size exceeds 5MB limit. Todo was created without the image.",
        }
      }

      const { error: uploadError } = await supabase.storage.from("todo-images").upload(todoId, image, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) {
        console.error("Error uploading image:", uploadError)
        return {
          success: true,
          todoId,
          warning: "Your todo was created, but we couldn't upload the image.",
        }
      }
    }

    return { success: true, todoId }
  } catch (error) {
    console.error("Error in createTodoAction:", error)
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
