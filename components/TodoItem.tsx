"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Pencil, Trash2, Check, X, Loader2, ImagePlus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Todo } from "./TodoList"

export default function TodoItem({ todo, onDelete }: { todo: Todo; onDelete: (id: string) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [description, setDescription] = useState(todo.description)
  const [status, setStatus] = useState(todo.status)
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const { toast } = useToast()

  const supabase = createClient()

  // Fetch image URL when component mounts
  useEffect(() => {
    const fetchImage = async () => {
      setIsImageLoading(true)

      try {
        const { data, error } = await supabase.storage.from("todo-images").createSignedUrl(todo.id, 60 * 60) // 1 hour expiry

        if (error) {
          // Instead of setting an error, just log it and continue
          console.log("No image found for todo:", todo.id)
          setIsImageLoading(false)
          return
        }

        if (data) {
          setImageUrl(data.signedUrl)
        }
      } catch (error) {
        console.error("Error fetching image:", error)
        // Don't set an error, just log it
      } finally {
        setIsImageLoading(false)
      }
    }

    fetchImage()
  }, [todo.id, supabase])

  const updateTodoStatus = async (newStatus: string) => {
    setIsLoading(true)

    try {
      const { error } = await supabase.from("Todo").update({ status: newStatus }).eq("id", todo.id)

      if (error) {
        throw new Error(`Failed to update status: ${error.message}`)
      }

      setStatus(newStatus)
      toast({
        title: "Status updated",
        description: `Todo status changed to ${newStatus}`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      console.error("Error updating todo status:", errorMessage)
      toast({
        title: "Failed to update status",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateTodo = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("Todo")
        .update({
          title,
          description,
          status,
        })
        .eq("id", todo.id)

      if (error) {
        throw new Error(`Failed to update todo: ${error.message}`)
      }

      setIsEditing(false)
      toast({
        title: "Todo updated",
        description: "Your changes have been saved",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      console.error("Error updating todo:", errorMessage)
      toast({
        title: "Failed to update todo",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTodo = async () => {
    setIsLoading(true)

    try {
      // Delete the image from storage if it exists
      if (imageUrl) {
        const { error: storageError } = await supabase.storage.from("todo-images").remove([todo.id])

        if (storageError) {
          console.error("Error deleting image:", storageError)
          // Continue with todo deletion even if image deletion fails
          toast({
            title: "Warning",
            description: "Todo deleted but failed to remove the associated image",
            variant: "default",
          })
        }
      }

      // Delete the todo
      const { error } = await supabase.from("Todo").delete().eq("id", todo.id)

      if (error) {
        throw new Error(`Failed to delete todo: ${error.message}`)
      }

      // Call the onDelete callback to update the parent component's state
      onDelete(todo.id)

      toast({
        title: "Todo deleted",
        description: "The todo has been permanently removed",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      console.error("Error in delete process:", errorMessage)
      toast({
        title: "Failed to delete todo",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-500 hover:bg-green-600 text-white"
      case "In Progress":
        return "bg-yellow-500 hover:bg-yellow-600 text-white"
      case "Todo":
        return "bg-blue-500 hover:bg-blue-600 text-white"
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white"
    }
  }

  // Format the creation date to the requested format
  const formatCreatedAt = (dateString: string) => {
    if (!dateString) return "Date not available"

    try {
      // Parse the date string
      const date = new Date(dateString)

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date"
      }

      // Format the date to YYYY-MM-DD HH:MM:SS
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const hours = String(date.getHours()).padStart(2, "0")
      const minutes = String(date.getMinutes()).padStart(2, "0")
      const seconds = String(date.getSeconds()).padStart(2, "0")

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Date format error"
    }
  }

  if (isEditing) {
    return (
      <Card className="border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        <CardContent className="p-4 grid gap-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Todo title"
            className="font-medium text-lg border-input focus-visible:ring-primary"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className="border-input resize-none focus-visible:ring-primary"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="border-input focus:ring-primary">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todo">Todo</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
          </Select>

          {imageUrl && (
            <div className="relative aspect-video w-full rounded-md overflow-hidden border shadow-sm">
              <img src={imageUrl || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
            </div>
          )}

          {!imageUrl && !isImageLoading && (
            <div className="relative aspect-video w-full rounded-md overflow-hidden border shadow-sm bg-muted/10 flex items-center justify-center">
              <div className="text-muted-foreground text-sm flex flex-col items-center">
                <ImagePlus className="h-8 w-8 mb-2 opacity-20" />
                <span>No image attached</span>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Created: {formatCreatedAt(todo.created_at)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 p-4 bg-muted/10 border-t">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isLoading}>
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={updateTodo} disabled={isLoading} className="bg-primary hover:bg-primary/90">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" /> Save
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col h-full">
      {/* Image Section */}
      {isImageLoading && (
        <div className="relative aspect-video w-full overflow-hidden border-b bg-muted/20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {imageUrl && !isImageLoading && (
        <div className="relative aspect-video w-full overflow-hidden border-b">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={todo.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
            onError={() => setImageUrl(null)}
          />
        </div>
      )}

      {!imageUrl && !isImageLoading && (
        <div className="relative aspect-video w-full overflow-hidden border-b bg-muted/10 flex items-center justify-center">
          <div className="text-muted-foreground text-sm flex flex-col items-center">
            <ImagePlus className="h-8 w-8 mb-2 opacity-20" />
            <span>No image attached</span>
          </div>
        </div>
      )}

      <CardContent className="p-4 flex-grow">
        <div className="mb-2">
          <Badge
            className={`${getStatusColor(status)} shadow-sm whitespace-nowrap px-3 py-1 text-xs flex-shrink-0 mb-2`}
          >
            {status}
          </Badge>
          <h3 className="font-medium text-lg">{todo.title}</h3>
          {todo.description && <p className="text-muted-foreground mt-2 text-sm line-clamp-2">{todo.description}</p>}
        </div>

        <div className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Created: {formatCreatedAt(todo.created_at)}</span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between p-3 bg-card border-t mt-auto">
        <Select value={status} onValueChange={updateTodoStatus}>
          <SelectTrigger className="w-[140px] h-9 text-sm border-input">
            <SelectValue placeholder="Change status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todo">Todo</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
            className="h-9 w-9 border-input hover:bg-primary/5 hover:text-primary hover:border-primary transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button variant="destructive" size="icon" onClick={deleteTodo} disabled={isLoading} className="h-9 w-9">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
