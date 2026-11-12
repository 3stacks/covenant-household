// The shared code is in packages/core, outside this folder. Metro must watch it.
const { getDefaultConfig } = require('expo/metro-config')
const path = require('node:path')

const config = getDefaultConfig(__dirname)
config.watchFolders = [path.resolve(__dirname, '../../packages/core')]
module.exports = config
