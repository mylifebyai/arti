type TweetPreviewProps = {
  tweet: string | null;
};

export function TweetPreview({ tweet }: TweetPreviewProps) {
  if (!tweet) return null;

  return (
    <div
      className="synth-glow-pink relative z-10 rounded-sm p-5"
      style={{
        background:
          'linear-gradient(135deg, rgba(255, 45, 149, 0.1) 0%, rgba(178, 77, 255, 0.05) 100%)',
        border: '1px solid var(--neon-pink)'
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="synth-text-glow" style={{ color: 'var(--neon-pink)' }}>◎</span>
        <span className="text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-pink)' }}>
          Transmission Ready
        </span>
      </div>
      <p className="text-lg leading-relaxed" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
        {tweet}
      </p>
      <div className="mt-3 text-[10px] tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
        {tweet.length}/280 CHARS
      </div>
    </div>
  );
}
