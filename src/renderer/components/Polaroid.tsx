interface PolaroidProps {
  src: string;
  caption?: string;
  rotation?: number;
  className?: string;
}

export default function Polaroid({
  src,
  caption,
  rotation = 0,
  className = ''
}: PolaroidProps) {
  return (
    <div
      className={`polaroid ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="polaroid-image">
        <img src={src} alt={caption || 'Polaroid photo'} />
      </div>
      {caption && (
        <p className="polaroid-caption">{caption}</p>
      )}
    </div>
  );
}
