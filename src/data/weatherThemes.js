/**
 * weatherThemes.js
 * Six weather-themed colour palettes for the landing page.
 * Each theme drives: CSS gradient background, cube backdrop tint,
 * edge line colour, and whether the text needs to invert to white.
 */

export const WEATHER_THEMES = [
  {
    id:            'winter',
    label:         'Winter',
    dark:          false,
    // Icy pale blues — crystalline, still air
    gradient: [
      'radial-gradient(ellipse at 15% 15%, rgba(178,218,255,0.85) 0%, transparent 52%)',
      'radial-gradient(ellipse at 82% 78%, rgba(200,230,255,0.60) 0%, transparent 46%)',
      'linear-gradient(165deg, #e4f2ff 0%, #f0f8ff 45%, #ffffff 100%)',
    ].join(', '),
    backdropHex:   '#b8d8f0',
    edgeHex:       '#2244aa',
    edgeOpacity:   0.12,
  },
  {
    id:            'storm',
    label:         'Storm',
    dark:          true,
    // Heavy charcoal-blue — ominous, compressed sky
    gradient: [
      'radial-gradient(ellipse at 42% 0%,   rgba(80,100,130,0.90) 0%, transparent 55%)',
      'radial-gradient(ellipse at 76% 92%,  rgba(40,60,90,0.70)   0%, transparent 50%)',
      'linear-gradient(180deg, #2a3545 0%, #1a2535 55%, #0f1a25 100%)',
    ].join(', '),
    backdropHex:   '#1a2535',
    edgeHex:       '#aabbcc',
    edgeOpacity:   0.22,
  },
  {
    id:            'autumn',
    label:         'Autumn',
    dark:          false,
    // Burnt ambers and russet reds — dusk light through falling leaves
    gradient: [
      'radial-gradient(ellipse at 72% 14%, rgba(255,165,60,0.90)  0%, transparent 50%)',
      'radial-gradient(ellipse at 14% 82%, rgba(200,70,20,0.70)   0%, transparent 50%)',
      'linear-gradient(145deg, #ffe8b0 0%, #f08030 40%, #c04020 75%, #801808 100%)',
    ].join(', '),
    backdropHex:   '#c84820',
    edgeHex:       '#330800',
    edgeOpacity:   0.15,
  },
  {
    id:            'sunny',
    label:         'Sunny',
    dark:          false,
    // Warm golden haze — open sky, midday light
    gradient: [
      'radial-gradient(ellipse at 58% 10%, rgba(255,245,150,0.95) 0%, transparent 50%)',
      'radial-gradient(ellipse at 88% 80%, rgba(255,210,80,0.60)  0%, transparent 46%)',
      'linear-gradient(160deg, #fffce0 0%, #fff5a0 28%, #ffe060 62%, #ffcc40 100%)',
    ].join(', '),
    backdropHex:   '#ffd030',
    edgeHex:       '#554400',
    edgeOpacity:   0.10,
  },
  {
    id:            'rainy',
    label:         'Rainy',
    dark:          true,
    // Cool blue-grey mist — wet pavement, diffused light
    gradient: [
      'radial-gradient(ellipse at 28% 32%, rgba(120,150,180,0.70) 0%, transparent 55%)',
      'radial-gradient(ellipse at 74% 72%, rgba(80,110,150,0.50)  0%, transparent 50%)',
      'linear-gradient(175deg, #b0c0d0 0%, #8090a0 40%, #5a6878 70%, #3a4858 100%)',
    ].join(', '),
    backdropHex:   '#506070',
    edgeHex:       '#d8eeff',
    edgeOpacity:   0.20,
  },
  {
    id:            'thunder',
    label:         'Thunder',
    dark:          true,
    // Deep indigo-violet — electric charge, charged night
    gradient: [
      'radial-gradient(ellipse at 50% 22%, rgba(140,80,220,0.80)  0%, transparent 46%)',
      'radial-gradient(ellipse at 18% 72%, rgba(80,40,170,0.70)   0%, transparent 50%)',
      'linear-gradient(150deg, #1a0828 0%, #300a50 28%, #200840 65%, #0a0418 100%)',
    ].join(', '),
    backdropHex:   '#3d1060',
    edgeHex:       '#c8a8f0',
    edgeOpacity:   0.22,
  },
]
