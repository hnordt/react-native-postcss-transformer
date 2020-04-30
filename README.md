# React Native PostCSS Transformer

A babel transformer that adds PostCSS support for React Native apps.

It works only with React Native v0.59 or newer and Expo SDK v33.0.0 or newer.

## Installation and configuration

### Step 1: Install

#### npm

```sh
npm install --save-dev @hnordt/react-native-postcss-transformer
```

#### Yarn

```sh
yarn add --dev @hnordt/react-native-postcss-transformer
```

### Step 2: Add your PostCSS config and install your PostCSS plugins

Add your PostCSS configuration to [one of the supported config formats](https://github.com/michael-ciniawsky/postcss-load-config), e.g. `package.json`, `.postcssrc`, `postcss.config.js`, etc.

**Important:** if you change your PostCSS config, or any PostCSS plugin config (like Tailwind CSS), you'll need to restart the React Native packager and clean its cache. For React Native your can run `react-native start --reset-cache`, or `expo start --clear` if you are using [Expo](https://expo.io).

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

## Usage with Tailwind CSS

Configure Tailwind CSS normally. Sample configuration:

### postcss.config.js

```js
module.exports = {
  plugins: [require("tailwindcss")],
}
```

### tailwind.config.js

```js
module.exports = {
  theme: {},
  variants: [], // For RN make sure variants is always an empty array
  purge: {
    content: ["./src/**/*.js"],
    enabled: process.env.BABEL_ENV === "production",
  },
  plugins: [require("@tailwindcss/ui")],
}
```

### tailwind.css

You can create that file anywhere. You can also use any name, `tailwind.css` is just an example.

```css
@tailwind utilities; /* For RN make sure to include Tailwind utilities only */

.my-custom-css {
  background-color: blue;
}
```

### tailwind.js

You can create a specific file to import your Tailwind CSS styles and add a simple `tw()` utility to make it easier to consume the amazing Tailwind classes.

It's completely optional, you can also use the imported styles directly (the imported styles are just an object, so you might want to create a `StyleSheet`).

```js
import { StyleSheet } from "react-native"
import styles from "./tailwind.css"

let styleSheet = StyleSheet.create(styles)

export default function tw(...args) {
  return args
    .filter(Boolean)
    .flatMap((classNames) =>
      classNames.split(" ").map((className) => styleSheet[className])
    )
}
```

### App.js

```js
import React from "react"
import { View, Text } from "react-native"
import tw from "./tailwind"

export default function App() {
  return (
    <View style={tw("bg-gray-200 flex-1 justify-center items-center")}>
      <Text style={tw("text-gray-900")}>Hello Tailwind CSS!</Text>
      <Text style={tw("text-gray-900 mt-3")}>♥️</Text>
      <Text style={tw("text-gray-900 mt-3", false && "I will not show")}>🚀</Text>
    </View>
  )
}
```

### Remember to install the Tailwind CSS dependencies

#### npm

```sh
npm install --save-dev tailwindcss @tailwindcss/ui
```

#### Yarn

```sh
yarn add --dev tailwindcss @tailwindcss/ui
```

## Acknowledgments

This package was inspired by [react-native-postcss-transformer](https://github.com/kristerkari/react-native-postcss-transformer) and [tailwind-rn](https://github.com/vadimdemedes/tailwind-rn).
