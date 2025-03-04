const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

// Define your custom configuration
const customConfig = {
  // transformer: {
  //   babelTransformerPath: require.resolve('react-native-svg-transformer'), // Path to transformer for SVG
  // },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'), // Remove 'svg' from asset extensions
    sourceExts: [...sourceExts, 'svg'], // Add 'svg' to source extensions
  },
};

// Merge default configuration with your custom configuration
const mergedConfig = mergeConfig(defaultConfig, customConfig);

// Wrap the merged configuration with Reanimated's metro configuration
const finalConfig = wrapWithReanimatedMetroConfig(mergedConfig);

module.exports = finalConfig;