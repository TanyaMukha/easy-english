const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure for web support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Web aliases for better React Native Web compatibility
config.resolver.alias = {
  'react-native': 'react-native-web',
  'react-native/Libraries/Components/View/ViewStylePropTypes':
    'react-native-web/dist/exports/View/ViewStylePropTypes',
  'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter':
    'react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter',
  'react-native/Libraries/vendor/emitter/EventEmitter':
    'react-native-web/dist/vendor/react-native/emitter/EventEmitter',
  'react-native/Libraries/EventEmitter/NativeEventEmitter':
    'react-native-web/dist/vendor/react-native/NativeEventEmitter',
};

module.exports = config;