"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, ImagePlus, Loader2, Plus, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function CreateTodoForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("Todo")
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Generate a UUID for the todo
      const todoId = uuidv4()

      // Create the todo in the database
      const { error: insertError } = await supabase.from("Todo").insert({
        id: todoId,
        title,
        description,
        status,
        due_date: dueDate ? dueDate.toISOString() : null,
      })

      if (insertError) {
        throw new Error(`Failed to create todo: ${insertError.message}`)
      }

      // Upload image if one was selected
      if (image) {
        // Upload directly using the todo ID as the file name
        const { error: uploadError } = await supabase.storage.from("todo-images").upload(todoId, image, {
          cacheControl: "3600",
          upsert: true,
        })

        if (uploadError) {
          // Log the error
          console.error("Error uploading image:", uploadError)

          // Show a toast notification about the image upload issue
          toast({
            title: "Image upload failed",
            description:
              "Your todo was created, but we couldn't upload the image. You can try again by editing the todo.",
            variant: "destructive",
          })

          // We don't throw here because we want to keep the todo even if the image upload fails
        } else {
          toast({
            title: "Todo created",
            description: "Your todo was created successfully with the image.",
          })
        }
      } else {
        toast({
          title: "Todo created",
          description: "Your todo was created successfully.",
        })
      }

      // Reset form
      setTitle("")
      setDescription("")
      setStatus("Todo")
      setDueDate(null)
      setImage(null)
      setImagePreview(null)

      // Refresh the page after a short delay to allow the toast to be seen
      setTimeout(() => {
        window.location.reload()
      }, 1000) // 1 second delay
    } catch (err) {
      // Handle any errors
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      console.error("Error creating todo:", errorMessage)
      setError(errorMessage)

      toast({
        title: "Failed to create todo",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5MB limit. Please choose a smaller image.")
        toast({
          title: "Image too large",
          description: "Image size exceeds 5MB limit. Please choose a smaller image.",
          variant: "destructive",
        })
        return
      }

      setImage(file)
      setError(null)

      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
        <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        Create a new todo
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {error && (
          <Alert variant="destructive" className="animate-in fade-in-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Title
          </Label>
          <Input
            id="title"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border-input focus-visible:ring-primary transition-all"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Add details about this todo"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="border-input resize-none focus-visible:ring-primary transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="border-input focus:ring-primary transition-all">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todo">Todo</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due-date" className="text-sm font-medium">
              Due Date
            </Label>
            <div className="relative">
              <DatePicker
                selected={dueDate}
                onChange={(date) => setDueDate(date)}
                dateFormat="MMM d, yyyy"
                placeholderText="Select due date"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                wrapperClassName="w-full"
                isClearable
              />
              {dueDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setDueDate(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image" className="text-sm font-medium">
            Attach Image (Optional)
          </Label>
          <div className="text-xs text-muted-foreground mb-2">Maximum size: 5MB</div>
          {imagePreview ? (
            <div className="relative mt-2 rounded-md overflow-hidden border border-input shadow-sm">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Preview"
                className="w-full h-32 sm:h-48 object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 sm:h-8 sm:w-8 rounded-full shadow-md opacity-90 hover:opacity-100 transition-opacity"
                onClick={removeImage}
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image")?.click()}
                className="transition-all hover:bg-primary/5 hover:text-primary hover:border-primary"
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
              {image && <span className="text-sm text-muted-foreground">{image.name}</span>}
            </div>
          )}
          <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="w-full py-1.5 sm:py-2 transition-all hover:shadow-md hover:shadow-primary/10"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Add Todo"
          )}
        </Button>
      </form>
    </div>
  )
}
