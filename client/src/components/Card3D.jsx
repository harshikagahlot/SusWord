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

  // Base styles
  const baseStyle = {
    position: 'relative',
    transformStyle: 'preserve-3d',
    willChange: 'transform, box-shadow',
    // Snap immediately on move, ease back on leave/press
    transition: isHovered && !isPressed ? 'transform 0.1s linear, box-shadow 0.15s ease-out' : 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
    ...style,
  }

  if (isPressed) {
    baseStyle.transform = 'perspective(1000px) scale3d(0.95, 0.95, 0.95)'
    // Keep user shadow or fallback
    baseStyle.boxShadow = style.boxShadow ? style.boxShadow.replace(/rgba\([^)]+\)/g, 'rgba(0,0,0,0.15)') : '0 2px 8px rgba(0,0,0,0.2)'
  } else if (isHovered) {
    baseStyle.transform = transform
    // Enhance shadow on hover
    if (style.boxShadow) {
      baseStyle.boxShadow = style.boxShadow + ', 0 8px 24px rgba(0,0,0,0.3)'
    } else {
      baseStyle.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'
    }
  }

  const combinedClassName = `relative overflow-hidden rounded-2xl ${className} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`

  return (
    <Component
      ref={cardRef}
      className={combinedClassName}
      style={baseStyle}
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
