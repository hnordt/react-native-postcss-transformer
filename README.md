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

Configure it normally. Sample configuration:

### postcss.config.js

```js
module.exports = {
  plugins: [
    require("tailwindcss"),
    ...(process.env.NODE_ENV === "production"
      ? [
          require("@fullhuman/postcss-purgecss")({
            content: ["./src/**/*.js"],
            defaultExtractor: (content) =>
              content.match(/[\w-/.:]+(?<!:)/g) || [],
          }),
        ]
      : []),
  ],
}
```

### tailwind.config.js

```js
module.exports = {
  theme: {},
  variants: [], // For RN you want to make sure it's always an empty array
  plugins: [],
}
```

### tailwind.css

You can create that file anywhere. You can also use any name, `tailwind.css` is just an example.

```css
/* For RN you'll want to include Tailwind utilities only */
@tailwind utilities;

.my-custom-css {
  background-color: blue;
}
```

### tailwind.js

You can create a specific file to import your styles and add a simple `tw()` utility. It's optional, you can also use the imported styles directly (they are just an object, so you might want to create a StyleSheet).

```js
import { StyleSheet } from "react-native"
import styles from "./tailwind.css"

let sheet = StyleSheet.create(styles)

let tw = (str) => str.split(" ").map((style) => sheet[style])

export default tw
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
    </View>
  )
}
```

### Remember to install the dependencies manually

```sh
npm install --save-dev tailwindcss @fullhuman/postcss-purgecss
```

## Acknowledgments

This packaged was inspired by [react-native-postcss-transformer](https://github.com/kristerkari/react-native-postcss-transformer)

```

```
