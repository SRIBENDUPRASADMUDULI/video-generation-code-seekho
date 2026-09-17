import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SubtitleBar } from './AvatarScene';

/**
 * ExplainerScene — ShikshaSetu Pedagogical Card with Concept Radar
 * Features:
 * - Left: Staggered white pedagogical cards with saffron keyword highlights
 * - Right: ShikshaSetu Concept Radar with concentric rings & orbiting nodes
 * - Full indigenous language font support ('Noto Sans Ol Chiki' for Santhali)
 */
export function ExplainerScene({
  heading = 'Concept Overview',
  bullets = [],
  highlights = [],
  audioDuration = 10,
  subtitleWords = [],
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalFrames = Math.max(Math.round(audioDuration * fps), 300);

  // Gentle camera zoom
  const dollyScale = interpolate(frame, [0, totalFrames], [1, 1.02], {
    extrapolateRight: 'clamp',
  });

  // Heading entrance spring
  const headingSpring = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 100, mass: 0.8 },
  });
  const headingOpacity = interpolate(headingSpring, [0, 1], [0, 1]);
  const headingY = interpolate(headingSpring, [0, 1], [-20, 0]);

  // Underline animation
  const underlineWidth = interpolate(frame, [8, 32], [0, 140], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Orbital rotation for the concept radar
  const radarRotation = frame * 0.6;
  const radarPulse = Math.sin(frame * 0.08) * 3;

  // Active concept tracking based on frame progression
  const activeBulletIdx = Math.min(
    bullets.length - 1,
    Math.max(0, Math.floor((frame / Math.max(1, totalFrames * 0.85)) * bullets.length))
  );

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#F4F7F5',
        backgroundImage: `
          radial-gradient(ellipse at 15% 20%, rgba(19, 78, 63, 0.08) 0%, transparent 55%),
          radial-gradient(ellipse at 85% 75%, rgba(234, 88, 12, 0.06) 0%, transparent 55%)
        `,
        color: '#111827',
        padding: '38px 60px 85px 60px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Noto Sans Ol Chiki", "Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transform: `scale(${dollyScale})`,
      }}
    >
      {/* Background pedagogical grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(19, 78, 63, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(19, 78, 63, 0.035) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Section */}
      <div
        style={{
          opacity: headingOpacity,
          transform: `translateY(${headingY}px)`,
          marginBottom: '20px',
          zIndex: 10,
        }}
      >
        {/* Category Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 16px',
            background: '#EBF4F0',
            border: '1.5px solid #D1E3DA',
            borderRadius: 999,
            marginBottom: 10,
            marginLeft: 175,
          }}
        >
          <span style={{ fontSize: 13, color: '#EA580C' }}>✦</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1.5,
              color: '#134E3F',
              textTransform: 'uppercase',
            }}
          >
            SHIKSHASETU CONCEPT EXPLAINER
          </span>
        </div>

        {/* Main Heading */}
        <h1
          style={{
            fontSize: '40px',
            fontWeight: 800,
            margin: '0 0 8px 0',
            letterSpacing: '-0.01em',
            color: '#134E3F',
            lineHeight: 1.25,
          }}
        >
          {heading}
        </h1>

        {/* Animated Saffron Underline */}
        <div
          style={{
            height: 4,
            width: underlineWidth,
            borderRadius: 4,
            background: 'linear-gradient(90deg, #EA580C 0%, #F97316 100%)',
            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.35)',
          }}
        />
      </div>

      {/* Main Body: Left Bullets (63%) + Right Concept Radar (37%) */}
      <div style={{ display: 'flex', gap: 32, flex: 1, zIndex: 10, alignItems: 'center' }}>
        {/* Left Bullet Points */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            width: '63%',
            maxWidth: 730,
          }}
        >
          {bullets.map((bullet, i) => {
            const delay = 10 + i * 14;
            const slideProgress = spring({
              frame: frame - delay,
              fps,
              config: { damping: 14, stiffness: 100, mass: 0.7 },
            });
            const slideX = interpolate(slideProgress, [0, 1], [-35, 0]);
            const slideOpacity = interpolate(slideProgress, [0, 1], [0, 1]);

            // Highlight terms replacement
            let processedHtml = bullet;
            if (Array.isArray(highlights) && highlights.length > 0) {
              highlights.forEach((hl) => {
                if (!hl || typeof hl !== 'string') return;
                try {
                  const escaped = hl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const regex = new RegExp(`(${escaped})`, 'gi');
                  processedHtml = processedHtml.replace(
                    regex,
                    '<span style="color:#C2410C; background:#FFF7ED; padding:2px 8px; border-radius:6px; font-weight:800; border:1px solid #FDBA74;">$1</span>'
                  );
                } catch (_) {}
              });
            }

            const isCurrent = i === activeBulletIdx;
            const borderAccent = isCurrent ? '#EA580C' : '#134E3F';

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  opacity: slideOpacity,
                  transform: `translateX(${slideX}px) scale(${isCurrent ? 1.02 : 1})`,
                  background: isCurrent ? '#FFFFFF' : 'rgba(255, 255, 255, 0.92)',
                  padding: '14px 22px',
                  borderRadius: '16px',
                  border: `1.5px solid ${isCurrent ? '#EA580C' : '#D1E3DA'}`,
                  borderLeft: `5px solid ${borderAccent}`,
                  boxShadow: isCurrent
                    ? '0 10px 30px rgba(19, 78, 63, 0.12), 0 2px 6px rgba(0,0,0,0.04)'
                    : '0 4px 14px rgba(19, 78, 63, 0.05)',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Numeric Pill */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: isCurrent ? '#EA580C' : '#134E3F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#FFFFFF',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(19, 78, 63, 0.15)',
                  }}
                >
                  0{i + 1}
                </div>

                {/* Bullet text */}
                <div
                  style={{
                    fontSize: '20px',
                    lineHeight: 1.45,
                    color: '#1F2937',
                    fontWeight: isCurrent ? 600 : 500,
                  }}
                  dangerouslySetInnerHTML={{ __html: processedHtml }}
                />
              </div>
            );
          })}
        </div>

        {/* Right Side: ShikshaSetu Animated Concept Radar */}
        <div
          style={{
            width: '35%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transform: 'translateY(-20px)',
          }}
        >
          {/* Radar Canvas */}
          <div
            style={{
              width: 260,
              height: 260,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Outer Rotating Grid Rings */}
            <svg
              width="260"
              height="260"
              viewBox="0 0 260 260"
              style={{
                position: 'absolute',
                transform: `rotate(${radarRotation}deg)`,
              }}
            >
              <circle
                cx="130"
                cy="130"
                r="115"
                fill="none"
                stroke="rgba(19, 78, 63, 0.25)"
                strokeWidth="1.5"
                strokeDasharray="8 6"
              />
              <circle
                cx="130"
                cy="130"
                r="85"
                fill="none"
                stroke="rgba(16, 185, 129, 0.3)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              {/* Radial crosshairs */}
              <line x1="130" y1="10" x2="130" y2="250" stroke="rgba(19,78,63,0.1)" strokeWidth="1" />
              <line x1="10" y1="130" x2="250" y2="130" stroke="rgba(19,78,63,0.1)" strokeWidth="1" />
            </svg>

            {/* Pulsing Central Core */}
            <div
              style={{
                width: 74 + radarPulse,
                height: 74 + radarPulse,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #134E3F 0%, #0F3E33 100%)',
                border: '2px solid #86EFAC',
                boxShadow: '0 8px 24px rgba(19, 78, 63, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              <span style={{ fontSize: 20 }}>🌿</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#FFFFFF', letterSpacing: 1 }}>
                FLN CORE
              </span>
            </div>

            {/* 4 Orbiting Concept Nodes */}
            {[
              { label: 'Rules', icon: '✦', color: '#134E3F', angle: 0 },
              { label: 'Flow', icon: '⚡', color: '#EA580C', angle: 90 },
              { label: 'Data', icon: '🔄', color: '#10B981', angle: 180 },
              { label: 'Scope', icon: '🎯', color: '#0284C7', angle: 270 },
            ].map((node, i) => {
              const rad = ((node.angle + frame * 0.4) * Math.PI) / 180;
              const radius = 95;
              const x = 130 + Math.cos(rad) * radius - 20;
              const y = 130 + Math.sin(rad) * radius - 20;
              const isActive = i === activeBulletIdx;

              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: x,
                    top: y,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: isActive ? node.color : '#FFFFFF',
                    border: `2px solid ${node.color}`,
                    boxShadow: isActive
                      ? `0 6px 18px rgba(19,78,63,0.25)`
                      : `0 2px 8px rgba(0,0,0,0.06)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? '#FFFFFF' : node.color,
                    fontSize: 16,
                    fontWeight: 800,
                    transform: `scale(${isActive ? 1.25 : 1})`,
                    transition: 'all 0.15s ease',
                    zIndex: 15,
                  }}
                >
                  {node.icon}
                </div>
              );
            })}
          </div>

          {/* Animated Progress Gauge */}
          <div
            style={{
              width: '85%',
              background: '#FFFFFF',
              border: '1px solid #D1E3DA',
              borderRadius: 14,
              padding: '10px 16px',
              marginTop: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              boxShadow: '0 4px 14px rgba(19, 78, 63, 0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, color: '#134E3F' }}>
              <span>PEDAGOGICAL MASTERY</span>
              <span>{Math.round(((activeBulletIdx + 1) / Math.max(1, bullets.length)) * 100)}%</span>
            </div>
            <div style={{ width: '100%', height: 7, borderRadius: 99, background: '#E2ECE8', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${((activeBulletIdx + 1) / Math.max(1, bullets.length)) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #134E3F 0%, #10B981 100%)',
                  borderRadius: 99,
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Subtitle Bar */}
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} />
    </div>
  );
}

export default ExplainerScene;