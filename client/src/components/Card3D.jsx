import { useRef, useState, useCallback } from 'react'

export default function Card3D({ 
  children, 
  className = '', 
  style = {}, 
  onClick,
  disabled = false,
  // eslint-disable-next-line no-unused-vars
  as: Component = 'div',
  ...props
}) {
  const cardRef = useRef(null)
  const [transform, setTransform] = useState('')
  const [sheenPos, setSheenPos] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current || disabled || isPressed) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Tilt calculations (max 6-8 degrees)
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = -((y - centerY) / centerY) * 8
    const rotateY = ((x - centerX) / centerX) * 8

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02) translateY(-4px)`)
    setSheenPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 })
  }, [disabled, isPressed])

  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setIsPressed(false)
    setTransform('')
  }

  const handleTouchStart = () => {
    if (!disabled) setIsPressed(true)
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
  }

  const handleMouseDown = () => {
    if (!disabled) setIsPressed(true)
  }

  const handleMouseUp = () => {
    setIsPressed(false)
  }

  // FORCE NEW UI STYLES
  const isDanger = props.isDanger || false
  const isHighlight = props.isHighlighted || false

  let gradientClass = 'bg-gradient-to-br from-slate-800 to-slate-900'
  let borderClass = 'border border-slate-700'
  let shadowClass = 'shadow-xl'

  if (isDanger) {
    gradientClass = 'bg-gradient-to-br from-red-900/40 to-slate-900'
    borderClass = 'border-2 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
  } else if (isHighlight) {
    gradientClass = 'bg-gradient-to-br from-lime-900/30 to-slate-900'
    borderClass = 'border-2 border-lime-400/40 shadow-[0_0_15px_rgba(163,230,53,0.3)]'
  }

  // Combine interactions
  let interactionClass = ''
  if (!disabled) {
    interactionClass = 'transition-all duration-200 ease-out hover:-translate-y-1.5 hover:scale-105 active:scale-95 active:translate-y-0'
  }

  const combinedClassName = `relative overflow-hidden rounded-2xl p-5 w-full flex items-center gap-4 ${gradientClass} ${borderClass} ${shadowClass} ${interactionClass} ${className} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`

  return (
    <Component
      ref={cardRef}
      className={combinedClassName}
      style={{ transformStyle: 'preserve-3d', ...style }}
      onClick={!disabled ? onClick : undefined}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...props}
    >
      {/* Dynamic Sheen Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${sheenPos.x}% ${sheenPos.y}%, rgba(255,255,255,0.12) 0%, transparent 60%)`,
          opacity: isHovered && !isPressed ? 1 : 0,
          zIndex: 10,
        }}
      />
      {children}
    </Component>
  )
}
