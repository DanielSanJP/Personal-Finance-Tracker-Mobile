module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo", "nativewind/babel"],
    plugins: [
      // Required for React Native
      "react-native-reanimated/plugin",
    ],
  };
};
