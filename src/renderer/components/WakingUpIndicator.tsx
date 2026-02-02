import { useState, useEffect } from 'react';
import { Moon, Sparkles } from 'lucide-react';

export function WakingUpIndicator() {
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [dots, setDots] = useState('');

  // Check initial waking up state and listen for changes
  useEffect(() => {
    // Check current state
    window.electron.memory.isWakingUp().then(({ isWakingUp }) => {
      setIsWakingUp(isWakingUp);
    });

    // Listen for changes
    const unsubscribe = window.electron.memory.onWakingUpChanged(({ isWakingUp }) => {
      setIsWakingUp(isWakingUp);
    });

    return unsubscribe;
  }, []);

  // Animate the dots
  useEffect(() => {
    if (!isWakingUp) return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, [isWakingUp]);

  if (!isWakingUp) return null;

  return (
    <div className="waking-up-indicator fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.1))',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.2), inset 0 0 20px rgba(168, 85, 247, 0.05)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Moon
          className="h-5 w-5 text-purple-400 animate-pulse"
          style={{ filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.5))' }}
        />
        <span
          className="font-handwritten text-base"
          style={{ color: 'var(--text-bright)' }}
        >
          arti is waking up{dots}
        </span>
        <Sparkles
          className="h-4 w-4 text-purple-300 animate-bounce"
          style={{
            animationDuration: '1.5s',
            filter: 'drop-shadow(0 0 3px rgba(168, 85, 247, 0.4))'
          }}
        />
      </div>
      <style>{`
        .waking-up-indicator {
          animation: float-up 0.5s ease-out, gentle-float 3s ease-in-out infinite 0.5s;
        }
        @keyframes float-up {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes gentle-float {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
}
