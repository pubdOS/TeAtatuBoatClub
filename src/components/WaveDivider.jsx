// Decorative maritime wave that transitions one section colour into the next.
// `top` is the colour of the section above (the wave shape), `bottom` is the
// section below (the background it dissolves into). Default top: navy. With no
// `bottom`, the wave takes the colour of the first section on screen after it
// (.wave-to-next in index.css), so it follows the client moving or hiding them.
export default function WaveDivider({ top = '#0b2545', bottom, className = '' }) {
  return (
    <div className={`leading-[0] ${bottom ? '' : 'wave-to-next'} ${className}`} style={bottom ? { backgroundColor: bottom } : undefined} aria-hidden="true">
      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className="block h-8 w-full md:h-14"
      >
        <path
          fill={top}
          d="M0,0 H1440 V38 C1200,86 1040,86 720,52 C420,20 240,20 0,46 Z"
        />
      </svg>
    </div>
  )
}
