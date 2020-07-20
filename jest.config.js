module.exports = {
  preset: "react-native",
  testRegex: "(/__tests__/.*|.spec)\\.(jsx?|tsx?)$",
  transformIgnorePatterns: ["node_modules/(?!(react-native)/)"],
};
