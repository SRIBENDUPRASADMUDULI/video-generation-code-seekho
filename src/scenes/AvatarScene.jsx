import { useCurrentFrame, useVideoConfig, interpolate, spring, Video, staticFile } from 'remotion';
import { ShikshaSetuAvatar, FlutteringButterfly } from '../components/ShikshaSetuAvatar';

// =============================================================================
// SubtitleBar -- Word-level synchronized subtitles (ShikshaSetu Spec)
// subtitleWords: [{ word, startFrame, endFrame }]
// =============================================================================
export function SubtitleBar({ subtitleWords = [], totalFrames, audioFrames }) {
  const frame = useCurrentFrame();
  if (!subtitleWords.length) return null;

  const activeIdx = subtitleWords.findIndex(w => frame >= w.startFrame && frame < w.endFrame);
  const windowStart    = Math.max(0, activeIdx - 4);
  const windowEnd      = Math.min(subtitleWords.length, windowStart + 10);
  const visible        = subtitleWords.slice(windowStart, windowEnd);
  const activeInWindow = activeIdx - windowStart;

  // Fade in quickly, fade out when audio ends
  const fadeEnd = audioFrames || totalFrames;
  const barOpacity = interpolate(frame,
    [0, 10, fadeEnd - 10, fadeEnd],
    [0, 1,  1,            0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', bottom: 24, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 80,
      opacity: barOpacity,
      padding: '0 20px',
    }}>
      <div style={{
        background: 'rgba(19, 78, 63, 0.94)',
        border: '1.5px solid #D1E3DA',
        borderRadius: 999,
        padding: '10px 28px',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        flexWrap: 'wrap', gap: '0.45em',
        boxShadow: '0 10px 30px rgba(19, 78, 63, 0.28), 0 2px 6px rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(12px)',
        maxWidth: '90%',
      }}>
        {visible.map((w, i) => {
          const isActive = i === activeInWindow;
          const isPast   = i < activeInWindow;
          return (
            <span key={windowStart + i} style={{
              fontSize: isActive ? 24 : 20,
              fontWeight: isActive ? 800 : 500,
              color: isActive ? '#FFFFFF' : isPast ? '#A7F3D0' : '#E6F4EA',
              background: isActive ? '#EA580C' : 'transparent',
              borderRadius: isActive ? 8 : 0,
              padding: isActive ? '3px 10px' : '3px 2px',
              transition: 'all 0.1s',
              boxShadow: isActive ? '0 2px 10px rgba(234, 88, 12, 0.5)' : 'none',
              fontFamily: '"Noto Sans Ol Chiki", "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
              letterSpacing: '0.02em',
            }}>
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// Word-by-word animated text reveal
function AnimatedText({ text, startFrame = 0, color = '#111827', fontSize = 22, fontWeight = 500 }) {
  const frame = useCurrentFrame();
  const words = (text || '').split(' ');
  return (
    <span style={{ lineHeight: 1.7 }}>
      {words.map((word, i) => {
        const wordFrame = Math.max(0, frame - startFrame - i * 2.5);
        const opacity   = Math.min(1, wordFrame / 8);
        const translateY = interpolate(Math.min(wordFrame, 8), [0, 8], [10, 0], { extrapolateRight: 'clamp' });
        return (
          <span key={i} style={{
            display: 'inline-block',
            opacity,
            transform: `translateY(${translateY}px)`,
            marginRight: '0.27em',
            color,
            fontSize,
            fontWeight,
          }}>{word}</span>
        );
      })}
    </span>
  );
}

// Blinking eyes with natural eyelid motion
function IndianEye({ cx, frame }) {
  const blinkCycle = frame % 130;
  const blink = blinkCycle < 6 ? interpolate(blinkCycle, [0, 3, 6], [14, 1.5, 14]) : 14;
  const gazeX = Math.sin(frame * 0.03) * 1.5;
  return (
    <g>
      <ellipse cx={cx} cy="110" rx="10" ry={blink} fill="#ffffff" />
      <ellipse cx={cx + gazeX} cy="110" rx="6.5" ry={Math.min(blink, 8.5)} fill="#2b1810" />
      <ellipse cx={cx + gazeX} cy="110" rx="3.5" ry={Math.min(blink * 0.5, 4.5)} fill="#0a0503" />
      <ellipse cx={cx + gazeX + 2} cy="107" rx="2" ry={Math.min(blink * 0.35, 2.5)} fill="#ffffff" opacity="0.9" />
    </g>
  );
}

// Animated mouth with word-synchronized open/close
function IndianMouth({ isSpeakingWord }) {
  const frame = useCurrentFrame();
  const openness = isSpeakingWord
    ? Math.abs(Math.sin(frame * 0.42)) * 14 + 3
    : 2;
  const mouthWidth = isSpeakingWord ? 22 + Math.sin(frame * 0.3) * 3 : 18;

  return (
    <g>
      <ellipse cx="100" cy="146" rx={mouthWidth} ry={openness}
        fill="#260f08" stroke="#134E3F" strokeWidth="1.5" />
      <path d={`M${100 - mouthWidth + 3} ${146 + openness * 0.8} Q100 ${148 + openness} ${100 + mouthWidth - 3} ${146 + openness * 0.8}`}
        stroke="#b86b4f" strokeWidth="1.5" fill="none" opacity="0.7" strokeLinecap="round" />
    </g>
  );
}

// Full Indian AI Educator avatar styled with ShikshaSetu Forest Green jacket & glasses
export function IndianAvatarFace({ speaking, isSpeakingWord, width = 220, height = 250 }) {
  const frame = useCurrentFrame();
  const nodY  = Math.sin(frame * 0.05) * 2.8;
  const tiltR = Math.sin(frame * 0.075) * 1.8;
  const glowR = 84 + Math.sin(frame * 0.06) * 4;

  return (
    <svg width={width} height={height} viewBox="0 0 200 240"
      style={{
        transform: `translateY(${nodY}px) rotate(${tiltR}deg)`,
        filter: 'drop-shadow(0 8px 24px rgba(19,78,63,0.22))',
        transformOrigin: '100px 180px',
        transition: 'transform 0.05s ease-out',
      }}>
      <defs>
        <radialGradient id="indianSkin" cx="42%" cy="38%">
          <stop offset="0%" stopColor="#e3a778" />
          <stop offset="70%" stopColor="#cf9563" />
          <stop offset="100%" stopColor="#b4784a" />
        </radialGradient>
        <radialGradient id="outerGlowGreen" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#134E3F" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#134E3F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="jacketGradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#134E3F" />
          <stop offset="100%" stopColor="#0B3026" />
        </linearGradient>
        <linearGradient id="mandarinCollarGreen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E6553" />
          <stop offset="100%" stopColor="#134E3F" />
        </linearGradient>
      </defs>

      {/* Outer soft halo rings */}
      <circle cx="100" cy="110" r={glowR + 14} fill="url(#outerGlowGreen)" />
      <circle cx="100" cy="110" r={glowR} fill="none" stroke="#134E3F" strokeWidth="1.5" opacity="0.3" />
      <circle cx="100" cy="110" r={glowR - 8} fill="none" stroke="#EA580C" strokeWidth="1" opacity="0.25" strokeDasharray="6 4" />

      {/* Head base */}
      <circle cx="100" cy="110" r="70" fill="#181829" />

      {/* Hair back / sides */}
      <ellipse cx="100" cy="46" rx="72" ry="32" fill="#151522" />
      <ellipse cx="42" cy="85" rx="16" ry="34" fill="#151522" />
      <ellipse cx="158" cy="85" rx="16" ry="34" fill="#151522" />

      {/* Face with authentic warm Indian skin tone */}
      <ellipse cx="100" cy="120" rx="55" ry="60" fill="url(#indianSkin)" />

      {/* Modern textured hair front */}
      <path d="M42 75 Q100 25 158 75 Q140 48 100 48 Q60 48 42 75" fill="#151522" />
      <path d="M55 60 Q100 38 145 60 Q100 44 55 60" fill="#2d2b45" opacity="0.4" />

      {/* Eyebrows */}
      <path d="M64 94 Q78 86 92 93" stroke="#2a1810" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M108 93 Q122 86 136 94" stroke="#2a1810" strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* Eyes */}
      <IndianEye cx={78} frame={frame} />
      <IndianEye cx={122} frame={frame} />

      {/* Modern Spectacles (Forest Green / Gold frame) */}
      <rect x="64" y="99" width="28" height="22" rx="6" fill="rgba(19,78,63,0.06)" stroke="#134E3F" strokeWidth="2" />
      <rect x="108" y="99" width="28" height="22" rx="6" fill="rgba(19,78,63,0.06)" stroke="#134E3F" strokeWidth="2" />
      <path d="M92 108 Q100 105 108 108" stroke="#EA580C" strokeWidth="2" fill="none" />
      <line x1="68" y1="103" x2="74" y2="103" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
      <line x1="112" y1="103" x2="118" y2="103" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx="100" cy="132" rx="5.5" ry="6" fill="#b97c4e" />

      {/* Mouth */}
      <IndianMouth isSpeakingWord={isSpeakingWord} />

      {/* Ears */}
      <ellipse cx="44" cy="118" rx="6" ry="12" fill="#cf9563" />
      <ellipse cx="156" cy="118" rx="6" ry="12" fill="#cf9563" />

      {/* Body -- ShikshaSetu Forest Green Nehru Collar */}
      <ellipse cx="100" cy="214" rx="64" ry="42" fill="url(#jacketGradGreen)" stroke="#1E6553" strokeWidth="1.5" />
      <rect x="80" y="174" width="40" height="24" rx="5" fill="url(#mandarinCollarGreen)" stroke="#134E3F" strokeWidth="1" />
      <line x1="100" y1="174" x2="100" y2="198" stroke="#0B3026" strokeWidth="2" />
      <circle cx="126" cy="198" r="4.5" fill="#EA580C" stroke="#F97316" strokeWidth="1" />
      <polygon points="126,195 127.5,197.5 130,197.5 128,199.5 129,202 126,200.5 123,202 124,199.5 122,197.5 124.5,197.5" fill="#ffffff" />
    </svg>
  );
}

// Floating vernacular educational glyph particles
const FLN_GLYPHS = ['ᱥ', 'ᱟ', 'ᱱ', 'ᱛ', '123', 'A B', '+ -', '🌿'];

function FlnParticles({ frame }) {
  return (
    <>
      {FLN_GLYPHS.map((glyph, i) => {
        const x = 6 + i * 11.5;
        const y = 14 + Math.sin(frame * 0.018 + i * 0.8) * 18;
        const s = 0.6 + Math.abs(Math.sin(frame * 0.02 + i)) * 0.5;
        const rot = Math.sin(frame * 0.02 + i) * 15;
        return (
          <div key={i} style={{
            position: 'absolute', left: `${x}%`, top: `${y}%`,
            color: i % 2 === 0 ? '#134E3F' : '#EA580C',
            fontFamily: '"Noto Sans Ol Chiki", "Plus Jakarta Sans", sans-serif',
            fontSize: 14,
            fontWeight: 700,
            opacity: 0.22 * s,
            transform: `scale(${s}) rotate(${rot}deg)`,
            pointerEvents: 'none',
            userSelect: 'none',
          }}>
            {glyph}
          </div>
        );
      })}
    </>
  );
}

export function AvatarScene({ scene, sceneIndex, sceneDurationFrames }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const totalFrames   = sceneDurationFrames || durationInFrames;
  const subtitleWords = scene?.subtitleWords ?? [];

  // Audio-synced: use actual audioDuration to time the fade-out
  const audioDurSec = scene?.audioDuration ?? (totalFrames / 30);
  const audioFrames = Math.round(audioDurSec * 30);
  const fadeStart   = Math.min(audioFrames + 15, totalFrames - 20);

  // Fade-in & Fade-out
  const fadeIn  = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [fadeStart, totalFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);

  // Slide-up entrance
  const slideUp = interpolate(frame, [0, 18], [28, 0], { extrapolateRight: 'clamp' });

  // Avatar speaks while audio is playing
  const speaking = frame > 10 && frame < audioFrames;
  const isSpeakingWord = subtitleWords.length > 0
    ? subtitleWords.some(w => frame >= w.startFrame && frame < w.endFrame)
    : speaking;

  // Parse text
  const lines    = (scene?.text || '').split('\n');
  const headline = lines[0] || '';
  const body     = lines.slice(1).join(' ').trim();

  const hasVideoAvatar = !!scene?.avatarVideoPath;

  // Ken Burns subtle camera motion for serene nature background
  const bgScale = 1.03 + Math.sin(frame * 0.015) * 0.02;
  const bgPanX = Math.cos(frame * 0.012) * 12;
  const bgPanY = Math.sin(frame * 0.018) * 8;

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: '#F4F7F5',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Noto Sans Ol Chiki", "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
      position: 'relative', overflow: 'hidden',
      opacity,
    }}>
      {/* ── Botanical Nature Background (ShikshaSetu UI Aesthetic) ── */}
      <div style={{
        position: 'absolute', inset: -20,
        backgroundImage: `url(${staticFile('shikshasetu_nature_bg.jpg')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: `scale(${bgScale}) translate(${bgPanX}px, ${bgPanY}px)`,
        filter: 'brightness(1.02) saturate(1.08)',
        zIndex: 1,
      }} />

      {/* Gentle Frosted Glass Sheen for high pedagogical readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(244, 247, 245, 0.42) 0%, rgba(235, 243, 238, 0.65) 100%)',
        backdropFilter: 'blur(3px)',
        zIndex: 2,
      }} />

      {/* ── Animated Saffron & Monarch Butterflies ── */}
      <FlutteringButterfly startX={6} startY={14} size={36} speed={1.1} color="#F97316" />
      <FlutteringButterfly startX={5} startY={74} size={32} speed={0.9} color="#FB923C" flip />
      <FlutteringButterfly startX={82} startY={15} size={40} speed={1.2} color="#F97316" />
      <FlutteringButterfly startX={91} startY={68} size={34} speed={0.85} color="#FB923C" flip />
      <FlutteringButterfly startX={48} startY={6} size={28} speed={1.3} color="#F97316" />

      {/* Main content row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 52, width: '92%', maxWidth: 1240,
        transform: `translateY(${slideUp}px)`,
        zIndex: 10,
      }}>

        {/* Avatar column */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {hasVideoAvatar ? (
            <div style={{
              width: 250, height: 290, borderRadius: 24, overflow: 'hidden',
              border: '2.5px solid #134E3F',
              boxShadow: '0 12px 36px rgba(19, 78, 63, 0.25)',
              position: 'relative', background: '#FFFFFF',
            }}>
              <Video
                src={staticFile(scene.avatarVideoPath)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(19, 78, 63, 0.9)', backdropFilter: 'blur(8px)',
                padding: '2px 10px', borderRadius: 12, border: '1px solid #D1E3DA',
                fontSize: 10, fontWeight: 800, color: '#FFFFFF', letterSpacing: 1.5,
              }}>AI PRESENTER</div>
            </div>
          ) : (
            <ShikshaSetuAvatar
              speaking={speaking}
              isSpeakingWord={isSpeakingWord}
              width={290}
              height={340}
              showNatureAura={true}
              showEqualizer={true}
            />
          )}

          {/* ShikshaSetu Teacher badge */}
          <div style={{
            fontSize: 11, color: '#134E3F', letterSpacing: 1.8, fontWeight: 800,
            background: 'rgba(255, 255, 255, 0.94)',
            border: '1.5px solid #86BFA0',
            borderRadius: 999, padding: '5px 18px',
            boxShadow: '0 4px 14px rgba(19, 78, 63, 0.1)',
            backdropFilter: 'blur(10px)',
          }}>SHIKSHASETU FLN EDUCATOR</div>
        </div>

        {/* Speech Card + Typography */}
        <div style={{ flex: 1, maxWidth: 660 }}>
          {/* Top meta row */}
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              background: '#134E3F',
              borderRadius: 999, padding: '4px 14px', fontSize: 11, color: '#FFFFFF', letterSpacing: 2, fontWeight: 800,
            }}>
              SCENE {(sceneIndex || 0) + 1}
            </div>
            {/* Audio progression bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#134E3F' }}>🔊</span>
              <div style={{ width: 90, height: 5, background: '#E2ECE8', borderRadius: 99 }}>
                <div style={{
                  width: `${Math.min(100, (frame / Math.max(audioFrames, 1)) * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #134E3F, #10B981)',
                  borderRadius: 99,
                }} />
              </div>
            </div>
          </div>

          {/* ShikshaSetu Crisp White Speech Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.96)',
            border: '2px solid #D1E3DA',
            borderRadius: 24, padding: '32px 38px',
            position: 'relative',
            boxShadow: '0 16px 45px rgba(19, 78, 63, 0.08), inset 0 1px 2px #FFFFFF',
            backdropFilter: 'blur(16px)',
          }}>
            {/* Speech pointer */}
            <div style={{
              position: 'absolute', left: -16, top: 48,
              width: 0, height: 0,
              borderTop: '10px solid transparent',
              borderBottom: '10px solid transparent',
              borderRight: '16px solid #D1E3DA',
            }} />

            {/* Headline */}
            <div style={{
              fontSize: 32, fontWeight: 800, color: '#134E3F',
              lineHeight: 1.25, marginBottom: body ? 18 : 0,
              letterSpacing: '-0.01em',
            }}>
              <AnimatedText text={headline} startFrame={8} fontSize={32} fontWeight={800} color="#134E3F" />
            </div>

            {/* Body */}
            {body && (
              <div style={{ fontSize: 20, lineHeight: 1.75, color: '#374151' }}>
                <AnimatedText text={body} startFrame={20} color="#374151" fontSize={20} fontWeight={500} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Synchronized subtitle bar */}
      <SubtitleBar subtitleWords={subtitleWords} totalFrames={totalFrames} audioFrames={audioFrames} />

      {/* Bottom animated border line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 5,
        background: `linear-gradient(90deg, #134E3F, #10B981, #EA580C, #134E3F)`,
        backgroundSize: `${200 + frame * 2}% 100%`,
      }} />
    </div>
  );
}