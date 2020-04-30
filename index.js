let babelTransformer = require("metro-react-native-babel-transformer")
let postcss = require("postcss")
let postcssrc = require("postcss-load-config")
let css = require("css")
let boxShadow = require("css-box-shadow")
let css2rn = require("css-to-react-native")

let supportedPropNames = [
  "alignContent",
  "alignItems",
  "alignSelf",
  "aspectRatio",
  "backfaceVisibility",
  "backgroundColor",
  "borderBottomColor",
  "borderBottomEndRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "borderBottomStartRadius",
  "borderBottomWidth",
  "borderColor",
  "borderEndColor",
  "borderEndWidth",
  "borderLeftColor",
  "borderLeftWidth",
  "borderRadius",
  "borderRightColor",
  "borderRightWidth",
  "borderStartColor",
  "borderStartWidth",
  "borderStyle",
  "borderTopColor",
  "borderTopEndRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderTopStartRadius",
  "borderTopWidth",
  "borderWidth",
  "bottom",
  "boxShadow",
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
  "lineHeight",
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

let supportedValuesByPropName = {
  borderStyle: ["solid", "dotted", "dashed"],
  lineHeight: (value) => String(value).endsWith("rem"),
  display: ["none", "flex"],
  position: ["relative", "absolute"],
  overflow: ["visible", "hidden", "scroll"],
}

let unsupportedValuesByPropName = {
  zIndex: ["auto"],
}

let valueTransformersByPropName = {
  boxShadow: (value) => {
    try {
      let result = boxShadow.parse(value)

      return (
        [
          result[0].offsetX,
          result[0].offsetY,
          forceNumber(result[0].blurRadius) +
            forceNumber(result[0].spreadRadius),
        ]
          .map((value) => (value || 0) + "px")
          .join(" ") +
        " " +
        result[0].color.replace(/none|currentColor/, "transparent")
      )
    } catch (error) {
      return "none"
    }
  },
}

function isSupportedSelector(selector) {
  return !selector.match(/(\s|:)/)
}

function isSupportedDeclaration(declaration) {
  let propName = css2rn.getPropertyName(declaration.property)

  if (!supportedPropNames.includes(propName)) {
    return false
  }

  let supportedValues = supportedValuesByPropName[propName]

  if (supportedValues) {
    if (typeof supportedValues === "function") {
      if (!supportedValues(declaration.value)) {
        return false
      }
    } else if (!supportedValues.includes(declaration.value)) {
      return false
    }
  }

  let unsupportedValues = unsupportedValuesByPropName[propName]

  if (unsupportedValues) {
    if (typeof unsupportedValues === "function") {
      if (unsupportedValues(declaration.value)) {
        return false
      }
    } else if (unsupportedValues.includes(declaration.value)) {
      return false
    }
  }

  return true
}

function getStyleName(selector) {
  return selector.replace(/^\./, "").replace(/\\/g, "")
}

function processDeclarations(declarations) {
  return css2rn.default(
    declarations.map((declaration) => {
      let valueTransformer =
        valueTransformersByPropName[
          css2rn.getPropertyName(declaration.property)
        ]

      return [
        declaration.property,
        valueTransformer
          ? valueTransformer(declaration.value)
          : remToPx(declaration.value),
      ]
    })
  )
}

function forceNumber(value) {
  return typeof value === "number" ? value : 0
}

function remToPx(value) {
  return typeof value === "string" && value.endsWith("rem")
    ? parseFloat(value) * 16 + "px"
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

  let styles = ast.stylesheet.rules.reduce((acc, rule) => {
    if (rule.type !== "rule") {
      return acc
    }

    return {
      ...acc,
      ...rule.selectors.reduce((acc, selector) => {
        if (!isSupportedSelector(selector)) {
          return acc
        }

        let declarations = rule.declarations.filter(isSupportedDeclaration)

        if (declarations.length === 0) {
          return acc
        }

        return {
          ...acc,
          [getStyleName(selector)]: processDeclarations(declarations),
        }
      }, {}),
    }
  }, {})

  return babelTransformer.transform({
    ...params,
    src: "module.exports = " + JSON.stringify(styles),
  })
}
