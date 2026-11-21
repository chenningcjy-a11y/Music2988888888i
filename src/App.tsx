/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, type CSSProperties } from 'react';

type ParticleKind = 'star' | 'flower' | 'heart' | 'dot';

interface ParticleSpec {
  id: number;
  kind: ParticleKind;
  startX: number;
  size: number;
  duration: number;
  delay: number;
  swayDuration: number;
  swayDelay: number;
  swayX: number;
  driftX: number;
  rot: number;
  maxOpacity: number;
  scaleStart: number;
  scaleEnd: number;
  tint: string;
}

const FIRST_CLAUSE = ['能', '遇', '见', '就', '是', '缘', '，'] as const;
const SECOND_CLAUSE = ['哪', '怕', '就', '匆', '匆', '一', '眼'] as const;

const WEALTH_CLAUSE = ['你', '看', '我', '像', '缺', '钱', '的', '样', '子', '吗', '？'] as const;

const PARTICLE_TINTS: Record<ParticleKind, string[]> = {
  star: ['rgba(222, 186, 174, 0.85)', 'rgba(208, 184, 210, 0.8)'],
  flower: ['rgba(232, 184, 198, 0.85)', 'rgba(222, 174, 192, 0.82)'],
  heart: ['rgba(218, 170, 190, 0.8)', 'rgba(202, 176, 208, 0.78)'],
  dot: ['rgba(255, 248, 244, 0.9)', 'rgba(238, 212, 222, 0.82)'],
};

function createDeterministicParticles(count: number): ParticleSpec[] {
  const kinds: ParticleKind[] = ['dot', 'flower', 'star', 'dot', 'heart', 'flower', 'dot', 'star'];

  return Array.from({ length: count }, (_, index) => {
    const seedA = ((index * 0.61803398875) % 1 + 1) % 1;
    const seedB = ((index * 0.38196601125 + 0.27) % 1 + 1) % 1;
    const seedC = ((index * 0.75487766625 + 0.13) % 1 + 1) % 1;

    const kind = kinds[index % kinds.length];
    const duration = 16 + seedB * 14;
    const delay = index < count - 5 ? -(seedC * duration) : seedA * 3.5;

    const baseSize =
      kind === 'dot'
        ? 4 + seedA * 5
        : kind === 'star'
          ? 9 + seedB * 7
          : kind === 'flower'
            ? 11 + seedA * 8
            : 10 + seedC * 6;

    const maxOpacity =
      kind === 'dot'
        ? 0.28 + seedA * 0.22
        : kind === 'flower'
          ? 0.2 + seedB * 0.16
          : 0.18 + seedC * 0.16;

    const palette = PARTICLE_TINTS[kind];
    const tint = palette[index % palette.length];

    return {
      id: index,
      kind,
      startX: 4 + seedA * 92,
      size: Math.round(baseSize * 10) / 10,
      duration: Math.round(duration * 10) / 10,
      delay: Math.round(delay * 10) / 10,
      swayDuration: Math.round((4.8 + seedC * 4.2) * 10) / 10,
      swayDelay: Math.round(-(seedB * 4) * 10) / 10,
      swayX: Math.round((8 + seedA * 14) * 10) / 10,
      driftX: Math.round(((seedB - 0.5) * 46) * 10) / 10,
      rot: Math.round((10 + seedC * 22) * 10) / 10,
      maxOpacity: Math.round(maxOpacity * 100) / 100,
      scaleStart: 0.82 + seedA * 0.18,
      scaleEnd: 0.96 + seedB * 0.22,
      tint,
    };
  });
}

function ParticleGlyph({ kind, size, tint }: { kind: ParticleKind; size: number; tint: string }) {
  if (kind === 'dot') {
    return (
      <span
        className="particle-dot block"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      />
    );
  }

  if (kind === 'star') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 1.5C12.55 7.4 16.6 11.45 22.5 12C16.6 12.55 12.55 16.6 12 22.5C11.45 16.6 7.4 12.55 1.5 12C7.4 11.45 11.45 7.4 12 1.5Z"
          fill={tint}
        />
      </svg>
    );
  }

  if (kind === 'flower') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <g fill={tint}>
          <ellipse cx="12" cy="5.6" rx="2.7" ry="4.1" />
          <ellipse cx="12" cy="5.6" rx="2.7" ry="4.1" transform="rotate(72 12 12)" />
          <ellipse cx="12" cy="5.6" rx="2.7" ry="4.1" transform="rotate(144 12 12)" />
          <ellipse cx="12" cy="5.6" rx="2.7" ry="4.1" transform="rotate(216 12 12)" />
          <ellipse cx="12" cy="5.6" rx="2.7" ry="4.1" transform="rotate(288 12 12)" />
        </g>
        <circle cx="12" cy="12" r="1.8" fill="rgba(255, 245, 238, 0.8)" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20.2C12 20.2 4.2 14.95 4.2 9.45C4.2 6.85 6.2 4.8 8.7 4.8C10.22 4.8 11.48 5.56 12 6.72C12.52 5.56 13.78 4.8 15.3 4.8C17.8 4.8 19.8 6.85 19.8 9.45C19.8 14.95 12 20.2 12 20.2Z"
        fill={tint}
      />
    </svg>
  );
}

function CharacterUnit({ char, index, modeKey }: { char: string; index: number; modeKey: string }) {
  const isPunctuation = char === '，' || char === '？';
  return (
    <span
      key={`${modeKey}-${index}`}
      className="char-drift"
      style={{ '--i': index } as CSSProperties}
    >
      <span className={`char-glyph${isPunctuation ? ' char-glyph--punct' : ''}`}>
        {char}
      </span>
    </span>
  );
}

export default function App() {
  const [mode, setMode] = useState<'fate' | 'wealth'>('fate');
  const particles = useMemo(() => createDeterministicParticles(28), []);

  const handleToggle = () => {
    setMode((prev) => (prev === 'fate' ? 'wealth' : 'fate'));
  };

  return (
    <main
      className="poetic-stage cursor-pointer"
      onClick={handleToggle}
      aria-label="点击屏幕切换诗句"
    >
      {/* Gentle opening veil that softly illuminates the canvas */}
      <div className="stage-veil" aria-hidden="true" />

      {/* Slow-shifting ambient light clouds */}
      <div className="ambient-layer" aria-hidden="true">
        <div className="ambient-orb ambient-orb--rose" />
        <div className="ambient-orb ambient-orb--lavender" />
        <div className="ambient-orb ambient-orb--cream" />
      </div>

      {/* Subtle upward-drifting particles */}
      <div className="particles-layer" aria-hidden="true">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle-item"
            style={
              {
                '--start-x': `${particle.startX}%`,
                '--duration': `${particle.duration}s`,
                '--delay': `${particle.delay}s`,
                '--drift-x': `${particle.driftX}px`,
                '--max-opacity': particle.maxOpacity,
                '--scale-start': particle.scaleStart,
                '--scale-end': particle.scaleEnd,
              } as CSSProperties
            }
          >
            <div
              className="particle-sway"
              style={
                {
                  '--sway-duration': `${particle.swayDuration}s`,
                  '--sway-delay': `${particle.swayDelay}s`,
                  '--sway-x': `${particle.swayX}px`,
                  '--rot': `${particle.rot}deg`,
                } as CSSProperties
              }
            >
              <ParticleGlyph
                kind={particle.kind}
                size={particle.size}
                tint={particle.tint}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Centered poetic calligraphy focal point */}
      <section className="centerpiece" onClick={(e) => e.stopPropagation()}>
        <div className="calligraphy-aura" aria-hidden="true" />

        <div
          onClick={handleToggle}
          className="sentence-breathe transition-transform duration-300 active:scale-98 cursor-pointer"
          title="点击任意处切换"
        >
          {mode === 'fate' ? (
            <h1 className="calligraphy-heading" key="fate-mode">
              <span className="calligraphy-clause">
                {FIRST_CLAUSE.map((char, idx) => (
                  <CharacterUnit key={`f1-${idx}`} char={char} index={idx} modeKey="fate-1" />
                ))}
              </span>
              <span className="calligraphy-clause">
                {SECOND_CLAUSE.map((char, idx) => (
                  <CharacterUnit
                    key={`f2-${idx}`}
                    char={char}
                    index={FIRST_CLAUSE.length + idx}
                    modeKey="fate-2"
                  />
                ))}
              </span>
            </h1>
          ) : (
            <h1 className="calligraphy-heading" key="wealth-mode">
              <span className="calligraphy-clause">
                {WEALTH_CLAUSE.map((char, idx) => (
                  <CharacterUnit key={`w1-${idx}`} char={char} index={idx} modeKey="wealth-1" />
                ))}
              </span>
            </h1>
          )}
        </div>

        <div className="poetic-divider" aria-hidden="true" />

        <div className="flex flex-col items-center gap-2">
          <p className="poetic-subtitle">
            {mode === 'fate' ? '一眼万年 · 缘起于此' : '财气外露 · 贵气逼人'}
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            className="mt-3 px-4 py-1.5 rounded-full text-xs tracking-widest font-sans transition-all duration-300 hover:scale-105 active:scale-95 shadow-xs flex items-center gap-1.5"
            style={{
              background: 'rgba(255, 255, 255, 0.55)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(198, 154, 148, 0.35)',
              color: 'rgba(116, 91, 114, 0.85)',
            }}
            title="点击切换显示内容"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span>轻触屏幕任意处切换内容</span>
          </button>
        </div>
      </section>
    </main>
  );
}
