"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"

export default function InteractiveGrid() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const linesRef = useRef<SVGLineElement[]>([])
  const gradientRef = useRef<SVGRadialGradientElement>(null)

  // Grid configuration
  const COLS = 8
  const ROWS = 6
  const LINE_WIDTH = 20
  const LINE_LENGTH = 100
  const CELL_SIZE = 120

  useEffect(() => {
    // Set initial dimensions
    if (containerRef.current) {
      const width = COLS * CELL_SIZE
      const height = ROWS * CELL_SIZE
      setDimensions({ width, height })

      // Set initial mouse position to center for the gradient
      setMousePosition({
        x: width / 2,
        y: height / 2,
      })
    }

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        const width = COLS * CELL_SIZE
        const height = ROWS * CELL_SIZE
        setDimensions({ width, height })
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Handle mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setMousePosition({ x, y })

      // Update gradient position with GSAP
      if (gradientRef.current) {
        gsap.to(gradientRef.current, {
          attr: { fx: x / dimensions.width, fy: y / dimensions.height },
          duration: 0.5,
          ease: "power2.out",
        })
      }

      // Animate lines based on mouse position
      linesRef.current.forEach((line, index) => {
        const lineX = Number.parseInt(line.getAttribute("data-x") || "0")
        const lineY = Number.parseInt(line.getAttribute("data-y") || "0")

        // Calculate distance from mouse to line center
        const dx = x - lineX
        const dy = y - lineY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = Math.sqrt(dimensions.width * dimensions.width + dimensions.height * dimensions.height) / 2

        // Calculate rotation based on mouse position
        let angle = Math.atan2(dy, dx) * (180 / Math.PI)
        
        // Get current rotation
        const currentRotation = gsap.getProperty(line, "rotation") as number || 0
        
        // Adjust angle to prevent sudden flips
        while (angle - currentRotation > 180) angle -= 360
        while (angle - currentRotation < -180) angle += 360

        // Animate rotation with GSAP
        gsap.to(line, {
          rotation: angle,
          transformOrigin: "center center",
          duration: 0.5,
          ease: "power2.out",
        })
      })
    }
  }

  // Generate grid lines
  const generateLines = () => {
    const lines = []
    linesRef.current = []

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = col * CELL_SIZE + CELL_SIZE / 2
        const y = row * CELL_SIZE + CELL_SIZE / 2

        lines.push(
          <line
            key={`line-${row}-${col}`}
            ref={(el) => el && linesRef.current.push(el)}
            x1={x - LINE_LENGTH / 2}
            y1={y}
            x2={x + LINE_LENGTH / 2}
            y2={y}
            stroke="white"
            strokeWidth={LINE_WIDTH}
            data-x={x}
            data-y={y}
          />,
        )
      }
    }

    return lines
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg"
      style={{ width: dimensions.width, height: dimensions.height }}
      onMouseMove={handleMouseMove}
    >
      <svg width={dimensions.width} height={dimensions.height} className="absolute inset-0">
        <defs>
          <radialGradient
            id="mouseGradient"
            ref={gradientRef}
            cx="0.5"
            cy="0.5"
            r="0.5"
            fx={mousePosition.x / dimensions.width}
            fy={mousePosition.y / dimensions.height}
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#DAE121" />
            <stop offset="40%" stopColor="#ADD354" />
            <stop offset="100%" stopColor="#1572AF" />
          </radialGradient>
        </defs>

        {/* Background with gradient */}
        <rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="url(#mouseGradient)" />

        {/* Grid lines */}
        <g>{generateLines()}</g>
      </svg>

      {/* Explore button */}
      <div className="absolute bottom-8 right-8 text-white flex flex-col items-center">
        <span className="text-xl font-black mb-2 uppercase text-[#fff] [-webkit-text-stroke:_0.5px_black]">bizmaxdesign</span>
        {/* <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 5V19M12 19L5 12M12 19L19 12"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg> */}
      </div>
    </div>
  )
}
