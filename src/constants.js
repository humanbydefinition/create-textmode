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
];

// File name patterns considered text for placeholder replacement.
export const TEXT_FILE_REGEX = /\.(json|js|jsx|ts|tsx|vue|md|html|txt|cjs|mjs)$/i;

// Entries ignored when deciding if a directory is empty enough to reuse.
export const IGNORED_DIR_ENTRIES = ['.git', '.gitkeep'];
