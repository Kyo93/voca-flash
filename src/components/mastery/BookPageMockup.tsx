/**
 * 3D skeuomorphic open-book mockup.
 * Uses CSS perspective + rotateY on each page to fake the V-fold of an open book.
 * Fonts loaded in index.html: Playfair Display, Lora, Caveat.
 */

const SERIF = '"Playfair Display", "Lora", Georgia, serif'
const BODY = '"Lora", Georgia, serif'
const HAND = '"Caveat", cursive'

const PAPER_OUTER = '#fdfbf0'
const PAPER_INNER = '#d4c5a9'
const INK = '#2a1810'
const INK_SOFT = '#5a4530'
const ACCENT = '#8b5a2b'
const WOOD_DARK = '#2a1810'
const WOOD = '#3d2817'

const CELLO_IMG =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Cello_front_side.png/360px-Cello_front_side.png'

export default function BookPageMockup() {
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '3rem 1rem',
        background:
          'radial-gradient(ellipse at 50% 30%, #4a3220 0%, #1a0e08 80%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: BODY,
        // 3D perspective for the whole scene
        perspective: '1800px',
        perspectiveOrigin: '50% 40%',
      }}
    >
      {/* DESK SHADOW — large soft shadow under the book */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 'min(1450px, 96vw)',
          height: '60px',
          bottom: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, transparent 70%)',
          filter: 'blur(20px)',
          zIndex: 0,
        }}
      />

      {/* BOOK COVER — dark wood, wraps pages with 12px overhang */}
      <div
        style={{
          position: 'relative',
          width: 'min(1400px, 95vw)',
          aspectRatio: '1.85 / 1',
          padding: '14px 16px 18px 16px',
          background: `
            linear-gradient(135deg, ${WOOD} 0%, ${WOOD_DARK} 50%, ${WOOD} 100%)
          `,
          borderRadius: '16px',
          boxShadow: `
            0 2px 4px rgba(0,0,0,0.4),
            0 8px 16px rgba(0,0,0,0.5),
            0 24px 48px rgba(0,0,0,0.65),
            0 40px 80px rgba(0,0,0,0.55),
            inset 0 1px 1px rgba(255,200,140,0.15),
            inset 0 -2px 3px rgba(0,0,0,0.6)
          `,
          transformStyle: 'preserve-3d',
          // Tiny tilt to feel 3D
          transform: 'rotateX(2deg)',
        }}
      >
        {/* Wood grain texture on the cover */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '16px',
            backgroundImage: `
              repeating-linear-gradient(90deg,
                transparent 0px,
                rgba(0,0,0,0.08) 1px,
                transparent 2px,
                rgba(255,180,120,0.04) 4px,
                transparent 6px
              )
            `,
            pointerEvents: 'none',
          }}
        />

        {/* PAGES CONTAINER */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: WOOD_DARK,
            borderRadius: '4px',
            transformStyle: 'preserve-3d',
            overflow: 'visible',
          }}
        >
          {/* LEFT PAGE — rotated 5deg, hinged on right */}
          <div
            style={{
              position: 'relative',
              transform: 'rotateY(5deg)',
              transformOrigin: 'right center',
              transformStyle: 'preserve-3d',
              background: `linear-gradient(to right, ${PAPER_OUTER} 0%, #f5e8c5 60%, ${PAPER_INNER} 100%)`,
              boxShadow:
                'inset -8px 0 14px -8px rgba(74,53,32,0.4), inset 0 0 60px rgba(139,90,43,0.08)',
              padding: '3rem 3rem 2.5rem 3.5rem',
              overflow: 'hidden',
            }}
          >
            <PaperGrain />
            <CornerVignette position="tl" />
            <CornerVignette position="bl" />
            <LeftPage />
          </div>

          {/* RIGHT PAGE — rotated -5deg, hinged on left */}
          <div
            style={{
              position: 'relative',
              transform: 'rotateY(-5deg)',
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
              background: `linear-gradient(to left, ${PAPER_OUTER} 0%, #f5e8c5 60%, ${PAPER_INNER} 100%)`,
              boxShadow:
                'inset 8px 0 14px -8px rgba(74,53,32,0.4), inset 0 0 60px rgba(139,90,43,0.08)',
              padding: '2.5rem 3rem 2.5rem 3rem',
              textAlign: 'center',
              overflow: 'hidden',
            }}
          >
            <PaperGrain />
            <CornerVignette position="tr" />
            <CornerVignette position="br" />
            <RightPage />
          </div>

          {/* SPINE — center crease, sits ON TOP of both pages */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '50%',
              width: '24px',
              transform: 'translateX(-50%)',
              background: `
                linear-gradient(to right,
                  rgba(74,53,32,0.35) 0%,
                  rgba(42,24,16,0.55) 35%,
                  rgba(20,10,5,0.75) 50%,
                  rgba(42,24,16,0.55) 65%,
                  rgba(74,53,32,0.35) 100%
                )
              `,
              pointerEvents: 'none',
              zIndex: 4,
            }}
          />
          {/* Spine crease line */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '4%',
              bottom: '4%',
              left: '50%',
              width: '1px',
              transform: 'translateX(-50%)',
              background:
                'linear-gradient(to bottom, transparent, rgba(0,0,0,0.5) 10%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.5) 90%, transparent)',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />

          {/* POLAROID — overlaps spine, top-center */}
          <Polaroid />

          {/* STICKY NOTE — bottom-right */}
          <StickyNote />
        </div>
      </div>
    </div>
  )
}

function PaperGrain() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 0.18 0 0 0 0 0.11 0 0 0 0 0.05 0 0 0 0.5 0'/></filter><rect width='240' height='240' filter='url(%23n)' opacity='0.4'/></svg>\")",
        opacity: 0.55,
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  )
}

function CornerVignette({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const map = {
    tl: { top: 0, left: 0, transform: 'none' },
    tr: { top: 0, right: 0, transform: 'scaleX(-1)' },
    bl: { bottom: 0, left: 0, transform: 'scaleY(-1)' },
    br: { bottom: 0, right: 0, transform: 'scale(-1,-1)' },
  } as const
  const pos = map[position]
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        width: '120px',
        height: '120px',
        background:
          'radial-gradient(circle at 0% 0%, rgba(60,35,15,0.55) 0%, rgba(60,35,15,0.25) 30%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 2,
        ...pos,
      }}
    />
  )
}

function LeftPage() {
  return (
    <div style={{ position: 'relative', zIndex: 3 }}>
      <h2
        style={{
          fontFamily: SERIF,
          fontWeight: 900,
          fontSize: '2rem',
          color: INK,
          margin: 0,
        }}
      >
        Recent Additions
      </h2>
      <SectionLine />

      <Entry
        word="Ephemeral"
        level="B2"
        text="lasting for a very short time, when mortisnuming nurxh the mamurs of expomable."
      />
      <Entry
        word="Surreptitious"
        level="C2"
        text="lasting for a very short time, when mortisnuming nurch the mamurs of expomable."
      />
      <Entry
        word="Mellifluous"
        level="C1"
        text="mellifluous, music among, breather, cory, aepenuee, and relerable."
      />
    </div>
  )
}

function Entry({
  word,
  level,
  text,
}: {
  word: string
  level: string
  text: string
}) {
  return (
    <div style={{ marginTop: '1.5rem', maxWidth: '20rem' }}>
      <h3
        style={{
          fontFamily: SERIF,
          fontWeight: 900,
          fontSize: '1.55rem',
          color: INK,
          margin: 0,
          letterSpacing: '-0.005em',
        }}
      >
        {word}
      </h3>
      <p
        style={{
          fontFamily: BODY,
          fontSize: '0.92rem',
          color: INK_SOFT,
          lineHeight: 1.45,
          margin: '0.3rem 0 0.45rem 0',
        }}
      >
        {text}
      </p>
      <Pill level={level} />
    </div>
  )
}

function Pill({ level, big = false }: { level: string; big?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: BODY,
        fontWeight: 700,
        fontSize: big ? '0.88rem' : '0.7rem',
        color: INK_SOFT,
        border: `1px solid ${ACCENT}99`,
        padding: big ? '0.2rem 0.6rem' : '0.12rem 0.45rem',
        borderRadius: '4px',
        letterSpacing: '0.04em',
        verticalAlign: big ? 'middle' : 'baseline',
        background: 'rgba(255,255,255,0.15)',
      }}
    >
      {level}
    </span>
  )
}

function SectionLine() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        margin: '0.5rem 0 0 0',
        width: '85%',
      }}
    >
      <span style={{ flex: 1, height: '1px', background: ACCENT, opacity: 0.55 }} />
      <span
        style={{
          width: '5px',
          height: '5px',
          background: ACCENT,
          transform: 'rotate(45deg)',
          opacity: 0.7,
        }}
      />
      <span style={{ flex: 1, height: '1px', background: ACCENT, opacity: 0.55 }} />
    </div>
  )
}

function RightPage() {
  return (
    <div style={{ position: 'relative', zIndex: 3 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '0.7rem',
        }}
      >
        <h1
          style={{
            fontFamily: SERIF,
            fontWeight: 900,
            fontSize: '3.2rem',
            color: INK,
            margin: 0,
            letterSpacing: '-0.018em',
            lineHeight: 1,
          }}
        >
          Mellifluous
        </h1>
        <span style={{ marginTop: '0.55rem' }}>
          <Pill level="C2" big />
        </span>
      </div>

      <p
        style={{
          fontFamily: SERIF,
          fontSize: '1.15rem',
          color: INK_SOFT,
          margin: '0.4rem 0 0.2rem',
          letterSpacing: '0.015em',
        }}
      >
        /məˈlɪfluəs/{' '}
        <span style={{ display: 'inline-block', verticalAlign: 'middle', fontSize: '1rem' }}>
          🔊
        </span>
      </p>

      <SmallOrnate />

      <p
        style={{
          fontFamily: BODY,
          fontSize: '1.1rem',
          color: INK,
          lineHeight: 1.35,
          margin: '0.4rem 0',
        }}
      >
        sweet or musical; pleasant to hear
        <br />
        (of a voice or words)
      </p>

      <Quote text="The mellifluous tones of the cello filled the room." />

      <Field label="Word Family">
        <strong>mellifluously</strong>, mellifluousness
      </Field>

      <SmallOrnate />

      <Field label="Synonyms/Antonyms">
        sweet-sounding, musical
        <br />
        harsh, grating
      </Field>

      <SmallOrnate />

      <Field label="Common Pairings">
        mellifluous, <strong>surreptiiue</strong>
      </Field>
    </div>
  )
}

function SmallOrnate() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.3rem',
        margin: '0.4rem auto',
        color: ACCENT,
        opacity: 0.65,
        fontSize: '0.7rem',
      }}
    >
      <span style={{ width: '40px', height: '1px', background: ACCENT, opacity: 0.6 }} />
      <span style={{ fontFamily: SERIF }}>❦</span>
      <span style={{ width: '40px', height: '1px', background: ACCENT, opacity: 0.6 }} />
    </div>
  )
}

function Quote({ text }: { text: string }) {
  return (
    <div
      style={{
        position: 'relative',
        margin: '0.5rem auto 0.7rem',
        maxWidth: '24rem',
        padding: '0.4rem 1.5rem',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: '-0.3rem',
          top: '-0.6rem',
          fontSize: '2.5rem',
          fontFamily: SERIF,
          color: ACCENT,
          opacity: 0.7,
          lineHeight: 1,
        }}
      >
        “
      </span>
      <div
        style={{
          borderTop: `1px solid ${ACCENT}88`,
          borderBottom: `1px solid ${ACCENT}88`,
          padding: '0.4rem 0.5rem',
        }}
      >
        <p
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontSize: '0.95rem',
            color: INK,
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {text}
        </p>
      </div>
      <span
        style={{
          position: 'absolute',
          right: '-0.3rem',
          bottom: '-1.2rem',
          fontSize: '2.5rem',
          fontFamily: SERIF,
          color: ACCENT,
          opacity: 0.7,
          lineHeight: 1,
        }}
      >
        ”
      </span>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ margin: '0.7rem 0' }}>
      <h4
        style={{
          fontFamily: SERIF,
          fontWeight: 900,
          fontSize: '0.95rem',
          color: INK,
          margin: '0 0 0.2rem 0',
        }}
      >
        {label}
      </h4>
      <div
        style={{
          fontFamily: BODY,
          fontSize: '0.88rem',
          color: INK_SOFT,
          lineHeight: 1.45,
        }}
      >
        {children}
      </div>
    </div>
  )
}

function Polaroid() {
  return (
    <figure
      style={{
        position: 'absolute',
        top: '4%',
        left: '50%',
        transform: 'translateX(-55%) rotate(-3deg) translateZ(30px)',
        width: '170px',
        background: '#fafaf2',
        padding: '10px 10px 36px 10px',
        boxShadow:
          '0 18px 32px rgba(0,0,0,0.5), 0 6px 10px rgba(0,0,0,0.3), inset 0 0 14px rgba(220,200,170,0.4)',
        zIndex: 20,
        margin: 0,
      }}
    >
      {/* Black binder clip */}
      <div
        style={{
          position: 'absolute',
          top: '-14px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 22,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '34px',
            height: '14px',
            border: '2px solid #1a1a1a',
            borderBottom: 'none',
            borderRadius: '50% 50% 0 0',
          }}
        />
        <div
          style={{
            width: '50px',
            height: '20px',
            background:
              'linear-gradient(180deg, #3a3a3a 0%, #1a1a1a 40%, #0a0a0a 60%, #2a2a2a 100%)',
            borderRadius: '2px',
            boxShadow:
              '0 3px 5px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)',
            border: '1px solid #050505',
          }}
        />
      </div>

      {/* Photo */}
      <div
        style={{
          width: '100%',
          aspectRatio: '0.92',
          background: '#f0e0b8',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={CELLO_IMG}
          alt="Cello"
          style={{
            width: '85%',
            height: '85%',
            objectFit: 'contain',
            filter: 'sepia(0.55) contrast(1.1) brightness(0.95) saturate(0.85)',
          }}
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(74,53,32,0.3) 100%)',
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }}
        />
      </div>

      <figcaption
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '8px',
          right: '8px',
          fontFamily: HAND,
          fontSize: '0.78rem',
          color: INK,
          textAlign: 'center',
          lineHeight: 1.15,
          transform: 'rotate(-1deg)',
        }}
      >
        Think of the rich, sweet sound
        <br />
        of a cello—smooth and
        <br />
        pleasant to the ear.
      </figcaption>
    </figure>
  )
}

function StickyNote() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '2rem',
        right: '2.2rem',
        width: '170px',
        padding: '1.1rem 1rem 1rem 1rem',
        background:
          'radial-gradient(ellipse at 30% 20%, #f7eccc 0%, #ead8a3 75%, #d8c280 100%)',
        transform: 'rotate(-3deg) translateZ(20px)',
        boxShadow:
          '0 12px 22px rgba(0,0,0,0.4), 0 3px 6px rgba(0,0,0,0.25), inset 0 0 18px rgba(139,90,43,0.1)',
        zIndex: 15,
        clipPath: 'polygon(0 3%, 100% 0%, 100% 96%, 96% 100%, 4% 99%, 0 95%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-3px',
          right: '20px',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 30% 25%, #c89968 0%, #8b5a2b 55%, #4a2818 95%)',
          boxShadow:
            '0 3px 5px rgba(0,0,0,0.5), inset -2px -2px 3px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,220,180,0.5)',
          zIndex: 2,
        }}
      />
      <p
        style={{
          fontFamily: HAND,
          fontSize: '0.95rem',
          color: INK,
          lineHeight: 1.25,
          margin: 0,
        }}
      >
        Beautiful word for
        <br />
        describing sounds.
        <br />
        Reminds me of
        <br />
        classical music and
        <br />
        poetry.
        <br />‘<strong style={{ fontWeight: 700 }}>Mellifluous voice</strong>’.
      </p>
    </div>
  )
}
