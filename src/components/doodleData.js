// Doodle definitions — redrawn for visual accuracy
// All viewBoxes 64×64 except 'as' (80×52)

export const DOODLES = [
  {
    id: 'camera',
    vb: '0 0 64 64',
    paths: [
      // Body
      'M6,24 L58,24 L58,58 L6,58 Z',
      // Top section — trapezoidal hump
      'M14,14 L50,14 L58,24 L6,24 Z',
      // Shutter button (top right)
      'M44,8 h10 v6 h-10 Z',
      // Outer lens ring
      'M32,41 m-14,0 a14,14 0 1,0 28,0 a14,14 0 1,0 -28,0',
      // Inner lens
      'M32,41 m-7,0 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0',
      // Viewfinder (top left of body)
      'M9,17 h8 v5 h-8 Z',
    ],
    heroXvw: 8,  heroYvh: 18, rotate: -14, size: 84,
  },
  {
    id: 'soccer',
    vb: '0 0 64 64',
    paths: [
      // Outer ball
      'M32,4 m-28,0 a28,28 0 1,0 56,0 a28,28 0 1,0 -56,0',
      // Centre pentagon (classic soccer ball patch)
      'M32,16 L43,24 L39,36 L25,36 L21,24 Z',
      // Seams from each vertex to the ball edge
      'M32,16 L32,4 M43,24 L57,19 M39,36 L47,56 M25,36 L17,56 M21,24 L7,19',
    ],
    heroXvw: 80, heroYvh: 12, rotate: 10,  size: 76,
  },
  {
    id: 'film',
    vb: '0 0 64 64',
    paths: [
      // Outer frame
      'M2,8 h60 v48 h-60 Z',
      // Dividers separating sprocket bands
      'M14,8 v48 M50,8 v48',
      // Left sprocket holes (4)
      'M4,13 h7 v5 h-7 Z M4,24 h7 v5 h-7 Z M4,35 h7 v5 h-7 Z M4,46 h7 v5 h-7 Z',
      // Right sprocket holes (4)
      'M53,13 h7 v5 h-7 Z M53,24 h7 v5 h-7 Z M53,35 h7 v5 h-7 Z M53,46 h7 v5 h-7 Z',
      // Centre image frame
      'M18,14 h28 v36 h-28 Z',
    ],
    heroXvw: 5,  heroYvh: 62, rotate: 14,  size: 92,
  },
  {
    id: 'cursor',
    vb: '0 0 64 64',
    paths: [
      // Arrow pointer — tip top-left, tail bottom-right
      'M10,6 L10,48 L22,36 L29,54 L38,50 L31,32 L50,32 Z',
    ],
    heroXvw: 74, heroYvh: 66, rotate: -9,  size: 70,
  },
  {
    id: 'runner',
    vb: '0 0 64 64',
    paths: [
      // Head
      'M40,8 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0',
      // Torso (leaning forward)
      'M40,18 L34,36',
      // Front leg reaching forward
      'M34,36 L22,50 L14,58',
      // Back leg pushing off
      'M34,36 L46,50 L54,44',
      // Front arm (swinging back)
      'M40,24 L54,32',
      // Back arm (reaching forward)
      'M40,24 L26,28 L16,22',
    ],
    heroXvw: 83, heroYvh: 42, rotate: 6,   size: 78,
  },
  {
    id: 'as',
    vb: '0 0 80 52',
    paths: [
      // A — clean strokes with crossbar
      'M8,48 L24,6 L40,48 M12,32 L36,32',
      // S — two-arc fluid curve
      'M60,12 C74,6 78,22 62,30 C46,38 50,50 66,50',
    ],
    heroXvw: 15, heroYvh: 52, rotate: -7,  size: 88,
  },
];
