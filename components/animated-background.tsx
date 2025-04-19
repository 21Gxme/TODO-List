"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Shape {
  id: number
  x: number
  y: number
  size: number
  rotation: number
  opacity: number
  color: string
  delay: number
}

export function AnimatedBackground() {
  const [shapes, setShapes] = useState<Shape[]>([])

  useEffect(() => {
    // Generate random shapes
    const colors = [
      "rgba(99, 102, 241, 0.15)", // indigo-like
      "rgba(139, 92, 246, 0.12)", // violet-like
      "rgba(79, 70, 229, 0.1)", // purple-like
      "rgba(59, 130, 246, 0.08)", // blue-like
    ]

    const newShapes: Shape[] = []

    for (let i = 0; i < 15; i++) {
      newShapes.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 100 + 50,
        rotation: Math.random() * 360,
        opacity: Math.random() * 0.2 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 5,
      })
    }

    setShapes(newShapes)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute rounded-full"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            backgroundColor: shape.color,
            opacity: shape.opacity,
          }}
          initial={{
            rotate: shape.rotation,
            scale: 0.8,
          }}
          animate={{
            x: [0, Math.random() * 40 - 20, 0],
            y: [0, Math.random() * 40 - 20, 0],
            rotate: shape.rotation + 360,
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: Math.random() * 20 + 20,
            delay: shape.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background/80 backdrop-blur-[100px]" />
    </div>
  )
}
