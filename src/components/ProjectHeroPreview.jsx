/**
 * ProjectHeroPreview.jsx
 * Full-screen project preview shown on dock hover.
 * Background: animated multi-colour blobs — unique palette per project.
 */

const IS_VIDEO = /\.(mp4|webm|mov)$/i;

/**
 * Per-project blob colour palettes.
 * Three RGBA strings per project: [dominant, secondary, accent].
 * Chosen to reflect each product's visual identity.
 */
const PROJECT_GRADIENTS = {
  healthcare: [
    'rgba(45, 106, 159, 0.38)',   // clinical blue
    'rgba(32, 178, 170, 0.28)',   // teal / sterile
    'rgba(99, 102, 241, 0.22)',   // soft indigo
  ],
  meatinspector: [
    'rgba(46, 109, 180, 0.38)',   // government blue
    'rgba(30,  64, 175, 0.28)',   // deep navy
    'rgba(71,  85, 105, 0.24)',   // slate / steel
  ],
  trailar: [
    'rgba(45, 106,  69, 0.38)',   // forest green
    'rgba(101,163,  13, 0.28)',   // lime / canopy
    'rgba(146, 104,  47, 0.22)',  // warm earth / bark
  ],
  vosyn: [
    'rgba(124,  77, 204, 0.38)',  // deep purple
    'rgba(168,  85, 247, 0.28)',  // violet
    'rgba(217,  70, 239, 0.22)',  // fuchsia
  ],
  mealplanner: [
    'rgba(196, 120,  42, 0.38)',  // warm orange
    'rgba(245, 158,  11, 0.30)',  // amber
    'rgba(234,  88,  12, 0.24)',  // deep orange
  ],
  aurora: [
    'rgba(201, 168,  76, 0.38)',  // gold
    'rgba(251, 191,  36, 0.28)',  // yellow-gold
    'rgba(217, 119,   6, 0.22)',  // amber / bronze
  ],
  autonomous: [
    'rgba( 14, 165, 233, 0.38)',  // signal blue
    'rgba(  6, 182, 212, 0.30)',  // cyan / HUD
    'rgba( 99, 102, 241, 0.22)',  // indigo
  ],
};

const FALLBACK = [
  'rgba(120,120,120,0.30)',
  'rgba(80, 80, 80, 0.22)',
  'rgba(60, 60, 60, 0.16)',
];

function blob(color) {
  return `radial-gradient(ellipse at center, ${color} 0%, transparent 68%)`;
}

function ProjectHeroPreview({ project, visible }) {
  const hasMedia = !!project?.previewMedia;
  const isVideo  = hasMedia && IS_VIDEO.test(project.previewMedia);

  const [c1, c2, c3] = PROJECT_GRADIENTS[project?.id] ?? FALLBACK;

  return (
    <div
      className={`hero-preview ${visible ? 'hero-preview--visible' : 'hero-preview--hidden'}`}
      aria-hidden="true"
    >
      {/* Animated gradient background */}
      <div className="hero-preview-bg">
        <div className="gradient-blob blob-1" style={{ background: blob(c1) }} />
        <div className="gradient-blob blob-2" style={{ background: blob(c2) }} />
        <div className="gradient-blob blob-3" style={{ background: blob(c3) }} />
      </div>

      {project && (
        <>
          {/* Category · Type · Year — top left */}
          <div className="hero-preview-meta">
            <span className="hero-preview-category">
              {project.heroCategory}&nbsp;·&nbsp;{project.heroYear}
            </span>
          </div>

          {/* Project name — top left, below meta */}
          <h2 className="hero-preview-name">{project.title}</h2>

          {/* Tagline — below name */}
          <p className="hero-preview-tagline">{project.heroTagline}</p>

          {/* CTA — bottom right */}
          <div className="hero-preview-cta">
            <span>Click to open</span>
            <span>→</span>
          </div>
        </>
      )}

      {/* Image area — centered, large, below text block */}
      <div
        className="hero-preview-image-area"
        style={project?.previewImageTop ? { top: project.previewImageTop } : undefined}
      >
        {hasMedia ? (
          isVideo ? (
            <video
              key={project.previewMedia}
              className="hero-preview-media-card"
              src={project.previewMedia}
              autoPlay muted loop playsInline
            />
          ) : (
            <img
              className="hero-preview-media-card"
              src={project.previewMedia}
              alt=""
            />
          )
        ) : (
          <>
            <div className="placeholder-screen">
              <div className="placeholder-topbar" />
              <div className="placeholder-content">
                <div className="placeholder-line w-60" />
                <div className="placeholder-line w-80" />
                <div className="placeholder-line w-40" />
                <div className="placeholder-block" />
                <div className="placeholder-line w-70" />
                <div className="placeholder-line w-50" />
              </div>
            </div>
            <p className="placeholder-label">Project preview coming soon</p>
          </>
        )}
      </div>
    </div>
  );
}

export default ProjectHeroPreview;
