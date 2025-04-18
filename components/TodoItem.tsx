"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { Pencil, Trash2, Check, X, Loader2, ImagePlus, Clock, Upload, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import type { Todo } from "./TodoList"

export default function TodoItem({ todo, onDelete }: { todo: Todo; onDelete: (id: string) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [description, setDescription] = useState(todo.description)
  const [status, setStatus] = useState(todo.status)
  const [dueDate, setDueDate] = useState<Date | null>(todo.due_date ? parseISO(todo.due_date) : null)
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [newImage, setNewImage] = useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const supabase = createClient()

  // Fetch image URL when component mounts
  useEffect(() => {
    const fetchImage = async () => {
      setIsImageLoading(true)

      try {
        // First, check if the image exists
        const { data: fileData, error: fileError } = await supabase.storage.from("todo-images").list("", {
          limit: 1,
          search: todo.id,
        })

        if (fileError) {
          console.error("Error checking if image exists:", fileError)
          setIsImageLoading(false)
          return
        }

        // If no files found or empty array, there's no image
        if (!fileData || fileData.length === 0) {
          console.log("No image found for todo:", todo.id)
          setIsImageLoading(false)
          return
        }

        // If image exists, get the URL
        const { data, error } = await supabase.storage.from("todo-images").createSignedUrl(todo.id, 60 * 60) // 1 hour expiry

        if (error) {
          console.error("Error creating signed URL:", error)
          setIsImageLoading(false)
          return
        }

        if (data) {
          console.log("Image URL fetched successfully:", data.signedUrl)
          setImageUrl(data.signedUrl)
        }
      } catch (error) {
        console.error("Error in fetchImage:", error)
      } finally {
        setIsImageLoading(false)
      }
    }

    fetchImage()
  }, [todo.id, supabase])

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Image too large",
          description: "Image size exceeds 5MB limit. Please choose a smaller image.",
          variant: "destructive",
        })
        return
      }

      setNewImage(file)

      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setNewImage(null)
    setNewImagePreview(null)
    setImageUrl(null) // This indicates we want to remove the existing image
  }

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

      // Reload the page after a short delay to allow the toast to be seen
      setTimeout(() => {
        window.location.reload()
      }, 250)
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
      // Update todo data in the database
      const { error } = await supabase
        .from("Todo")
        .update({
          title,
          description,
          status,
          due_date: dueDate ? dueDate.toISOString() : null,
        })
        .eq("id", todo.id)

      if (error) {
        throw new Error(`Failed to update todo: ${error.message}`)
      }

      // Handle image changes
      if (newImage) {
        console.log("Uploading new image:", newImage.name)

        // First, try to delete any existing image (this ensures clean replacement)
        try {
          await supabase.storage.from("todo-image").remove([todo.id])
          console.log("Existing image removed successfully")
        } catch (removeError) {
          console.log("No existing image to remove or error removing:", removeError)
          // Continue with upload even if removal fails
        }

        // Now upload the new image
        const { error: uploadError } = await supabase.storage.from("todo-images").upload(todo.id, newImage, {
          cacheControl: "3600",
          upsert: true, // This will overwrite the existing image
        })

        if (uploadError) {
          console.error("Error uploading new image:", uploadError)
          toast({
            title: "Image upload failed",
            description: "Your todo was updated, but we couldn't upload the new image.",
            variant: "destructive",
          })
        } else {
          console.log("New image uploaded successfully")
          toast({
            title: "Todo updated",
            description: "Your todo and image were updated successfully.",
          })
        }
      } else if (imageUrl === null && todo.id) {
        // User wants to remove the image
        console.log("Removing existing image")
        try {
          const { error: removeError } = await supabase.storage.from("todo-images").remove([todo.id])

          if (removeError) {
            console.error("Error removing image:", removeError)
            toast({
              title: "Image removal failed",
              description: "Your todo was updated, but we couldn't remove the image.",
              variant: "destructive",
            })
          } else {
            console.log("Image removed successfully")
            toast({
              title: "Todo updated",
              description: "Your todo was updated and image was removed.",
            })
          }
        } catch (removeError) {
          console.error("Exception removing image:", removeError)
        }
      } else {
        // No image changes
        toast({
          title: "Todo updated",
          description: "Your changes have been saved.",
        })
      }

      // Reset states
      setIsEditing(false)
      setNewImage(null)
      setNewImagePreview(null)

      // Reload the page to reflect all changes
      setTimeout(() => {
        window.location.reload()
      }, 500)
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
      // First try to delete the image if it exists
      try {
        await supabase.storage.from("todo-images").remove([todo.id])
        console.log("Image deleted successfully during todo deletion")
      } catch (storageError) {
        console.log("No image to delete or error deleting image:", storageError)
        // Continue with todo deletion even if image deletion fails
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

  // Format due date for display
  const formatDueDate = (date: Date | null) => {
    if (!date) return null
    return format(date, "MMM d, yyyy")
  }

  // Check if due date is past
  const isPastDue = (date: Date | null) => {
    if (!date) return false
    return date < new Date() && status !== "Done"
  }

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-medium">Edit Todo</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsEditing(false)
                setNewImage(null)
                setNewImagePreview(null)
                setDueDate(todo.due_date ? parseISO(todo.due_date) : null)
                if (imageUrl === null) {
                  const fetchImage = async () => {
                    const { data } = await supabase.storage.from("todo-images").createSignedUrl(todo.id, 60 * 60)
                    if (data) {
                      setImageUrl(data.signedUrl)
                    }
                  }
                  fetchImage()
                }
              }}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 max-h-[calc(100vh-10rem)] overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Todo title"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  rows={3}
                  className="w-full resize-none"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todo">Todo</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={dueDate}
                    onChange={(date) => setDueDate(date)}
                    dateFormat="MMM d, yyyy"
                    placeholderText="Select due date"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleFileSelect} className="text-xs">
                      <ImagePlus className="h-3.5 w-3.5 mr-1" />
                      {newImagePreview || imageUrl ? "Change Image" : "Add Image"}
                    </Button>
                    {(newImagePreview || imageUrl) && (
                      <Button type="button" variant="destructive" size="sm" onClick={removeImage} className="text-xs">
                        <X className="h-3.5 w-3.5 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Image Preview */}
                {newImagePreview ? (
                  <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                    <img
                      src={newImagePreview || "/placeholder.svg"}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      New Image
                    </div>
                  </div>
                ) : imageUrl ? (
                  <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                    <img src={imageUrl || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      Current Image
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video w-full rounded-md overflow-hidden border bg-muted/10 flex items-center justify-center">
                    <div className="text-muted-foreground text-sm flex flex-col items-center">
                      <Upload className="h-8 w-8 mb-2 opacity-20" />
                      <span>No image attached</span>
                      <span className="text-xs mt-1">Click "Add Image" to upload</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Created: {formatCreatedAt(todo.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false)
                setNewImage(null)
                setNewImagePreview(null)
                setDueDate(todo.due_date ? parseISO(todo.due_date) : null)
                if (imageUrl === null) {
                  const fetchImage = async () => {
                    const { data } = await supabase.storage.from("todo-images").createSignedUrl(todo.id, 60 * 60)
                    if (data) {
                      setImageUrl(data.signedUrl)
                    }
                  }
                  fetchImage()
                }
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={updateTodo} disabled={isLoading} size="sm">
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
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
      {/* Image Section */}
      {isImageLoading && (
        <div className="relative aspect-video w-full overflow-hidden border-b bg-muted/20 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      )}

      {imageUrl && !isImageLoading && (
        <div className="relative aspect-video w-full overflow-hidden border-b">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={todo.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
            onError={(e) => {
              console.error("Error loading image:", e)
              setImageUrl(null)
            }}
          />
        </div>
      )}

      {!imageUrl && !isImageLoading && (
        <div className="relative aspect-video w-full overflow-hidden border-b bg-muted/10 flex items-center justify-center">
          <div className="text-muted-foreground text-base flex flex-col items-center">
            <ImagePlus className="h-12 w-12 mb-3 opacity-20" />
            <span>No image attached</span>
          </div>
        </div>
      )}

      <CardContent className="p-6 flex-grow">
        <div className="mb-4">
          {/* Status and Due Date Badges - Smaller size */}
          <div className="flex items-center space-x-2 mb-4 flex-nowrap overflow-x-auto">
            <Badge
              className={`${getStatusColor(status)} shadow-sm whitespace-nowrap px-2.5 py-0.5 text-xs font-normal flex-shrink-0`}
            >
              {status}
            </Badge>

            {dueDate && (
              <Badge
                className={`${
                  isPastDue(dueDate)
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                } shadow-sm whitespace-nowrap px-2.5 py-0.5 text-xs font-normal flex-shrink-0 flex items-center gap-1`}
              >
                <Calendar className="h-3 w-3" />
                {formatDueDate(dueDate)}
                {isPastDue(dueDate) && " (Overdue)"}
              </Badge>
            )}
          </div>

          <h3 className="font-medium text-xl mb-2">{todo.title}</h3>
          {todo.description && <p className="text-muted-foreground mt-3 text-base line-clamp-3">{todo.description}</p>}
        </div>

        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-6">
          <Clock className="h-4 w-4" />
          <span>Created: {formatCreatedAt(todo.created_at)}</span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between p-5 bg-card border-t mt-auto">
        <Select value={status} onValueChange={updateTodoStatus}>
          <SelectTrigger className="w-[160px] h-10 text-sm border-input">
            <SelectValue placeholder="Change status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todo">Todo</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
            className="h-10 w-10 border-input hover:bg-primary/5 hover:text-primary hover:border-primary transition-colors"
          >
            <Pencil className="h-5 w-5" />
          </Button>

          <Button variant="destructive" size="icon" onClick={deleteTodo} disabled={isLoading} className="h-10 w-10">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
