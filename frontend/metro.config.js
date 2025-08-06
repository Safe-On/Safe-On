const { getDefaultConfig } = require("expo/metro-config");

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  config.transformer.babelTransformerPath = require.resolve(
    "react-native-svg-transformer"
  );

  // assetExts에서 svg만 제거 (png는 남김)
  config.resolver.assetExts = config.resolver.assetExts.filter(
    (ext) => ext !== "svg"
  );
  config.resolver.sourceExts.push("svg");

  return config;
})();
