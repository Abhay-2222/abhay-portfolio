/**
 * dsNavData.js — Navigation tree for Design System Builder docs-site layout
 */

export const NAV_TREE = [
  { id: 'foundation', label: 'Foundation', items: [
    { id: 'overview',    label: 'Overview'         },
    { id: 'color-roles', label: 'Color Roles'      },
    { id: 'typography',  label: 'Typography'       },
    { id: 'layout',      label: 'Layout & Spacing' },
    { id: 'tokens',      label: 'Tokens'           },
    { id: 'wcag',        label: 'WCAG Audit'       },
  ]},
  { id: 'pages', label: 'Pages', items: [
    { id: 'dashboard',   label: 'Dashboard'   },
    { id: 'form-page',   label: 'Form'        },
    { id: 'marketing',   label: 'Marketing'   },
    { id: 'mobile-page', label: 'Mobile'      },
  ]},
  { id: 'interaction-input', label: 'Interaction & Input', items: [
    { id: 'Buttons',           label: 'Buttons',           tier: 'P1' },
    { id: 'Text Fields',       label: 'Text Fields',       tier: 'P1' },
    { id: 'Form Controls',     label: 'Form Controls',     tier: 'P1' },
    { id: 'Tag Input',         label: 'Tag Input',         tier: 'P2' },
    { id: 'Range Sliders',     label: 'Range Sliders',     tier: 'P2' },
    { id: 'Rating Components', label: 'Rating Components', tier: 'P2' },
  ]},
  { id: 'navigation-layout', label: 'Navigation & Layout', items: [
    { id: 'Navigation Patterns',       label: 'Navigation Patterns',       tier: 'P2' },
    { id: 'Sidebar Application Shell', label: 'Sidebar Application Shell', tier: 'P2' },
    { id: 'Data Filter Bar',           label: 'Data Filter Bar',           tier: 'P2' },
  ]},
  { id: 'data-tables', label: 'Data & Tables', items: [
    { id: 'Data Table',     label: 'Data Table',     tier: 'P3' },
    { id: 'Kanban Board',   label: 'Kanban Board',   tier: 'P3' },
    { id: 'Bar Chart',      label: 'Bar Chart',      tier: 'P3' },
    { id: 'Stats Grid',     label: 'Stats Grid',     tier: 'P3' },
    { id: 'Event Timeline', label: 'Event Timeline', tier: 'P3' },
  ]},
  { id: 'content-cards', label: 'Content & Cards', items: [
    { id: 'Cards',              label: 'Cards',              tier: 'P2' },
    { id: 'Pricing Cards',      label: 'Pricing Cards',      tier: 'P2' },
    { id: 'Data Display',       label: 'Data Display',       tier: 'P3' },
    { id: 'Notification Panel', label: 'Notification Panel', tier: 'P3' },
    { id: 'Comment Thread',     label: 'Comment Thread',     tier: 'P3' },
  ]},
  { id: 'overlays', label: 'Overlays & Dialogs', items: [
    { id: 'Modals, Tooltips & Menus', label: 'Modals, Tooltips & Menus', tier: 'P1' },
  ]},
  { id: 'feedback-status', label: 'Feedback & Status', items: [
    { id: 'Alerts, Progress & States', label: 'Alerts, Progress & States', tier: 'P1' },
    { id: 'Badges, Tags & Chips',      label: 'Badges, Tags & Chips',      tier: 'P1' },
  ]},
  { id: 'content-editing', label: 'Content Editing', items: [
    { id: 'Rich Text Editor', label: 'Rich Text Editor', tier: 'P3' },
    { id: 'Accordion',        label: 'Accordion',        tier: 'P1' },
    { id: 'Date Picker',      label: 'Date Picker',      tier: 'P2' },
    { id: 'Video Player',     label: 'Video Player',     tier: 'P3' },
  ]},
  { id: 'motion', label: 'Animation & Motion', items: [
    { id: 'Motion System', label: 'Motion System', tier: 'P3' },
  ]},
];

/** Flat map of all nav item ids → their group label */
export const PAGE_GROUP_MAP = {};
NAV_TREE.forEach(group => {
  group.items.forEach(item => {
    PAGE_GROUP_MAP[item.id] = group.label;
  });
});

/** Flat list of all component items (non-foundation) with their tier */
export const ALL_COMPONENTS = NAV_TREE
  .filter(g => g.id !== 'foundation')
  .flatMap(g => g.items);
