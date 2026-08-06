export const HEADER = `
████████╗███████╗██╗  ██╗████████╗███╗   ███╗ ██████╗ ██████╗ ███████╗        ██╗███████╗
╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝████╗ ████║██╔═══██╗██╔══██╗██╔════╝        ██║██╔════╝
   ██║   █████╗   ╚███╔╝    ██║   ██╔████╔██║██║   ██║██║  ██║█████╗          ██║███████╗
   ██║   ██╔══╝   ██╔██╗    ██║   ██║╚██╔╝██║██║   ██║██║  ██║██╔══╝     ██   ██║╚════██║
   ██║   ███████╗██╔╝ ██╗   ██║   ██║ ╚═╝ ██║╚██████╔╝██████╔╝███████╗██╗╚█████╔╝███████║
   ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝ ╚════╝ ╚══════╝                                                     
`;

export const templates = [
  { name: 'vanilla-js', label: 'Vanilla JavaScript (vite)', dir: 'vanilla-js' },
  { name: 'vanilla-ts', label: 'Vanilla TypeScript (vite)', dir: 'vanilla-ts' },
  { name: 'vanilla-js-tweakpane', label: 'Vanilla JavaScript + Tweakpane (vite)', dir: 'vanilla-js-tweakpane' },
  { name: 'vanilla-ts-tweakpane', label: 'Vanilla TypeScript + Tweakpane (vite)', dir: 'vanilla-ts-tweakpane' }
];

// Official textmode.js add-on libraries that can be pre-installed. The `plugin`
// value is the named ESM export each package provides; `minTextmode` is the
// minimum textmode.js version the add-on peer-depends on.
export const addons = [
  {
    name: 'export',
    label: 'textmode.export.js',
    description: 'Export finished artworks (PNG, GIF, video, JSON, SVG, TXT)',
    package: 'textmode.export.js',
    plugin: 'ExportPlugin',
    minTextmode: '0.16.0'
  },
  {
    name: 'synth',
    label: 'textmode.synth.js',
    description: 'Shader-backed live-coded synth scenes',
    package: 'textmode.synth.js',
    plugin: 'SynthPlugin',
    minTextmode: '0.16.0'
  },
  {
    name: 'figlet',
    label: 'textmode.figlet.js',
    description: 'FIGlet display typography',
    package: 'textmode.figlet.js',
    plugin: 'FigletPlugin',
    minTextmode: '0.16.0'
  },
  {
    name: 'filters',
    label: 'textmode.filters.js',
    description: 'GPU-accelerated image filters',
    package: 'textmode.filters.js',
    plugin: 'FiltersPlugin',
    minTextmode: '0.16.0'
  }
];

// File name patterns considered text for placeholder replacement.
export const TEXT_FILE_REGEX = /\.(json|js|jsx|ts|tsx|vue|md|html|txt|cjs|mjs)$/i;

// Entries ignored when deciding if a directory is empty enough to reuse.
export const IGNORED_DIR_ENTRIES = ['.git', '.gitkeep'];
