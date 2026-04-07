// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

config.resolver.assetExts = [...(config.resolver.assetExts || []), 'ttf']

// Ignorar arquivos temporários do node_modules/.bin no Windows
config.resolver.blockList = [
  /node_modules[/\\]\.bin[/\\]\..*/,
]

module.exports = config