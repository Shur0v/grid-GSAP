"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, useAnimate } from "framer-motion"

const COLS = 23
const ROWS = 8
const SPACING = 30
const STROKE_LENGTH = 10
const STROKE_WIDTH = 1

export default function GridBall() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ballRef, animate] = useAnimate()
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const requestRef = useRef<number | null>(null)
  const ballPosition = useRef({ x: 0, y: 0 })
  const isAnimating = useRef(false)

  // Calculate canvas dimensions based on grid
  useEffect(() => {
    const width = COLS * SPACING
    const height = ROWS * SPACING
    setDimensions({ width, height })
  }, [])

  // Find nearest grid point
  const snapToGrid = (pointX: number, pointY: number) => {
    const nearestX = Math.round(pointX / SPACING) * SPACING
    const nearestY = Math.round(pointY / SPACING) * SPACING
    return { x: nearestX, y: nearestY }
  }

  // Animation loop
  const animateCanvas = useCallback(() => {
    if (!canvasRef.current || !ballRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)

    // Get current ball position
    const ballRect = ballRef.current.getBoundingClientRect()
    const canvasRect = canvas.getBoundingClientRect()
    const ballX = ballRect.left - canvasRect.left + ballRect.width / 2
    const ballY = ballRect.top - canvasRect.top + ballRect.height / 2

    // Update ball position reference
    ballPosition.current = { x: ballX, y: ballY }

    // Draw strokes
    for (let col = 0; col <= COLS; col++) {
      for (let row = 0; row <= ROWS; row++) {
        const pointX = col * SPACING
        const pointY = row * SPACING

        // Calculate distance to ball
        const dx = ballX - pointX
        const dy = ballY - pointY
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Skip drawing if too close to ball
        if (distance < 15) continue

        // Calculate angle to ball
        const angle = Math.atan2(dy, dx)

        // Draw stroke
        ctx.beginPath()
        ctx.moveTo(pointX, pointY)
        ctx.lineTo(pointX + Math.cos(angle) * STROKE_LENGTH, pointY + Math.sin(angle) * STROKE_LENGTH)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
        ctx.lineWidth = STROKE_WIDTH
        ctx.stroke()
      }
    }

    if (isAnimating.current) {
      requestRef.current = requestAnimationFrame(animateCanvas)
    }
  }, [dimensions, ballRef.current]), // Added ballRef.current to dependencies

  // Handle click to move ball
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top
    const { x: snapX, y: snapY } = snapToGrid(clickX, clickY)

    animate(
      ballRef.current,
      { x: snapX, y: snapY },
      {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: () => {
          if (!isAnimating.current) {
            isAnimating.current = true
            requestRef.current = requestAnimationFrame(animateCanvas)
          }
        },
        onComplete: () => {
          isAnimating.current = false
          if (requestRef.current) {
            cancelAnimationFrame(requestRef.current)
            requestRef.current = null
          }
          // Ensure a final render after animation completes
          animateCanvas()
        },
      },
    )
  }

  // Initial canvas draw and update on window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && ballRef.current) {
        animateCanvas()
      }
    }

    window.addEventListener("resize", handleResize)
    animateCanvas() // Initial draw

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [animateCanvas])

  return (
    <div
      className="relative cursor-pointer bg-black"
      onClick={handleClick}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="absolute inset-0" />
      <motion.div
        ref={ballRef}
        className="absolute w-[6px] h-[6px] rounded-full bg-white"
        style={{
          x: 0,
          y: 0,
          marginLeft: -3,
          marginTop: -3,
        }}
      />
    </div>
  )
}
