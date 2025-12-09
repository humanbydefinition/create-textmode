export const HEADER = `
  __                   __                     .___               __        
_/  |_  ____ ___  ____/  |_  _____   ____   __| _/____          |__| ______
\   __\/ __ \\  \/  /\   __\/     \ /  _ \ / __ |/ __ \         |  |/  ___/
 |  | \  ___/ >    <  |  | |  Y Y  (  <_> ) /_/ \  ___/         |  |\___ \ 
 |__|  \___  >__/\_ \ |__| |__|_|  /\____/\____ |\___  > /\ /\__|  /____  >
           \/      \/            \/            \/    \/  \/ \______|    \/ 
`;

export const templates = [
  { name: 'vanilla-js', label: 'Vanilla JS (Vite)', dir: 'vanilla-js' },
  { name: 'vanilla-ts', label: 'Vanilla TS (Vite)', dir: 'vanilla-ts' },
  { name: 'react', label: 'React (Vite)', dir: 'react' },
  { name: 'vue', label: 'Vue 3 (Vite)', dir: 'vue' }
];

// File name patterns considered text for placeholder replacement.
export const TEXT_FILE_REGEX = /\.(json|js|jsx|ts|tsx|vue|md|html|txt|cjs|mjs)$/i;

// Entries ignored when deciding if a directory is empty enough to reuse.
export const IGNORED_DIR_ENTRIES = ['.git', '.gitkeep'];
