module.exports = function ({ types: t }) {
  return {
    visitor: {
      CallExpression(path) {
        if(t.isMemberExpression(path.node.callee) 
          && t.isIdentifier(path.node.callee.object,{name: 'React'}) 
          && t.isIdentifier(path.node.callee.property,{name: 'createElement'})){
          const props = path.node.arguments[1].properties
          if(!props){
            return
          }
          let ifStatement
          const rif = props.find(p=>p.key.value === 'r-if')
          if(rif){
            path.node.arguments[1].properties = props.filter(p=>p!==rif)
            ifStatement = t.ifStatement(rif.value,t.returnStatement(path.node))
          }
          
          const rfor = props.find(p=>p.key.value === 'r-for')
          path.node.arguments[1].properties = path.node.arguments[1].properties.filter(p=>p!==rfor)
          let forValue,forKey,forArray
          if(rfor && t.isBinaryExpression(rfor.value,{operator: 'in'})){
            const v_rfor = rfor.value
            if(t.isIdentifier(v_rfor.right)){
              forArray = v_rfor.right
            }
            if(t.isSequenceExpression(v_rfor.left)){
              [forValue,forKey] = v_rfor.left.expressions
            }else if(t.isIdentifier(v_rfor.left)){
              forValue = v_rfor.left
              forKey = t.identifier('index')
            }
            if(forArray && forValue && forKey){
              let forItem
              if(!path.node.arguments[1].properties.find(p=>p.key.name === 'key')){
                path.node.arguments[1].properties.push(t.objectProperty(t.identifier('key'),forKey))
              }
              forItem = ifStatement ?t.blockStatement([ifStatement]) :path.node
              path.replaceWith(t.expressionStatement(t.callExpression(t.memberExpression(forArray,t.identifier('map')),[t.arrowFunctionExpression([forValue,forKey],forItem)])))
            }
          }else if(ifStatement){
            path.replaceWith(ifStatement)
          }
        }
      }
    }
  }
}