import shared from '@textmode/lint';

export default [
	{
		ignores: ['templates/**', 'node_modules/**', 'dist/**', 'coverage/**'],
	},
	...shared.map((config) => {
		if (config.files) {
			return {
				...config,
				files: ['**/*.{js,mjs,cjs}'],
			};
		}
		return config;
	}),
];
