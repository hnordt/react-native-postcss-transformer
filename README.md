# React Native PostCSS Transformer

A babel transformer that adds CSS support for React Native apps.

It works only with React Native v0.59 or newer and Expo SDK v31.0.0 or newer.

## Installation and configuration

### Step 1: Install

```sh
npm install --save-dev @hnordt/react-native-postcss-transformer
```

### Step 2: Add your PostCSS config and install your PostCSS plugins

Add your PostCSS configuration to [one of the supported config formats](https://github.com/michael-ciniawsky/postcss-load-config), e.g. `package.json`, `.postcssrc`, `postcss.config.js`, etc.

### Step 3: Configure the React Native packager

Add this to `metro.config.js` in your project's root (create the file if it does not exist already):

```js
module.exports = {
  transformer: {
    babelTransformerPath: require.resolve(
      "@hnordt/react-native-postcss-transformer"
    ),
  },
}
```

If you are using [Expo](https://expo.io), you also need to add this to `app.json`:

```json
{
  "expo": {
    "__YOUR_EXPO_CONFIG__": true,
    "packagerOpts": {
      "config": "metro.config.js",
      "sourceExts": ["css"]
    }
  }
}
```

## Usage with TailwindCSS

TODO

## Acknowledgments

This packaged was inspired by [react-native-postcss-transformer](https://github.com/kristerkari/react-native-postcss-transformer)
