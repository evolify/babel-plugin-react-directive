import type * as BabelCoreNamespace from "@babel/core"
import { PluginObj } from "@babel/core"
import types, {
  ConditionalExpression,
  Expression,
  Identifier,
  JSXAttribute,
  JSXElement,
  JSXExpressionContainer,
  JSXSpreadAttribute,
} from "@babel/types"

type Babel = typeof BabelCoreNamespace

function isJSXAttribute(attr: JSXAttribute | JSXSpreadAttribute, name: string) {
  return types.isJSXAttribute(attr) && attr.name.name === name
}

function findAttr(node: JSXElement, name: string) {
  const attr = node.openingElement.attributes.find(a =>
    isJSXAttribute(a, name)
  ) as JSXAttribute
  return attr && attr.value
}

export default function ({ types: t }: Babel): PluginObj {
  return {
    name: "react directive",
    visitor: {
      JSXElement(path) {
        // TODO: add type validate
        const rif = findAttr(path.node, "r-if") as JSXExpressionContainer
        const rfor = findAttr(path.node, "r-for") as JSXExpressionContainer
        const { openingElement, closingElement, children, selfClosing } =
          path.node
        openingElement.attributes = openingElement.attributes.filter(
          attr =>
            !(isJSXAttribute(attr, "r-if") || isJSXAttribute(attr, "r-for"))
        )

        if (rfor && t.isBinaryExpression(rfor.expression, { operator: "in" })) {
          let forValue: Identifier, forKey: Identifier, forArray
          const v_rfor = rfor.expression
          if (t.isIdentifier(v_rfor.right)) {
            forArray = v_rfor.right
          }
          if (t.isSequenceExpression(v_rfor.left)) {
            ;[forValue, forKey] = v_rfor.left.expressions as Identifier[]
          } else if (t.isIdentifier(v_rfor.left)) {
            forValue = v_rfor.left
            forKey = t.identifier("index")
          } else {
            return
          }
          if (forArray && forValue && forKey) {
            const key = findAttr(path.node, "key")
            if (!key) {
              openingElement.attributes.push(
                t.jsxAttribute(
                  t.jsxIdentifier("key"),
                  t.jsxExpressionContainer(forKey)
                )
              )
            }
            let forItem: JSXElement | ConditionalExpression = path.node
            if (rif) {
              forItem = t.conditionalExpression(
                rif.expression as Expression,
                t.jsxElement(
                  openingElement,
                  closingElement,
                  children,
                  selfClosing
                ),
                t.nullLiteral()
              )
            }
            path.replaceWith(
              t.expressionStatement(
                t.callExpression(
                  t.memberExpression(forArray, t.identifier("map")),
                  [t.arrowFunctionExpression([forValue, forKey], forItem)]
                )
              )
            )
          }
        } else if (rif) {
          path.replaceWith(
            t.jsxExpressionContainer(
              t.conditionalExpression(
                rif.expression as Expression,
                t.jsxElement(
                  openingElement,
                  closingElement,
                  children,
                  selfClosing
                ),
                t.nullLiteral()
              )
            )
          )
        }
      },
    },
  }
}
