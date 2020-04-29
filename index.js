let babelTransformer = require("metro-react-native-babel-transformer")
let css = require("css")
let postcss = require("postcss")
let postcssrc = require("postcss-load-config")
let css2rn = require("css-to-react-native")

let supportedPropNames = [
  "alignContent",
  "alignItems",
  "alignSelf",
  "aspectRatio",
  "backfaceVisibility",
  "backfaceVisibility",
  "backgroundColor",
  "backgroundColor",
  "borderBottomColor",
  "borderBottomEndRadius",
  "borderBottomLeftRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "borderBottomRightRadius",
  "borderBottomStartRadius",
  "borderBottomWidth",
  "borderBottomWidth",
  "borderColor",
  "borderColor",
  "borderEndColor",
  "borderEndWidth",
  "borderLeftColor",
  "borderLeftWidth",
  "borderLeftWidth",
  "borderRadius",
  "borderRadius",
  "borderRightColor",
  "borderRightWidth",
  "borderRightWidth",
  "borderStartColor",
  "borderStartWidth",
  "borderStyle",
  "borderTopColor",
  "borderTopEndRadius",
  "borderTopLeftRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderTopRightRadius",
  "borderTopStartRadius",
  "borderTopWidth",
  "borderTopWidth",
  "borderWidth",
  "borderWidth",
  "borderWidth",
  "bottom",
  "color",
  "direction",
  "display",
  "elevation",
  "end",
  "flex",
  "flexBasis",
  "flexDirection",
  "flexGrow",
  "flexShrink",
  "flexWrap",
  // "fontFamily",
  "fontSize",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "height",
  "includeFontPadding",
  "justifyContent",
  "left",
  // "letterSpacing",
  // "lineHeight",
  "margin",
  "marginBottom",
  "marginEnd",
  "marginHorizontal",
  "marginLeft",
  "marginRight",
  "marginStart",
  "marginTop",
  "marginVertical",
  "maxHeight",
  "maxWidth",
  "minHeight",
  "minWidth",
  "opacity",
  "opacity",
  "overflow",
  "overflow",
  "overlayColor",
  "padding",
  "paddingBottom",
  "paddingEnd",
  "paddingHorizontal",
  "paddingLeft",
  "paddingRight",
  "paddingStart",
  "paddingTop",
  "paddingVertical",
  "position",
  "resizeMode",
  "right",
  "shadowColor",
  "shadowOffset",
  "shadowOpacity",
  "shadowRadius",
  "start",
  "textAlign",
  "textAlignVertical",
  "textDecorationColor",
  "textDecorationLine",
  "textDecorationStyle",
  "textShadowColor",
  "textShadowOffset",
  "textShadowRadius",
  "textTransform",
  "tintColor",
  "top",
  "width",
  "writingDirection",
  "zIndex",
]

let supportedPropValues = {
  borderStyle: ["solid", "dotted", "dashed"],
  display: ["none", "flex"],
  position: ["relative", "absolute"],
  overflow: ["visible", "hidden", "scroll"],
}

let unsupportedPropValues = {
  zIndex: ["auto"],
}

function isValidSelector(selector) {
  return selector.match(/(\s|:)/)
}

function isValidDeclaration(declaration) {
  let propName = css2rn.getPropertyName(declaration.property)

  if (!supportedPropNames.includes(propName)) {
    return false
  }

  if (
    supportedPropValues[propName] &&
    !supportedPropValues[propName].includes(declaration.value)
  ) {
    return false
  }

  if (
    unsupportedPropValues[propName] &&
    unsupportedPropValues[propName].includes(declaration.value)
  ) {
    return false
  }

  return true
}

function getStyleName(selector) {
  return selector.replace(/^\./, "").replace(/\\/g, "")
}

function processDeclarations(declarations) {
  return css2rn.default(
    declarations.map((declaration) => [
      declaration.property,
      remToPx(declaration.value),
    ])
  )
}

function remToPx(value) {
  return typeof value === "string" && value.endsWith("rem")
    ? `${parseFloat(value) * 16}px`
    : value
}

module.exports.transform = async (params) => {
  if (!params.filename.endsWith(".css")) {
    return babelTransformer.transform(params)
  }

  let config = await postcssrc()

  let result = await postcss(config.plugins).process(params.src, {
    from: undefined,
    ...config.options,
  })

  let ast = css.parse(result.css)

  let styles = ast.stylesheet.rules
    .filter((rule) => rule.type === "rule")
    .reduce(
      (acc, rule) => ({
        ...acc,
        ...rule.selectors.reduce((acc, selector) => {
          if (isValidSelector(selector)) {
            return acc
          }

          let declarations = rule.declarations.filter(isValidDeclaration)

          if (declarations.length === 0) {
            return acc
          }

          return {
            ...acc,
            [getStyleName(selector)]: processDeclarations(declarations),
          }
        }, {}),
      }),
      {}
    )

  return babelTransformer.transform({
    ...params,
    src: "module.exports = " + JSON.stringify(styles),
  })
}
