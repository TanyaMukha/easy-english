const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable web support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configure web aliases
config.resolver.alias = {
  // Ensure react-native-web compatibility
  'react-native': 'react-native-web',
};

// Ensure proper file extensions for web
config.resolver.sourceExts.push('web.js', 'web.jsx', 'web.ts', 'web.tsx');

module.exports = config;