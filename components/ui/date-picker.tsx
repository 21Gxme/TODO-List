"use client"

import { useState, forwardRef } from "react"
import ReactDatePicker from "react-datepicker"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
}

export function DatePicker({ date, setDate, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Custom input component
  const CustomInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
      <Button
        variant="outline"
        onClick={(e) => {
          e.preventDefault()
          onClick?.()
          setIsOpen(true)
        }}
        ref={ref}
        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value || <span>Pick a date</span>}
      </Button>
    ),
  )

  CustomInput.displayName = "CustomInput"

  return (
    <ReactDatePicker
      selected={date}
      onChange={(date: Date | null) => {
        setDate(date || undefined)
        setIsOpen(false)
      }}
      customInput={<CustomInput />}
      dateFormat="MMMM d, yyyy"
      open={isOpen}
      onClickOutside={() => setIsOpen(false)}
      onSelect={() => setIsOpen(false)}
      popperClassName="z-50"
    />
  )
}
