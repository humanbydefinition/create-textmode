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
  { name: 'vanilla-js-fxhash', label: 'Vanilla JavaScript + fx(hash) (vite)', dir: 'vanilla-js-fxhash' },
  { name: 'vanilla-ts-fxhash', label: 'Vanilla TypeScript + fx(hash) (vite)', dir: 'vanilla-ts-fxhash' },
  { name: 'vanilla-js-tweakpane', label: 'Vanilla JavaScript + Tweakpane (vite)', dir: 'vanilla-js-tweakpane' },
  { name: 'vanilla-ts-tweakpane', label: 'Vanilla TypeScript + Tweakpane (vite)', dir: 'vanilla-ts-tweakpane' }
];

// File name patterns considered text for placeholder replacement.
export const TEXT_FILE_REGEX = /\.(json|js|jsx|ts|tsx|vue|md|html|txt|cjs|mjs)$/i;

// Entries ignored when deciding if a directory is empty enough to reuse.
export const IGNORED_DIR_ENTRIES = ['.git', '.gitkeep'];
