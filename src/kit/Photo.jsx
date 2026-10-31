import { framed } from './framing.js'

// A photo that fills its frame, with the framing the client chose in the CMS
// (./framing.js). The frame clips, so a zoomed photo stays inside it: give the
// frame its shape (aspect, rounding) through className. Every other prop
// (data-cms, alt, loading) goes on the <img>. Part of the shared kit.
export default function Photo({ src, className = '', imgClassName = '', ...rest }) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <img src={src} {...rest} className={`h-full w-full object-cover ${imgClassName}`} {...framed(src)} />
    </div>
  )
}
