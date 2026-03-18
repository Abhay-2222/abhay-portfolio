/**
 * SignalMap.js — signal definitions for the discovery layer
 * CELL must match DotGrid SPACING (24px)
 */
export const CELL = 24;

export const SIGNAL_0 = {
  id: 0, type: 'hello', pctX: 55, pctY: 50,
  tagColor: '#E86B2E', tag: 'Hello',
  title: 'Abhay Sharma',
  subtitle: 'Product designer & educator. I build things that feel inevitable.',
  pills: ['UX Design', 'AI Products', 'Systems Thinking'],
};

export const SIGNALS = [
  {
    id: 1, type: 'project', pctX: 72, pctY: 28,
    tagColor: '#4A90D9', tag: 'Project',
    title: 'CareSummarizer AI',
    subtitle: 'Grounded clinical summaries for utilization review workflows.',
    meta: 'Healthcare · AI · Enterprise',
  },
  {
    id: 2, type: 'project', pctX: 58, pctY: 62,
    tagColor: '#4A90D9', tag: 'Project',
    title: 'AR Trail',
    subtitle: 'Augmented reality navigation for outdoor exploration.',
    meta: 'AR · Spatial Design · Mobile',
  },
  {
    id: 3, type: 'principle', pctX: 38, pctY: 40,
    tagColor: '#8C7B6B', tag: 'Principle',
    quote: 'I design for clarity where workflows are complex, regulated, and high stakes.',
  },
  {
    id: 4, type: 'personal', pctX: 22, pctY: 68,
    tagColor: '#E86B2E', tag: 'Personal',
    title: 'Runs at 6am',
    subtitle: 'Consistency as a design principle. In work and in life.',
    meta: 'Habit · Discipline · Energy',
  },
  {
    id: 5, type: 'teaching', pctX: 48, pctY: 20,
    tagColor: '#5A8F5A', tag: 'Teaching',
    title: 'Teaching Creative Tech',
    subtitle: 'VFX, AR, VR, and game development at McMaster University.',
    meta: 'Education · Creative Technology',
  },
  {
    id: 6, type: 'personal', pctX: 78, pctY: 70,
    tagColor: '#E8A22E', tag: 'Personal',
    title: 'Shoots on film',
    subtitle: 'Photography as a way of noticing the world more carefully.',
    meta: 'Photography · Observation · Craft',
  },
  {
    id: 7, type: 'project', pctX: 64, pctY: 44,
    tagColor: '#4A90D9', tag: 'Project',
    title: 'Vosyn',
    subtitle: 'AI-powered multilingual voice synthesis platform.',
    meta: 'AI · Voice · Systems',
  },
];

export const HINT_TEXT = {
  project:   'something nearby',
  principle: 'something nearby',
  personal:  'something nearby',
  teaching:  'something nearby',
  hello:     'something nearby',
};
