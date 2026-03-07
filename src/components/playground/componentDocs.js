/**
 * componentDocs.js — Inline component documentation for Design System Builder
 * P1 = full docs (7), P2 = medium (8), P3 = basic (13)
 */

export const COMPONENT_DOCS = {

  /* ═══════════════════════════════════════════
     P1 — FULL DOCS
  ═══════════════════════════════════════════ */

  'Buttons': {
    tier: 'P1',
    status: 'stable',
    description: 'Buttons are the primary interactive trigger in your system. Every button variant maps to a specific intent — Primary for the one key action per screen, Ghost for secondary actions, Danger for irreversible operations.',
    anatomy: [
      { label: 'A', name: 'Container', required: true, desc: 'Clickable hit area. Height is derived from button.height.md token (default 36px). Min-width ensures short labels remain tappable.' },
      { label: 'B', name: 'Label', required: true, desc: 'Text inside the button. Uses body font at 13–14px. Font-weight 500–600 for legibility on colored backgrounds.' },
      { label: 'C', name: 'Leading icon', required: false, desc: 'Optional icon placed 8px before the label. Matches label color. Use 16px icons for md size, 14px for sm.' },
      { label: 'D', name: 'Trailing icon', required: false, desc: 'Optional icon after label. Common for "expand", "external link" affordances. Same sizing rules as leading icon.' },
      { label: 'E', name: 'Loading spinner', required: false, desc: 'Replaces label or trailing icon during async action. Preserves button width so layout does not shift.' },
      { label: 'F', name: 'Focus ring', required: true, desc: '2px outline at 2px offset using --ds-primary at 60% opacity. Always visible on keyboard focus, never on mouse click.' },
    ],
    usage: {
      when: [
        'Triggering a primary action (submit, save, create)',
        'Navigating to a new context with intent (not just a link)',
        'Confirming or canceling a dialog',
        'Executing a destructive operation (use Danger variant)',
      ],
      whenNot: [
        'Navigation between pages — use links or tabs instead',
        'Multiple equally weighted actions — pick one primary, rest ghost',
        'Opening a URL in a new tab — use a text link with external icon',
      ],
      dos: [
        'Use sentence case for labels (e.g., "Save changes", not "SAVE CHANGES")',
        'Limit one Primary button per view area',
        'Keep labels to 1–3 words; add icon if you need more context',
        'Maintain 8px minimum spacing between adjacent buttons',
      ],
      donts: [
        'Don\'t use icons alone in a labeled button context — always pair with text',
        'Don\'t stack more than 3 button variants on the same card',
        'Don\'t change a button to a different variant on hover',
        'Don\'t use disabled state to hide unavailability — explain why instead',
      ],
    },
    tokenKeys: [
      { key: 'button.height.sm', desc: '28px — compact contexts, inline actions' },
      { key: 'button.height.md', desc: '36px — default; most use cases' },
      { key: 'button.height.lg', desc: '44px — hero CTAs, landing pages' },
      { key: '--ds-radius', desc: 'Corner radius from your shape token' },
      { key: '--ds-primary', desc: 'Background for Primary variant' },
      { key: '--ds-primary-h', desc: 'Hover background for Primary variant' },
      { key: '--ds-shadow-sm', desc: 'Elevation for Primary button resting state' },
    ],
    a11y: {
      keyboard: [
        { key: 'Tab', action: 'Move focus to the button' },
        { key: 'Enter / Space', action: 'Activate the button' },
      ],
      aria: [
        'Use aria-disabled="true" instead of disabled when you need the button focusable in a disabled state',
        'Add aria-busy="true" + aria-label="Loading…" when in loading state',
        'Buttons that open menus need aria-haspopup="menu" and aria-expanded',
        'Icon-only buttons need aria-label describing the action',
      ],
      notes: [
        'Contrast ratio for Primary must be ≥4.5:1 (text on background)',
        'Minimum tap target: 44×44px on touch screens (use padding not height change)',
        'Never remove focus outline — use :focus-visible for mouse suppression only',
      ],
    },
    related: ['Form Controls', 'Modals, Tooltips & Menus'],
  },

  'Text Fields': {
    tier: 'P1',
    status: 'stable',
    description: 'Text fields are the foundation of data collection. Each state (Default, Focus, Error, Disabled, Success) must communicate its meaning without relying on color alone.',
    anatomy: [
      { label: 'A', name: 'Label', required: true, desc: 'Persistent label above the field. Never use placeholder as a label substitute.' },
      { label: 'B', name: 'Input container', required: true, desc: 'The bordered box housing the text cursor. Border width 1px default, 2px on focus.' },
      { label: 'C', name: 'Placeholder', required: false, desc: 'Example value shown when input is empty. Must contrast ≥3:1 against input background.' },
      { label: 'D', name: 'Helper text', required: false, desc: 'Persistent guidance beneath the field. Replaced by error message when validation fails.' },
      { label: 'E', name: 'Error message', required: false, desc: 'Validation feedback. Must include icon + text (never rely on red color alone). Links to aria-describedby on input.' },
      { label: 'F', name: 'Leading icon / prefix', required: false, desc: 'Contextual icon (e.g., search lens) or currency prefix inside the input left edge.' },
      { label: 'G', name: 'Trailing icon / clear', required: false, desc: 'Actionable icon on the right. Common: password show/hide, clear button, dropdown arrow.' },
      { label: 'H', name: 'Character count', required: false, desc: 'Shows "x/max" when maxLength is set. Turns error-colored when limit exceeded.' },
    ],
    usage: {
      when: [
        'Collecting short-form free text (name, email, search)',
        'Any validated input that needs inline error feedback',
        'Input with contextual prefix/suffix (currency, units)',
      ],
      whenNot: [
        'Selecting from a known set — use Select or Radio group',
        'Collecting long-form content — use Textarea',
        'Binary choices — use Checkbox or Toggle',
      ],
      dos: [
        'Always pair input with a visible label (above, not inside)',
        'Show error on blur, not on every keystroke',
        'Group related fields with 16px vertical gap',
        'Use autocomplete attributes (email, given-name, etc.)',
      ],
      donts: [
        'Don\'t use placeholder text as a substitute for a label',
        'Don\'t show multiple error messages at once — one concise message',
        'Don\'t shrink font below 16px on mobile (triggers iOS zoom)',
        'Don\'t disable browser autocomplete for common field types',
      ],
    },
    tokenKeys: [
      { key: '--ds-border', desc: 'Default border color' },
      { key: '--ds-primary', desc: 'Focus ring and border color' },
      { key: '--ds-bg', desc: 'Input background (default state)' },
      { key: '--ds-bg-subtle', desc: 'Disabled state background' },
      { key: '--ds-font-body', desc: 'Input text font family' },
      { key: '--ds-radius', desc: 'Input corner radius' },
    ],
    a11y: {
      keyboard: [
        { key: 'Tab', action: 'Move focus into / out of the field' },
        { key: 'Shift+Tab', action: 'Move focus backward' },
        { key: 'Any key', action: 'Type into focused field' },
      ],
      aria: [
        'Pair each input with id + <label for="..."> — never use placeholder alone',
        'Link helper and error text via aria-describedby="helper-id error-id"',
        'Mark required fields with aria-required="true" (and visible asterisk)',
        'Invalid state: aria-invalid="true" on the input element',
      ],
      notes: [
        'Focus ring must be visible — 2px outline at 2px offset minimum',
        'Error messages must not disappear in under 3 seconds',
        'Touch targets for leading/trailing icons: 44×44px minimum',
      ],
    },
    related: ['Form Controls', 'Buttons'],
  },

  'Form Controls': {
    tier: 'P1',
    status: 'stable',
    description: 'Checkboxes, radios, toggles, selects, and textareas form the structured data entry layer. Each control has a distinct interaction model that must be preserved — mixing them confuses users.',
    anatomy: [
      { label: 'A', name: 'Control element', required: true, desc: 'The interactive affordance (box, circle, track). Size 16–20px; always a fixed square/circle, not text-sized.' },
      { label: 'B', name: 'Label', required: true, desc: 'Inline label to the right of the control. Clicking the label activates the control.' },
      { label: 'C', name: 'Indeterminate state', required: false, desc: 'Checkbox only. Dash icon inside box when a group is partially selected. Set via JavaScript .indeterminate property.' },
      { label: 'D', name: 'Group label', required: false, desc: 'Wraps a set of related controls in a fieldset with legend.' },
      { label: 'E', name: 'Helper / error text', required: false, desc: 'Same pattern as Text Fields. Attached to the group, not individual items.' },
    ],
    usage: {
      when: [
        'Checkbox: multi-select from a list; toggle a boolean setting',
        'Radio: single selection from a mutually exclusive list (2–7 options)',
        'Toggle/Switch: instant binary state change (no Save needed)',
        'Select: single selection from 8+ options',
      ],
      whenNot: [
        'Don\'t use checkbox for destructive confirmation — use a dialog',
        'Don\'t use radio for more than 7 options — use select instead',
        'Don\'t use toggle when action requires a Save button to take effect',
      ],
      dos: [
        'Always use fieldset + legend for radio groups',
        'Stack controls vertically when there are 3+',
        'Indent sub-options 24px under a parent checkbox',
        'Provide a "Select all" checkbox above a list of checkboxes',
      ],
      donts: [
        'Don\'t style away the native focus ring without a CSS replacement',
        'Don\'t place radio buttons in a horizontal row if labels are long',
        'Don\'t use toggle for multi-step settings — use checkboxes',
      ],
    },
    tokenKeys: [
      { key: '--ds-primary', desc: 'Checked / active state fill' },
      { key: '--ds-border', desc: 'Unchecked border' },
      { key: '--ds-bg', desc: 'Unchecked fill' },
      { key: '--ds-radius-sm', desc: 'Checkbox corner radius' },
    ],
    a11y: {
      keyboard: [
        { key: 'Tab', action: 'Move focus to control' },
        { key: 'Space', action: 'Toggle checkbox or switch' },
        { key: 'Arrow Up/Down', action: 'Navigate radio group' },
      ],
      aria: [
        'Checkbox with indeterminate: aria-checked="mixed"',
        'Toggle switch: role="switch" aria-checked="true|false"',
        'Radio group: role="radiogroup" with aria-labelledby pointing to legend',
        'Disabled items: aria-disabled="true" not just visual styling',
      ],
      notes: [
        '3:1 contrast minimum for control borders against background',
        'Hit area extends to label — use <label> wrapping or for/id pair',
        'Indeterminate state must be set via JS (.indeterminate), not just visually',
      ],
    },
    related: ['Text Fields', 'Buttons'],
  },

  'Badges, Tags & Chips': {
    tier: 'P1',
    status: 'stable',
    description: 'Small label components that communicate status, category, or selection state. Badges are read-only status indicators; chips are interactive and dismissible.',
    anatomy: [
      { label: 'A', name: 'Container', required: true, desc: 'Pill or rounded-rect shape. Height 20–24px for badge, 28px for chip.' },
      { label: 'B', name: 'Label text', required: true, desc: 'Short (1–3 words). Weight 500–600, size 11–12px. All-caps for status badges in dense UIs.' },
      { label: 'C', name: 'Leading dot / icon', required: false, desc: 'Status dot (8px circle) or 12px icon before label. Color encodes state.' },
      { label: 'D', name: 'Dismiss button', required: false, desc: 'Chips only. ×icon on trailing edge. Must have its own 24px hit area and aria-label="Remove [label]".' },
      { label: 'E', name: 'Avatar', required: false, desc: 'Contact chips: 18px avatar image/initials before the label.' },
    ],
    usage: {
      when: [
        'Badge: show status (Success, Error, Warning, Info) on a table row or card',
        'Tag: display non-interactive metadata categories on content',
        'Chip: show applied filters, selected values in multi-select',
      ],
      whenNot: [
        'Don\'t use badges for notifications counts > 99 (use 99+)',
        'Don\'t use more than 4 badge variants per screen — reduces signal',
        'Don\'t make tags look interactive if they can\'t be clicked',
      ],
      dos: [
        'Keep badge text under 3 words',
        'Use consistent color roles — Success always green, Error always red',
        'Add tooltips to truncated chip labels',
        'Allow keyboard dismissal of chips (Backspace / Delete when focused)',
      ],
      donts: [
        'Don\'t use color as the only status indicator — add icon or text',
        'Don\'t nest badges inside chips',
        'Don\'t animate badge color changes without user-initiated trigger',
      ],
    },
    tokenKeys: [
      { key: '--ds-primary-l', desc: 'Info badge background (primary tint)' },
      { key: '--ds-primary', desc: 'Info badge foreground' },
      { key: '--ds-radius-lg', desc: 'Pill shape for badges and chips' },
      { key: '--ds-font-body', desc: 'Label font family' },
    ],
    a11y: {
      keyboard: [
        { key: 'Tab', action: 'Focus a dismissible chip' },
        { key: 'Delete / Backspace', action: 'Remove focused chip' },
        { key: 'Enter', action: 'Activate interactive chip/tag' },
      ],
      aria: [
        'Dismissible chip dismiss button: aria-label="Remove [chip label]"',
        'Status badge on a table row: associate with row via aria-describedby',
        'Color-coded badges: always include a text label, never color alone',
        'Selected chip in a group: aria-selected="true"',
      ],
      notes: [
        'Contrast ≥4.5:1 for text inside all badge variants',
        'Dot-only status indicators need a visually-hidden text fallback',
        'Badge dismiss targets must be ≥24×24px (not the × character alone)',
      ],
    },
    related: ['Tag Input', 'Data Filter Bar'],
  },

  'Modals, Tooltips & Menus': {
    tier: 'P1',
    status: 'stable',
    description: 'Floating UI patterns that overlay content. Modals interrupt flow to demand attention. Tooltips surface metadata on hover. Menus present a contextual list of actions.',
    anatomy: [
      { label: 'A', name: 'Backdrop / overlay', required: false, desc: 'Modal only. Semi-transparent layer behind the dialog. Click-away closes the modal.' },
      { label: 'B', name: 'Dialog container', required: true, desc: 'White/surface panel. Max-width 480–600px. Padding 24px. border-radius --ds-radius-lg.' },
      { label: 'C', name: 'Header', required: true, desc: 'Title + optional subtitle. Close (×) button top-right, 44×44px hit area.' },
      { label: 'D', name: 'Body', required: true, desc: 'Main content. Scrollable when content exceeds viewport. Max-height ~60vh.' },
      { label: 'E', name: 'Footer / action bar', required: false, desc: 'Sticky bottom. Primary action right-aligned. Secondary/cancel left or right of primary.' },
      { label: 'F', name: 'Tooltip arrow', required: false, desc: 'Tooltip-specific. 8px triangle pointing to trigger. Use CSS clip-path or border trick.' },
      { label: 'G', name: 'Menu item', required: true, desc: 'Minimum 32px height. Icon+label+shortcut layout. Destructive items last, separated by divider.' },
    ],
    usage: {
      when: [
        'Modal: confirm a destructive action, collect multi-field input mid-flow',
        'Tooltip: explain an icon button or an unfamiliar term (hover/focus trigger)',
        'Popover: show a rich preview or quick-edit form on demand',
        'Dropdown menu: surface 3–10 contextual actions for the current item',
        'Command palette: global search/action with keyboard shortcut',
      ],
      whenNot: [
        'Don\'t use modal for simple confirmations — one-line inline message suffices',
        'Don\'t use tooltip for critical info — it\'s inaccessible on touch devices',
        'Don\'t stack modals — one at a time; queue if needed',
      ],
      dos: [
        'Trap focus inside open modal until dismissed',
        'Return focus to trigger element on close',
        'Position tooltip so it never clips the viewport edge',
        'Delay tooltip open by 300ms, close by 100ms (prevents flickering)',
      ],
      donts: [
        'Don\'t put form controls inside a tooltip',
        'Don\'t open menus on hover — only on click/Enter',
        'Don\'t use auto-close modals — require explicit user action',
      ],
    },
    tokenKeys: [
      { key: '--ds-bg-elevated', desc: 'Modal / menu panel background' },
      { key: '--ds-shadow-lg', desc: 'Elevation for modals' },
      { key: '--ds-shadow-md', desc: 'Elevation for dropdowns and popovers' },
      { key: '--ds-radius-lg', desc: 'Modal corner radius' },
      { key: '--ds-radius', desc: 'Menu panel corner radius' },
      { key: '--ds-border', desc: 'Panel border / dividers' },
    ],
    a11y: {
      keyboard: [
        { key: 'Escape', action: 'Close modal, tooltip, or menu' },
        { key: 'Tab', action: 'Move focus within modal (trapped)' },
        { key: 'Arrow Up/Down', action: 'Navigate menu items' },
        { key: 'Enter / Space', action: 'Activate focused menu item' },
        { key: 'Home / End', action: 'Jump to first / last menu item' },
      ],
      aria: [
        'Modal: role="dialog" aria-modal="true" aria-labelledby="title-id"',
        'Close button: aria-label="Close dialog"',
        'Menu: role="menu", items: role="menuitem"',
        'Trigger button: aria-haspopup="menu" aria-expanded="true|false"',
        'Tooltip: role="tooltip", trigger has aria-describedby="tooltip-id"',
      ],
      notes: [
        'Focus must move to the modal on open (first focusable element or title)',
        'Focus must return to trigger on close',
        'Backdrop click closes modal — but keyboard Escape must also work',
        'Tooltip must be reachable via keyboard (focus trigger, not just hover)',
      ],
    },
    related: ['Buttons', 'Accordion'],
  },

  'Alerts, Progress & States': {
    tier: 'P1',
    status: 'stable',
    description: 'System feedback components that communicate status without requiring user action. Alerts inform, progress tracks completion, skeletons reduce perceived latency.',
    anatomy: [
      { label: 'A', name: 'Alert container', required: true, desc: 'Full-width banner. Left border 3–4px in semantic color (Info/Success/Warning/Error). Background tinted.' },
      { label: 'B', name: 'Status icon', required: true, desc: '16px icon encoding the alert type — never rely on color alone. Matches left border color.' },
      { label: 'C', name: 'Title + body', required: true, desc: 'Title: 13px 600 weight. Body: 12px regular. Keep under 3 lines.' },
      { label: 'D', name: 'Dismiss button', required: false, desc: '×icon top-right. aria-label="Dismiss alert". Only on non-critical alerts.' },
      { label: 'E', name: 'Progress track', required: true, desc: 'Full-width track (background). Height 4–8px. border-radius --ds-radius.' },
      { label: 'F', name: 'Progress fill', required: true, desc: 'Colored bar inside track. Width = percentage. Animated via CSS transition width 0.3s ease.' },
      { label: 'G', name: 'Skeleton line', required: true, desc: 'Gray bars replacing content while loading. Height matches text line-height. Shimmer animation.' },
    ],
    usage: {
      when: [
        'Alert: surface system-level status (form saved, API error, warning)',
        'Toast: ephemeral feedback for a completed action (file uploaded, copied)',
        'Progress bar: track a known-duration operation (upload, install)',
        'Skeleton: replace content layout during initial load (not spinner)',
        'Spinner: indicate indeterminate wait (< 3s expected duration)',
      ],
      whenNot: [
        'Don\'t use inline alerts for field-level validation — use Text Field error state',
        'Don\'t auto-dismiss error alerts — only success/info toasts',
        'Don\'t show spinner for operations > 3s without a progress bar',
      ],
      dos: [
        'Always pair color with icon in alerts',
        'Position toasts top-right or bottom-center, away from primary actions',
        'Auto-dismiss success toasts after 4s (add pause on hover)',
        'Match skeleton layout to the actual content it\'s replacing',
      ],
      donts: [
        'Don\'t stack more than 3 toasts — queue them',
        'Don\'t use a red alert for warnings — use yellow/amber',
        'Don\'t animate skeleton shimmer too fast (< 1.5s) — causes distraction',
      ],
    },
    tokenKeys: [
      { key: '--ds-primary', desc: 'Info alert accent / progress fill' },
      { key: '--ds-bg-subtle', desc: 'Skeleton and empty state background' },
      { key: '--ds-border', desc: 'Alert and progress track border' },
      { key: '--ds-shadow-sm', desc: 'Toast notification elevation' },
      { key: '--ds-radius', desc: 'Alert and progress bar radius' },
    ],
    a11y: {
      keyboard: [
        { key: 'Tab', action: 'Focus dismissible alert or toast action' },
        { key: 'Escape', action: 'Dismiss focused toast' },
      ],
      aria: [
        'Error alert: role="alert" (live region, assertive) — announced immediately',
        'Info/success toast: role="status" (polite) — announced at next idle',
        'Progress bar: role="progressbar" aria-valuenow aria-valuemin aria-valuemax',
        'Indeterminate progress: aria-valuenow omitted',
        'Skeleton: aria-busy="true" on the region being loaded',
      ],
      notes: [
        'Error messages must persist until dismissed — never auto-hide',
        'Progress bar: announce completion via a live region update',
        'Toasts must be keyboard-reachable if they contain actions',
        'Don\'t move DOM focus to a toast — only to modals and dialogs',
      ],
    },
    related: ['Modals, Tooltips & Menus', 'Notification Panel'],
  },

  'Accordion': {
    tier: 'P1',
    status: 'stable',
    description: 'Progressive disclosure pattern. Accordion panels hide secondary content behind a header trigger, reducing visual noise without removing information from the page.',
    anatomy: [
      { label: 'A', name: 'Trigger / header', required: true, desc: 'Full-width clickable row. Height ≥48px. Contains title on left, chevron on right.' },
      { label: 'B', name: 'Chevron icon', required: true, desc: '16px icon. Rotates 180° when expanded. Transition: 0.2s ease. Communicates state visually.' },
      { label: 'C', name: 'Content panel', required: true, desc: 'Collapsed by default. Height animated from 0 to auto via CSS max-height or JS. Padding 16px.' },
      { label: 'D', name: 'Divider', required: false, desc: '1px border-bottom separating items. Uses --ds-border. Omit on last item.' },
    ],
    usage: {
      when: [
        'FAQ sections, settings panels, content-heavy sidebars',
        'When 30–70% of users won\'t need the collapsed content',
        'Mobile views where vertical space is constrained',
      ],
      whenNot: [
        'Don\'t use for primary navigation — use tabs or sidebar',
        'Don\'t auto-collapse content the user just expanded',
        'Don\'t nest accordions more than 2 levels deep',
      ],
      dos: [
        'Keep one item expanded at a time (single-expand mode) for FAQs',
        'Allow multi-expand for settings or reference panels',
        'Animate open/close with CSS max-height or clip-path',
        'Scroll newly expanded item into view if it\'s off-screen',
      ],
      donts: [
        'Don\'t truncate the trigger label — it\'s the user\'s only preview of the content',
        'Don\'t use icons instead of chevrons to indicate state',
        'Don\'t put form submissions inside accordion panels without save feedback',
      ],
    },
    tokenKeys: [
      { key: '--ds-border', desc: 'Divider color between items' },
      { key: '--ds-fg', desc: 'Trigger title text color' },
      { key: '--ds-text-muted', desc: 'Content body text color' },
      { key: '--ds-bg', desc: 'Panel background (collapsed and open)' },
      { key: '--ds-primary', desc: 'Chevron icon color (open state)' },
    ],
    a11y: {
      keyboard: [
        { key: 'Tab', action: 'Focus the accordion header' },
        { key: 'Enter / Space', action: 'Toggle the panel open or closed' },
        { key: 'Arrow Down', action: 'Move focus to next header' },
        { key: 'Arrow Up', action: 'Move focus to previous header' },
        { key: 'Home', action: 'Move focus to first header' },
        { key: 'End', action: 'Move focus to last header' },
      ],
      aria: [
        'Trigger button: aria-expanded="true|false" aria-controls="panel-id"',
        'Content panel: id="panel-id" role="region" aria-labelledby="trigger-id"',
        'Wrap accordion in a <section> or <div role="presentation">',
      ],
      notes: [
        'aria-expanded must update on every toggle',
        'Content panel must not use display:none during animation — use visibility or opacity instead of cutting off the content',
        'Consider aria-level if headers are inside a hierarchy',
      ],
    },
    related: ['Modals, Tooltips & Menus', 'Navigation Patterns'],
  },

  /* ═══════════════════════════════════════════
     P2 — MEDIUM DOCS
  ═══════════════════════════════════════════ */

  'Tag Input': {
    tier: 'P2',
    status: 'stable',
    description: 'Multi-value input where each selection becomes a dismissible chip inline with the text cursor. Used for email recipients, label assignment, keyword tagging.',
    anatomy: [
      { label: 'A', name: 'Chip row + input', required: true, desc: 'Flex-wrap container: chips + live text input coexist. Input grows to fill remaining width.' },
      { label: 'B', name: 'Tag chip', required: true, desc: '24–28px pill with label + × dismiss. Inherits color from selected palette role.' },
      { label: 'C', name: 'Suggestion dropdown', required: false, desc: 'Appears below input with filtered options. Keyboard navigable.' },
    ],
    usage: {
      when: ['Assigning multiple labels, tags, or recipients', 'Filtered multi-select with free-form entry'],
      whenNot: ['Single value selection — use a standard Select', 'Non-removable category assignment — use Badges instead'],
      dos: [
        'Allow keyboard-only operation: Enter to confirm, Backspace to remove last tag',
        'Show suggestion count ("3 of 12") when filtering',
        'Animate chip entry (scale-in) for tactile feedback',
      ],
      donts: [
        'Don\'t limit visible chips — allow scroll or wrap',
        'Don\'t remove tags without confirmation if they affect saved data',
      ],
    },
    tokenKeys: [
      { key: '--ds-primary-l', desc: 'Primary tag chip background' },
      { key: '--ds-primary', desc: 'Primary tag text and icon' },
      { key: '--ds-border', desc: 'Input field border' },
      { key: '--ds-radius-lg', desc: 'Chip pill radius' },
    ],
    a11y: {
      keyboard: [
        { key: 'Enter', action: 'Confirm typed tag or select suggestion' },
        { key: 'Backspace', action: 'Remove last chip when input is empty' },
        { key: 'Arrow Up/Down', action: 'Navigate suggestion list' },
        { key: 'Escape', action: 'Close suggestion dropdown' },
      ],
      aria: [
        'Input: role="combobox" aria-expanded aria-autocomplete="list"',
        'Each chip: role="option" or managed as a listbox item',
        'Remove button: aria-label="Remove [tag name]"',
      ],
      notes: ['Announce tag addition/removal via aria-live="polite"'],
    },
    related: ['Badges, Tags & Chips', 'Form Controls'],
  },

  'Range Sliders': {
    tier: 'P2',
    status: 'stable',
    description: 'Drag-to-set numeric value along a track. Three color roles show multi-dimensional range control — price range, filter thresholds, audio mixing.',
    anatomy: [
      { label: 'A', name: 'Track', required: true, desc: 'Full-width bar, height 4–6px. Background --ds-bg-subtle.' },
      { label: 'B', name: 'Fill', required: true, desc: 'Colored portion from min to thumb. Color encodes semantic role.' },
      { label: 'C', name: 'Thumb', required: true, desc: '16–20px circle. Draggable. Shows tooltip with current value on drag.' },
      { label: 'D', name: 'Min / Max labels', required: false, desc: 'Optional labels at track ends. 11px muted text.' },
    ],
    usage: {
      when: ['Filtering by numeric range (price, age, distance)', 'Adjusting intensity (volume, opacity, contrast)'],
      whenNot: ['Exact numeric entry — use a number input', 'More than 2 thumb handles in a single track'],
      dos: [
        'Show current value in a tooltip or inline label while dragging',
        'Snap to meaningful steps (e.g., 10, 25, 50) for cleaner UX',
      ],
      donts: ['Don\'t use sliders for binary choices — use a toggle', 'Don\'t make the track narrower than 4px'],
    },
    tokenKeys: [
      { key: '--ds-primary', desc: 'Primary track fill' },
      { key: '--ds-bg-subtle', desc: 'Unfilled track background' },
      { key: '--ds-radius-lg', desc: 'Track and thumb border-radius' },
    ],
    a11y: {
      keyboard: [
        { key: 'Arrow Left/Right', action: 'Decrease / increase value by 1 step' },
        { key: 'Page Up/Down', action: 'Jump by 10% of range' },
        { key: 'Home / End', action: 'Set to minimum / maximum value' },
      ],
      aria: ['role="slider" aria-valuemin aria-valuemax aria-valuenow aria-valuetext (human-readable)'],
      notes: ['Thumb size must be ≥24×24px for touch targets'],
    },
    related: ['Form Controls', 'Data Filter Bar'],
  },

  'Rating Components': {
    tier: 'P2',
    status: 'stable',
    description: 'User satisfaction signals in three patterns: star rating for general scoring, thumbs for binary sentiment, numeric NPS-style score display.',
    anatomy: [
      { label: 'A', name: 'Star / icon set', required: true, desc: '5 icons (star, circle, etc). Filled = selected. Half-fill optional.' },
      { label: 'B', name: 'Value label', required: false, desc: 'Numeric or text label ("4.2 / 5" or "Excellent") beside the icons.' },
      { label: 'C', name: 'Review count', required: false, desc: 'Secondary muted text "(2,341 reviews)".' },
    ],
    usage: {
      when: ['Post-purchase review, app store rating, support ticket satisfaction'],
      whenNot: ['Don\'t use star rating for NPS (0–10) — use numeric buttons', 'Don\'t allow half-star selection without visual confirmation'],
      dos: ['Provide hover preview of selection before click', 'Support keyboard selection (arrow keys + Enter)'],
      donts: ['Don\'t animate the entire star set on hover — only the hovered + previous stars'],
    },
    tokenKeys: [
      { key: '--ds-primary', desc: 'Filled star / active icon color' },
      { key: '--ds-bg-subtle', desc: 'Empty star / inactive icon fill' },
    ],
    a11y: {
      keyboard: [{ key: 'Arrow Left/Right', action: 'Decrease / increase rating' }, { key: 'Enter', action: 'Submit rating' }],
      aria: ['Wrap in role="radiogroup", each star is role="radio" aria-label="n stars"'],
      notes: ['Show selected value as text outside the icon set for screen readers'],
    },
    related: ['Form Controls', 'Badges, Tags & Chips'],
  },

  'Cards': {
    tier: 'P2',
    status: 'stable',
    description: 'Contained content units with a consistent structure. Three archetypes: feature card (image header), profile card (avatar + stats), and list card (horizontal layout).',
    anatomy: [
      { label: 'A', name: 'Card container', required: true, desc: 'White/surface background. Border or shadow elevation. border-radius --ds-radius-lg.' },
      { label: 'B', name: 'Media region', required: false, desc: 'Top image / gradient header. Aspect ratio fixed (16:9, 3:2). Never let it reflow.' },
      { label: 'C', name: 'Content area', required: true, desc: 'Padding 16–24px. Title (16px 600), subtitle (13px muted), body (13px regular).' },
      { label: 'D', name: 'Action footer', required: false, desc: 'Bottom row with CTA button(s) or metadata (date, author, tags).' },
    ],
    usage: {
      when: ['Grid of similar items (products, articles, people)', 'Scan-friendly layout where details are secondary'],
      whenNot: ['Single dominant content item — use a hero section', 'Long-form text — use a document/article layout'],
      dos: [
        'Fix card heights in a grid (CSS grid auto rows) or allow variable with top-alignment',
        'Limit to 1 primary CTA per card',
        'Use shadow-sm for resting, shadow-md on hover',
      ],
      donts: ['Don\'t nest cards inside cards', 'Don\'t put more than 3 actions in a card footer'],
    },
    tokenKeys: [
      { key: '--ds-bg-elevated', desc: 'Card surface background' },
      { key: '--ds-shadow-sm', desc: 'Resting card elevation' },
      { key: '--ds-shadow-md', desc: 'Hover card elevation' },
      { key: '--ds-radius-lg', desc: 'Card corner radius' },
      { key: '--ds-border', desc: 'Card border (alternative to shadow)' },
    ],
    a11y: {
      keyboard: [{ key: 'Tab', action: 'Focus each interactive element within card' }, { key: 'Enter', action: 'Activate card link or primary CTA' }],
      aria: [
        'If entire card is clickable: wrap in <a> with descriptive aria-label',
        'Don\'t make cards focusable containers — focus individual links/buttons inside',
      ],
      notes: ['Card image alt text must describe image content, not just "card image"'],
    },
    related: ['Pricing Cards', 'Data Display'],
  },

  'Navigation Patterns': {
    tier: 'P2',
    status: 'stable',
    description: 'Wayfinding components: topbar, sidebar nav, breadcrumb, tabs, stepper, and pagination. Each solves a different navigation depth and context.',
    anatomy: [
      { label: 'A', name: 'Active indicator', required: true, desc: 'Current location marker. Topbar: bottom-border. Sidebar: filled bg. Tabs: underline.' },
      { label: 'B', name: 'Nav item', required: true, desc: 'Icon + label. 40–48px height. 12px 500 uppercase for group labels.' },
      { label: 'C', name: 'Breadcrumb separator', required: true, desc: '/ or > between path segments. aria-hidden="true" on separator.' },
      { label: 'D', name: 'Step indicator', required: true, desc: 'Numbered circle. Completed: check icon. Active: filled primary. Future: bordered.' },
    ],
    usage: {
      when: ['Topbar: flat top-level pages (4–7 items)', 'Sidebar: hierarchical app with 5–15 sections', 'Breadcrumb: 3+ level hierarchies', 'Tabs: switching between parallel content views', 'Stepper: sequential multi-step flows', 'Pagination: table/grid with 50+ records'],
      whenNot: ['Don\'t use tabs for navigation between unrelated pages', 'Don\'t use breadcrumbs when hierarchy is only 2 levels deep'],
      dos: ['Highlight current page with both color and aria-current="page"', 'Keep pagination items to ±2 pages of current (elide others with …)'],
      donts: ['Don\'t make breadcrumb links wrap to multiple lines', 'Don\'t use tabs with more than 7 items — use a select or sidebar'],
    },
    tokenKeys: [
      { key: '--ds-primary', desc: 'Active nav item indicator' },
      { key: '--ds-primary-l', desc: 'Active item background' },
      { key: '--ds-border', desc: 'Tab underline track / nav border' },
      { key: '--ds-bg-elevated', desc: 'Sidebar and topbar surface' },
    ],
    a11y: {
      keyboard: [{ key: 'Tab', action: 'Move between nav items' }, { key: 'Arrow Left/Right', action: 'Switch tabs' }, { key: 'Enter', action: 'Navigate to link' }],
      aria: [
        'Nav: role="navigation" aria-label="Primary"',
        'Current page link: aria-current="page"',
        'Tabs: role="tablist", each tab role="tab" aria-selected, panels role="tabpanel"',
        'Breadcrumb: aria-label="Breadcrumb" on nav, last item aria-current="page"',
        'Stepper: aria-label="Step N of M" on each step button',
      ],
      notes: [],
    },
    related: ['Sidebar Application Shell', 'Accordion'],
  },

  'Data Filter Bar': {
    tier: 'P2',
    status: 'stable',
    description: 'Compound filter pattern: search input + dropdown facets + active filter chips row with a Clear all action. Enables fast refinement of large data sets.',
    anatomy: [
      { label: 'A', name: 'Search input', required: false, desc: 'Leading search icon. Clears on × click. Debounced query.' },
      { label: 'B', name: 'Filter dropdowns', required: true, desc: 'One dropdown per filterable dimension (Status, Date, Category). Shows active count badge.' },
      { label: 'C', name: 'Active chips row', required: false, desc: 'One chip per applied filter. × removes that filter. "Clear all" removes all.' },
      { label: 'D', name: 'Result count', required: false, desc: '"Showing 24 of 312 results" — updates as filters change.' },
    ],
    usage: {
      when: ['Data tables with 50+ rows', 'Product catalog, user directory, log viewer'],
      whenNot: ['Don\'t add filters to tables with fewer than 15 rows — simple sort suffices', 'Don\'t show empty filter dropdowns — only available options'],
      dos: [
        'Show applied filter count on the filter button ("Filters (3)")',
        'Persist filters across page reloads via URL params',
        'Show "No results" empty state when filters eliminate all rows',
      ],
      donts: ['Don\'t require a "Apply" button — filters should react immediately', 'Don\'t show more than 5 active filter chips inline without collapsing'],
    },
    tokenKeys: [
      { key: '--ds-primary', desc: 'Active chip border and text' },
      { key: '--ds-primary-l', desc: 'Active chip background' },
      { key: '--ds-border', desc: 'Search and dropdown borders' },
    ],
    a11y: {
      keyboard: [{ key: 'Tab', action: 'Move between filter controls' }, { key: 'Escape', action: 'Close open dropdown' }],
      aria: ['Announce result count changes via aria-live="polite"', 'Chip remove button: aria-label="Remove [filter name] filter"'],
      notes: ['Filter changes must be reflected in an accessible live region'],
    },
    related: ['Tag Input', 'Data Table'],
  },

  'Date Picker': {
    tier: 'P2',
    status: 'stable',
    description: 'Calendar-based date selector. Month grid with previous/next navigation, selected day highlighted with Primary fill, today\'s date with a dot indicator.',
    anatomy: [
      { label: 'A', name: 'Trigger input', required: true, desc: 'Text input showing formatted date. Calendar icon on trailing edge.' },
      { label: 'B', name: 'Calendar popup', required: true, desc: 'Floating panel: month/year header, 7-col grid, prev/next buttons.' },
      { label: 'C', name: 'Day cell', required: true, desc: '32–36px square. States: Default, Today (dot), Selected (filled), Disabled (muted), In-range (tinted).' },
      { label: 'D', name: 'Month navigation', required: true, desc: '< > arrow buttons on either side of month/year label.' },
    ],
    usage: {
      when: ['Booking, scheduling, filtering by date range'],
      whenNot: ['Year-of-birth input — use 3 selects (Day, Month, Year) instead', 'Single known date — allow direct text input as alternative'],
      dos: ['Support keyboard date entry in addition to the calendar UI', 'For date ranges, show a two-month view side by side', 'Disable past dates when booking future-only events'],
      donts: ['Don\'t close the calendar on month navigation — only on day select', 'Don\'t prevent text input — always allow typing the date directly'],
    },
    tokenKeys: [
      { key: '--ds-primary', desc: 'Selected day fill' },
      { key: '--ds-primary-l', desc: 'In-range day tint' },
      { key: '--ds-bg-elevated', desc: 'Calendar popup surface' },
      { key: '--ds-radius', desc: 'Day cell and popup corner radius' },
    ],
    a11y: {
      keyboard: [
        { key: 'Arrow keys', action: 'Navigate calendar days' },
        { key: 'Enter / Space', action: 'Select focused day' },
        { key: 'Page Up/Down', action: 'Previous / next month' },
        { key: 'Escape', action: 'Close calendar' },
      ],
      aria: [
        'Calendar: role="dialog" aria-label="Choose date"',
        'Day grid: role="grid", rows role="row", cells role="gridcell"',
        'Selected day: aria-selected="true"',
        'Today: aria-label="[date], today"',
        'Disabled day: aria-disabled="true"',
      ],
      notes: ['Announce month navigation via aria-live="polite" on month/year heading'],
    },
    related: ['Text Fields', 'Form Controls'],
  },

  'Pricing Cards': {
    tier: 'P2',
    status: 'stable',
    description: 'Three-tier pricing layout. Featured "Pro" tier uses Primary header color with visual elevation and a "Most Popular" badge. Feature checkmarks use Secondary-500.',
    anatomy: [
      { label: 'A', name: 'Tier name + price', required: true, desc: 'Display font for price. Billing period in muted text ("per month").' },
      { label: 'B', name: '"Most Popular" badge', required: false, desc: 'Positioned top-right or centered above card. Uses primary accent.' },
      { label: 'C', name: 'Feature list', required: true, desc: 'Checkmark + feature label per row. Unavailable features use muted text + × or —.' },
      { label: 'D', name: 'CTA button', required: true, desc: 'Full-width Primary button on featured tier. Ghost on others.' },
    ],
    usage: {
      when: ['SaaS subscription selection, service tier comparison'],
      whenNot: ['Don\'t use for more than 4 tiers — add a comparison table instead', 'Don\'t animate between pricing periods (monthly/annual) without clear toggle'],
      dos: ['Always visually differentiate the recommended tier', 'Show savings for annual billing upfront ("Save 20%")', 'Align feature rows across all tiers for easy scanning'],
      donts: ['Don\'t hide pricing — show actual numbers, not just "Contact us"', 'Don\'t put 10+ features — summarize with "Everything in Free, plus…"'],
    },
    tokenKeys: [
      { key: '--ds-primary', desc: 'Featured card header and CTA' },
      { key: '--ds-shadow-lg', desc: 'Featured card elevation' },
      { key: '--ds-radius-lg', desc: 'Card corner radius' },
    ],
    a11y: {
      keyboard: [{ key: 'Tab', action: 'Move between tier CTAs' }],
      aria: ['Featured card: aria-label="Pro plan, recommended"', 'Price: use aria-label to pronounce correctly ("29 dollars per month")'],
      notes: ['Don\'t rely on color alone to distinguish featured tier — use elevation, border, or label'],
    },
    related: ['Cards', 'Buttons'],
  },

  /* ═══════════════════════════════════════════
     P3 — BASIC DOCS
  ═══════════════════════════════════════════ */

  'Color Roles': {
    tier: 'P3',
    status: 'stable',
    description: 'Semantic color mapping layer. Palette swatches (raw hues) are assigned to roles (Primary, Secondary, Tertiary, Neutral) that drive component theming. Changing a palette swatch cascades to every component using that role.',
    anatomy: [
      { label: 'A', name: 'Swatch row', required: true, desc: '10 shades per color role (50–900). Lighter shades for backgrounds, darker for text.' },
      { label: 'B', name: 'Role label', required: true, desc: 'Primary / Secondary / Tertiary / Neutral / Warning. Semantic, not descriptive.' },
    ],
    usage: {
      when: ['Defining a new color system from a single brand color', 'Auditing which components use which palette role'],
      whenNot: ['Don\'t use raw hex colors in components — always reference --ds-* CSS variables'],
      dos: ['Keep Primary reserved for CTAs and active states only', 'Use Neutral for text, borders, and surface backgrounds'],
      donts: ['Don\'t assign the same hue to Primary and Secondary — keep them visually distinct'],
    },
    tokenKeys: [
      { key: '--ds-primary', desc: 'Main interactive color' },
      { key: '--ds-bg', desc: 'Page background' },
      { key: '--ds-fg', desc: 'Primary text color' },
      { key: '--ds-border', desc: 'Default border / divider' },
    ],
    a11y: { keyboard: [], aria: ['Ensure all color roles meet 4.5:1 contrast for normal text'], notes: ['Use the WCAG tab to audit all 14 contrast checks automatically'] },
    related: ['Badges, Tags & Chips', 'Alerts, Progress & States'],
  },

  'Sidebar Application Shell': {
    tier: 'P3',
    status: 'stable',
    description: 'Full app layout: persistent sidebar nav + content area with header and stat grid. Active nav uses Primary; avatar uses Secondary; tertiary metric uses Tertiary.',
    anatomy: [
      { label: 'A', name: 'Sidebar', required: true, desc: '220–280px wide. Fixed position on desktop, drawer on mobile.' },
      { label: 'B', name: 'Content header', required: true, desc: 'Page title + breadcrumb + action buttons.' },
      { label: 'C', name: 'Content body', required: true, desc: 'Main content area. Scrollable.' },
    ],
    usage: {
      when: ['Complex apps with 5–15 top-level sections and deep hierarchies'],
      whenNot: ['Simple single-page tools — use a topbar instead', 'Marketing pages — use a header/footer layout'],
      dos: ['Collapse sidebar to icon-only on narrow screens', 'Persist sidebar state (expanded/collapsed) in localStorage'],
      donts: ['Don\'t put more than 10 items in the top-level sidebar'],
    },
    tokenKeys: [{ key: '--ds-bg-elevated', desc: 'Sidebar surface' }, { key: '--ds-primary-l', desc: 'Active item background' }, { key: '--ds-primary', desc: 'Active item text / icon' }],
    a11y: { keyboard: [{ key: 'Tab', action: 'Navigate sidebar items' }], aria: ['Sidebar: role="navigation" aria-label="Main"'], notes: ['Sidebar must be bypassed with a "Skip to main content" link'] },
    related: ['Navigation Patterns'],
  },

  'Data Table': {
    tier: 'P3',
    status: 'stable',
    description: 'Sortable, selectable data table with status chips, inline actions, footer record count, and pagination. The most information-dense component in the system.',
    anatomy: [
      { label: 'A', name: 'Header row', required: true, desc: 'Column labels + sort arrows. Sticky on scroll. Background --ds-bg-elevated.' },
      { label: 'B', name: 'Data row', required: true, desc: '48–56px height. Hover state: --ds-bg-subtle. Selected: --ds-primary-l.' },
      { label: 'C', name: 'Row checkbox', required: false, desc: 'Leading column for multi-select. Header checkbox: select-all / indeterminate.' },
      { label: 'D', name: 'Status chip', required: false, desc: 'Inline badge showing record status. Max 1 chip per row for readability.' },
      { label: 'E', name: 'Inline actions', required: false, desc: 'Icon buttons or text links on hover. Hidden until row is hovered or focused.' },
      { label: 'F', name: 'Footer', required: false, desc: 'Record count ("Showing 1–10 of 312") + pagination controls.' },
    ],
    usage: {
      when: ['Displaying structured tabular data with 3–8 columns and 10–10k rows'],
      whenNot: ['Don\'t use for 1–2 column data — a list layout is simpler', 'Don\'t use for data with complex relationships — use a tree or graph'],
      dos: ['Support keyboard navigation within cells for accessibility', 'Freeze left columns when table is wider than viewport'],
      donts: ['Don\'t put more than 3 inline actions per row', 'Don\'t horizontally scroll the entire page — scroll only the table'],
    },
    tokenKeys: [
      { key: '--ds-bg-subtle', desc: 'Row hover background' },
      { key: '--ds-primary-l', desc: 'Selected row background' },
      { key: '--ds-border', desc: 'Row dividers and table borders' },
    ],
    a11y: { keyboard: [{ key: 'Arrow keys', action: 'Navigate cells (grid mode)' }, { key: 'Space', action: 'Select row' }], aria: ['role="grid" for interactive tables', 'Sortable column header: aria-sort="ascending|descending|none"'], notes: ['Caption or aria-label required on all tables'] },
    related: ['Data Filter Bar', 'Kanban Board'],
  },

  'Kanban Board': {
    tier: 'P3',
    status: 'stable',
    description: 'Column-based task management. Status headers + card stacks. Active "In Progress" column uses Secondary-500 to distinguish workflow state.',
    anatomy: [
      { label: 'A', name: 'Column', required: true, desc: '280–320px wide. Fixed or flex. Header shows status label + card count badge.' },
      { label: 'B', name: 'Task card', required: true, desc: 'White/surface card with title, meta (date, assignee avatar), and priority label.' },
      { label: 'C', name: 'Add card button', required: false, desc: 'Inline + button at column bottom. Ghost style.' },
    ],
    usage: {
      when: ['Task management, sprint boards, sales pipelines'],
      whenNot: ['Don\'t use for more than 7 columns — horizontal scroll breaks comprehension'],
      dos: ['Limit cards per column to 15 before virtualization', 'Show card count in column header'],
      donts: ['Don\'t rely on color alone to differentiate column status'],
    },
    tokenKeys: [{ key: '--ds-bg-subtle', desc: 'Column background' }, { key: '--ds-bg-elevated', desc: 'Task card surface' }, { key: '--ds-shadow-sm', desc: 'Card resting elevation' }],
    a11y: { keyboard: [{ key: 'Space', action: 'Pick up a card for keyboard drag' }, { key: 'Arrow keys', action: 'Move card between columns' }, { key: 'Enter', action: 'Drop card' }], aria: ['Each column: role="list", each card: role="listitem"'], notes: [] },
    related: ['Data Table', 'Cards'],
  },

  'Bar Chart': {
    tier: 'P3',
    status: 'stable',
    description: 'Data visualization with three color roles mapped to bar groups. Primary, Secondary, Tertiary bars and a legend connecting bar color to category.',
    anatomy: [
      { label: 'A', name: 'Y-axis labels', required: true, desc: 'Value scale on left. 5–6 ticks. Muted text.' },
      { label: 'B', name: 'Bars', required: true, desc: 'Grouped bars per X category. Color maps to semantic role.' },
      { label: 'C', name: 'X-axis labels', required: true, desc: 'Category labels below bars.' },
      { label: 'D', name: 'Legend', required: true, desc: 'Color swatch + label per data series.' },
      { label: 'E', name: 'Tooltip', required: false, desc: 'Value on hover. Shows all series values for that X category.' },
    ],
    usage: {
      when: ['Comparing discrete categories across 1–3 data series'],
      whenNot: ['More than 3 series — use a line chart', 'Time-series data with many points — use a line chart'],
      dos: ['Start Y-axis at 0', 'Use direct labels on bars when there are fewer than 8 bars'],
      donts: ['Don\'t use 3D bars — they distort perception of values'],
    },
    tokenKeys: [{ key: '--ds-primary', desc: 'First data series bar color' }, { key: '--ds-bg-subtle', desc: 'Grid line and axis background' }],
    a11y: { keyboard: [], aria: ['Wrap chart in figure with figcaption', 'Provide a data table alternative'], notes: ['Never rely on color alone to differentiate series — add patterns or direct labels'] },
    related: ['Stats Grid', 'Data Table'],
  },

  'Stats Grid': {
    tier: 'P3',
    status: 'stable',
    description: '2×3 metric card grid with left-border color coding per row. Row 1 Primary, Row 2 alternates Secondary and Tertiary. Each card shows KPI value with trend delta.',
    anatomy: [
      { label: 'A', name: 'Metric card', required: true, desc: 'Surface card with colored left border. Padding 20px.' },
      { label: 'B', name: 'KPI value', required: true, desc: 'Display-font large number. 28–36px.' },
      { label: 'C', name: 'Delta indicator', required: false, desc: '▲ green for positive, ▼ red for negative. Include numeric value.' },
      { label: 'D', name: 'Metric label', required: true, desc: 'Short label (2–4 words). Muted text, 12px.' },
    ],
    usage: {
      when: ['Dashboard overview — KPI summary at top of page'],
      whenNot: ['Don\'t show more than 6 stats — users stop reading beyond that'],
      dos: ['Format numbers consistently (K/M suffixes, same decimal places)', 'Color-code the left border to match the data\'s semantic role'],
      donts: ['Don\'t use red/green alone — add ▲▼ arrows for trend direction'],
    },
    tokenKeys: [{ key: '--ds-primary', desc: 'Row 1 border accent' }, { key: '--ds-bg-elevated', desc: 'Card surface' }, { key: '--ds-shadow-sm', desc: 'Card elevation' }],
    a11y: { keyboard: [], aria: ['Wrap grid in role="region" aria-label="Key metrics"', 'Trend delta: aria-label="Up 12 percent from last month"'], notes: [] },
    related: ['Bar Chart', 'Data Display'],
  },

  'Event Timeline': {
    tier: 'P3',
    status: 'stable',
    description: 'Vertical timeline with per-event color encoding — Primary, Secondary, Tertiary. Ideal for activity feeds, audit logs, and changelog displays.',
    anatomy: [
      { label: 'A', name: 'Timeline track', required: true, desc: 'Vertical line connecting events. 2px, --ds-border color.' },
      { label: 'B', name: 'Event node', required: true, desc: '12–16px circle or icon on the track. Color encodes event type.' },
      { label: 'C', name: 'Event content', required: true, desc: 'Title + timestamp + optional body text or action.' },
    ],
    usage: {
      when: ['Activity feeds, git history, audit logs, changelog'],
      whenNot: ['Simultaneous parallel events — use a Gantt chart', 'Future scheduling — use a calendar view'],
      dos: ['Show timestamps in relative format ("2 hours ago") with absolute on hover', 'Group events by day with a date divider'],
      donts: ['Don\'t rely on event dot color alone — add an icon or text label'],
    },
    tokenKeys: [{ key: '--ds-primary', desc: 'Primary event node' }, { key: '--ds-border', desc: 'Timeline track line' }],
    a11y: { keyboard: [], aria: ['Wrap in role="list", each event role="listitem"'], notes: ['Timestamps: use <time datetime="ISO-8601">'] },
    related: ['Notification Panel', 'Comment Thread'],
  },

  'Notification Panel': {
    tier: 'P3',
    status: 'stable',
    description: 'Notification list where unread items receive Primary-light background. Read items fall back to surface. Secondary-500 powers the "Mark all read" action.',
    anatomy: [
      { label: 'A', name: 'Notification item', required: true, desc: 'Avatar + message text + timestamp. Unread: --ds-primary-l background.' },
      { label: 'B', name: 'Unread dot', required: false, desc: '8px filled circle in --ds-primary. Disappears after read.' },
      { label: 'C', name: 'Mark all read', required: false, desc: 'Text link or button at panel top-right.' },
      { label: 'D', name: 'Empty state', required: true, desc: 'Illustration + "No notifications" when list is empty.' },
    ],
    usage: {
      when: ['In-app alert feed, activity notifications, mentions'],
      whenNot: ['Real-time critical system alerts — use a banner alert instead'],
      dos: ['Group notifications by date (Today, Yesterday, Earlier)', 'Show notification count badge on trigger icon (max 99+)'],
      donts: ['Don\'t auto-mark items as read without user interaction'],
    },
    tokenKeys: [{ key: '--ds-primary-l', desc: 'Unread item background' }, { key: '--ds-primary', desc: 'Unread dot + action link' }],
    a11y: { keyboard: [{ key: 'Tab', action: 'Navigate notification items' }], aria: ['Panel: role="log" aria-label="Notifications" aria-live="polite"', 'Unread count badge: aria-label="N unread notifications"'], notes: [] },
    related: ['Alerts, Progress & States', 'Event Timeline'],
  },

  'Comment Thread': {
    tier: 'P3',
    status: 'stable',
    description: 'Two-level comment thread with nested replies. Avatar colors map to palette roles. Reply links use Primary, timestamps use muted text, and nested replies have a left-border indent.',
    anatomy: [
      { label: 'A', name: 'Comment', required: true, desc: 'Avatar + author name + timestamp + body text.' },
      { label: 'B', name: 'Reply indent', required: true, desc: '24px left margin + 2px left border in --ds-border for nested replies.' },
      { label: 'C', name: 'Reply / Like actions', required: false, desc: 'Text links below comment. Reply opens an inline compose box.' },
    ],
    usage: {
      when: ['Blog comments, PR review threads, support tickets, document annotations'],
      whenNot: ['Real-time chat — use a messaging UI with different affordances', 'More than 3 nesting levels — flatten and link instead'],
      dos: ['Collapse long threads behind "Show N replies"', 'Show reply compose inline below the parent, not in a modal'],
      donts: ['Don\'t use comment threads for decision-making — document outcomes separately'],
    },
    tokenKeys: [{ key: '--ds-border', desc: 'Reply indent border' }, { key: '--ds-primary', desc: 'Reply and action link color' }, { key: '--ds-text-muted', desc: 'Timestamp and meta text' }],
    a11y: { keyboard: [], aria: ['Wrap thread in role="list", each comment role="listitem"', 'Nested replies in a child role="list"'], notes: ['Timestamps: use <time datetime="ISO-8601">'] },
    related: ['Notification Panel', 'Event Timeline'],
  },

  'Data Display': {
    tier: 'P3',
    status: 'stable',
    description: 'Stat overview cards using display typeface for KPI weight, an activity feed with color-coded avatars per team member, and a tag taxonomy row.',
    anatomy: [
      { label: 'A', name: 'Stat card', required: true, desc: 'Display font headline (KPI). Supporting text in muted body.' },
      { label: 'B', name: 'Activity feed item', required: false, desc: 'Avatar + action description + timestamp.' },
      { label: 'C', name: 'Tag row', required: false, desc: 'Horizontal scrolling chip row for taxonomy labels.' },
    ],
    usage: {
      when: ['Dashboard widgets, profile page stats, content metadata section'],
      whenNot: ['Don\'t mix stat cards and activity feeds on the same card — split into separate components'],
      dos: ['Use display font only for the primary KPI number, body font for everything else'],
      donts: ['Don\'t show more than 5 items in an activity feed widget without "See all"'],
    },
    tokenKeys: [{ key: '--ds-font-display', desc: 'KPI headline font' }, { key: '--ds-primary', desc: 'Avatar and CTA color' }],
    a11y: { keyboard: [], aria: [], notes: ['Large numeric values: use aria-label to clarify (e.g., "1.2 million")'] },
    related: ['Stats Grid', 'Cards'],
  },

  'Rich Text Editor': {
    tier: 'P3',
    status: 'stable',
    description: 'Toolbar + editable content area. Active toolbar buttons use Primary-500 fill. Editor surface uses background-elevated. Shows toolbar affordance and action grouping.',
    anatomy: [
      { label: 'A', name: 'Toolbar', required: true, desc: 'Icon buttons grouped by function (format, insert, align). Active state: --ds-primary fill.' },
      { label: 'B', name: 'Toolbar divider', required: false, desc: '1px vertical --ds-border between groups.' },
      { label: 'C', name: 'Editor content area', required: true, desc: 'contenteditable div with --ds-font-body. Min-height 120px.' },
    ],
    usage: {
      when: ['Long-form content creation: blog posts, documentation, notes'],
      whenNot: ['Short single-line input — use Text Field', 'Markdown-only interfaces — a textarea with preview is simpler'],
      dos: ['Group toolbar buttons by function', 'Show formatting preview in the editor as user types'],
      donts: ['Don\'t put more than 12 toolbar actions without overflow handling'],
    },
    tokenKeys: [{ key: '--ds-primary', desc: 'Active toolbar button fill' }, { key: '--ds-bg-elevated', desc: 'Editor surface' }, { key: '--ds-border', desc: 'Editor and toolbar borders' }],
    a11y: { keyboard: [{ key: 'Tab', action: 'Move focus between toolbar and editor' }], aria: ['Toolbar: role="toolbar" aria-label="Text formatting"', 'Each button: aria-pressed="true|false" for toggle states', 'Editor: role="textbox" aria-multiline="true" aria-label="Document content"'], notes: [] },
    related: ['Text Fields', 'Accordion'],
  },

  'Video Player': {
    tier: 'P3',
    status: 'stable',
    description: 'Static media player UI: 16:9 thumbnail area, playback controls bar with play/pause, Primary-colored scrubber progress track, volume, and fullscreen.',
    anatomy: [
      { label: 'A', name: 'Media area', required: true, desc: '16:9 aspect ratio. Placeholder background or thumbnail image.' },
      { label: 'B', name: 'Controls bar', required: true, desc: 'Gradient overlay at bottom. Play/pause + scrubber + time + volume + fullscreen.' },
      { label: 'C', name: 'Scrubber', required: true, desc: 'Progress track (same pattern as Range Slider). Primary fill = elapsed.' },
    ],
    usage: {
      when: ['Embedded video playback on product pages, tutorials, media libraries'],
      whenNot: ['Full-screen broadcast video — use native browser player or a video platform'],
      dos: ['Show play button overlay on the thumbnail for clear affordance', 'Remember playback position across page navigations'],
      donts: ['Don\'t autoplay with sound — mute by default', 'Don\'t hide controls permanently — show on hover/focus'],
    },
    tokenKeys: [{ key: '--ds-primary', desc: 'Scrubber progress fill' }, { key: '--ds-bg', desc: 'Controls bar background' }],
    a11y: { keyboard: [{ key: 'Space / K', action: 'Play / Pause' }, { key: 'Arrow Left/Right', action: 'Seek ±5 seconds' }, { key: 'Arrow Up/Down', action: 'Volume +/- 10%' }, { key: 'F', action: 'Toggle fullscreen' }], aria: ['Provide captions (WebVTT) for all video content', 'Play button: aria-label="Play" (changes to "Pause" when playing)', 'Scrubber: role="slider" aria-valuenow aria-valuemax'], notes: [] },
    related: ['Range Sliders', 'Alerts, Progress & States'],
  },

  'Motion System': {
    tier: 'P3',
    status: 'stable',
    description: 'Live animation demos for each motion token: button hover scale, card lift elevation, modal entrance, focus ring pulse, and page slide. Duration and easing adapt per preset.',
    anatomy: [
      { label: 'A', name: 'Duration tokens', required: true, desc: 'fast (100ms), base (200ms), slow (350ms). Use fast for micro-interactions, slow for page transitions.' },
      { label: 'B', name: 'Easing tokens', required: true, desc: 'ease-in-out for enter/exit, ease-out for entering, ease-in for leaving.' },
      { label: 'C', name: 'Demo cells', required: true, desc: 'Each token demonstrated with a live looping animation in the preview.' },
    ],
    usage: {
      when: ['Setting animation parameters for the entire system from a single source of truth'],
      whenNot: ['Don\'t use motion tokens for layout changes — those should be immediate'],
      dos: ['Use CSS custom properties for all durations and easings', 'Respect prefers-reduced-motion — set durations to 0.01s in the media query'],
      donts: ['Don\'t animate color changes without a purpose', 'Don\'t use spring physics for UI transitions — reserve for direct manipulation'],
    },
    tokenKeys: [
      { key: 'motion.duration.fast', desc: '100ms — hover, focus ring' },
      { key: 'motion.duration.base', desc: '200ms — button press, toggle' },
      { key: 'motion.duration.slow', desc: '350ms — modal, page transition' },
      { key: 'motion.easing.standard', desc: 'cubic-bezier for enter/exit' },
    ],
    a11y: { keyboard: [], aria: [], notes: ['Always respect prefers-reduced-motion: @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important } }'] },
    related: ['Modals, Tooltips & Menus', 'Accordion'],
  },

};
