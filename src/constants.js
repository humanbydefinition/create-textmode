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
	{ name: 'vanilla-ts-tweakpane', label: 'Vanilla TypeScript + Tweakpane (vite)', dir: 'vanilla-ts-tweakpane' },
];

// Official textmode.js add-on libraries that can be pre-installed. The `plugin`
// value is the named ESM export each package provides. Add-ons are always
// installed at their latest version.
export const addons = [
	{
		name: 'export',
		label: 'textmode.export.js',
		description: 'Export finished artworks (PNG, GIF, video, JSON, SVG, TXT)',
		package: 'textmode.export.js',
		plugin: 'ExportPlugin',
	},
	{
		name: 'synth',
		label: 'textmode.synth.js',
		description: 'Shader-backed live-coded synth scenes',
		package: 'textmode.synth.js',
		plugin: 'SynthPlugin',
	},
	{
		name: 'figlet',
		label: 'textmode.figlet.js',
		description: 'FIGlet display typography',
		package: 'textmode.figlet.js',
		plugin: 'FigletPlugin',
	},
	{
		name: 'filters',
		label: 'textmode.filters.js',
		description: 'GPU-accelerated image filters',
		package: 'textmode.filters.js',
		plugin: 'FiltersPlugin',
	},
];

// Minimum textmode.js version the scaffolder will offer. All official add-ons
// peer-depend on a lower bound well below this floor, so it also covers them.
export const MIN_TEXTMODE_VERSION = '0.17.1';

// File name patterns considered text for placeholder replacement.
export const TEXT_FILE_REGEX = /\.(json|js|jsx|ts|tsx|vue|md|html|txt|cjs|mjs)$/i;

// Entries ignored when deciding if a directory is empty enough to reuse.
export const IGNORED_DIR_ENTRIES = ['.git', '.gitkeep'];
