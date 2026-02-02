import { useEffect, useState } from 'react';
import Polaroid from './Polaroid';

// Static imports for polaroid images
import polaroid1 from '../assets/polaroid-1.png';
import polaroid2 from '../assets/polaroid-2.png';
import polaroid3 from '../assets/polaroid-3.png';
import polaroid4 from '../assets/polaroid-4.png';
import polaroid5 from '../assets/polaroid-5.png';

interface PolaroidImage {
  src: string;
  caption?: string;
}

const ALL_POLAROIDS: PolaroidImage[] = [
  { src: polaroid1 },
  { src: polaroid2 },
  { src: polaroid3 },
  { src: polaroid4 },
  { src: polaroid5 }
];

// Random rotations for that "scattered on wall" look
const ROTATIONS = [-4, 2, -2, 3, -3, 1, -1];

function getRotation(index: number): number {
  return ROTATIONS[index % ROTATIONS.length];
}

// Shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface PolaroidGalleryProps {
  count?: number;
  rotationInterval?: number; // in ms
}

export default function PolaroidGallery({
  count = 3,
  rotationInterval = 8000 // rotate every 8 seconds
}: PolaroidGalleryProps) {
  const [displayedIndices, setDisplayedIndices] = useState<number[]>([]);

  // Initialize with random selection
  useEffect(() => {
    const shuffled = shuffleArray([...Array(ALL_POLAROIDS.length).keys()]);
    setDisplayedIndices(shuffled.slice(0, count));
  }, [count]);

  // Rotate one polaroid at a time
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedIndices((current) => {
        // Find indices not currently displayed
        const available = ALL_POLAROIDS.map((_, i) => i).filter(
          (i) => !current.includes(i)
        );

        if (available.length === 0) return current;

        // Pick random slot to replace
        const slotToReplace = Math.floor(Math.random() * current.length);
        // Pick random new image
        const newImageIndex = available[Math.floor(Math.random() * available.length)];

        const updated = [...current];
        updated[slotToReplace] = newImageIndex;
        return updated;
      });
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [rotationInterval]);

  if (displayedIndices.length === 0) return null;

  return (
    <div className="polaroid-gallery">
      {displayedIndices.map((imageIndex, slotIndex) => {
        const polaroid = ALL_POLAROIDS[imageIndex];
        if (!polaroid) return null;

        return (
          <div key={`slot-${slotIndex}`} className="relative">
            {/* Tape to pin it */}
            <div className="polaroid-tape" />
            <Polaroid
              src={polaroid.src}
              caption={polaroid.caption}
              rotation={getRotation(slotIndex + imageIndex)}
              className="w-32"
            />
          </div>
        );
      })}
    </div>
  );
}
