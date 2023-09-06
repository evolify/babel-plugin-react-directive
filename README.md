# babel-plugin-react-directive
Use directive in React.

Now you can use `r-if`、`r-for` in jsx.

## Usage:

1. Install: `yarn add babel-plugin-react-directive --dev`

2. Add to your .babelrc:

   ```
   {
       plugins:[
           'react-directive'
       ]
   }
   ```

   

### r-if:

* Before:

  ```jsx
  render(){
      const visible = true
      return(
          <div>
              {
                  visible ? <div>content<div>
                          : ''
              }
          </div>
      )
  }
  ```

  

* Now:

  ```jsx
  render(){
      const visible = true
      return(
          <div>
              <div r-if = {visible}>content</div>
          </div>
      )
  }
  ```



### r-for:

* Before:

  ```jsx
  render(){
      const list = [1, 2, 3, 4, 5]
      return(
          <div>
              {
                  list.map((item,index)=>(
                  	<div key={index}>{item}</div>
                  ))
              }
          </div>
      )
  }
  ```

  

* Now:

  ```jsx
  render(){
      const list = [1, 2, 3, 4, 5]
      return(
          <div>
              {/* auto set 'key' to the index */} 
              <div r-for = {item in list}>{item}</div>
              {/* or you can set the key manually */}
              <div r-for = {(item,index) in list} key = {index+1}>{item}</div>
          </div>
      )
  }
  ```
