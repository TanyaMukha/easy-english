// metro.config.cjs - Updated for SQL.js support
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable web support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configure aliases for your project structure
config.resolver.alias = {
  // Ensure react-native-web compatibility
  'react-native': 'react-native-web',
  // Add path aliases for cleaner imports
  '@': path.resolve(__dirname, '.'),
  '@/components': path.resolve(__dirname, 'components'),
  '@/styles': path.resolve(__dirname, 'styles'),
  '@/utils': path.resolve(__dirname, 'utils'),
  '@/types': path.resolve(__dirname, 'types'),
  '@/i18n': path.resolve(__dirname, 'i18n'),
  '@/services': path.resolve(__dirname, 'services'),
  '@/data': path.resolve(__dirname, 'data'),
};

// Ensure proper file extensions for web
config.resolver.sourceExts.push('web.js', 'web.jsx', 'web.ts', 'web.tsx');

// Add support for WebAssembly files (needed for SQL.js)
config.resolver.assetExts.push('wasm');

// Configure transformer for TypeScript and WebAssembly files
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
});

// Add specific handling for SQL.js WebAssembly module
config.resolver.resolverMainFields = ['browser', 'main'];

// Ignore specific directories to improve build performance
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/react-native\/.*/,
  /.*\/__tests__\/.*/,
  /.*\/\.vscode\/.*/,
  /.*\/\.git\/.*/,
];

// Enable symlinks resolution (useful for monorepos)
config.resolver.unstable_enableSymlinks = true;

// Web-specific configuration for SQL.js
if (process.env.EXPO_PUBLIC_PLATFORM === 'web') {
  // Ensure WebAssembly files are properly handled in web builds
  config.transformer.minifierConfig = {
    // Disable minification for WebAssembly files
    filter: (filename) => !filename.endsWith('.wasm'),
  };
}

module.exports = config;