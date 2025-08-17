const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Configure resolver to handle node_modules properly
config.resolver.nodeModulesPaths = [
  require
    .resolve("@expo/metro-config/build/async-require.js")
    .replace("async-require.js", ""),
  ...config.resolver.nodeModulesPaths,
];

module.exports = withNativeWind(config, {
  input: "./global.css",
});
