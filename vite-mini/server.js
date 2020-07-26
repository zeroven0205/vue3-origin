
const fs = require("fs")
const path = require("path")
const Koa = require("koa")
const compileSfc = require('@vue/compiler-sfc')
const compileDom = require('@vue/compiler-dom')

const app = new Koa()
function rewriteImport(content){
    return content.replace(/from ['|"]([^'"]+)['|"]/g, function(s0,s1){
        // . ../ /开头的，都是相对路径
        if(s1[0]!=='.'&& s1[0]!=='/'){
          return `from '/@modules/${s1}'`
        }else{
          return s0
        }
    })
}
app.use(async ctx=>{
    const {request:{url,query}} = ctx
    if(url == '/'){
        ctx.type="text/html"
        let content = fs.readFileSync('./index.html','utf-8')
        content = content.replace("<script",`
          <script>
            window.process = {env:{NODE_ENV:'DEV'}}
          </script>
        <script`)
        ctx.body=content
    }else if(url.endsWith('.js')){
        const p = path.resolve(__dirname,url.slice(1))
        ctx.type = 'application/javascript'
        const content = fs.readFileSync(p,'utf-8')
        ctx.body = rewriteImport(content)
    }else if(url.startsWith('/@modules/')){
        // 这是一个node_module里的东西
        const prefix = path.resolve(__dirname,'node_modules',url.replace('/@modules/',''))
        const module = require(prefix+'/package.json').module
        const p = path.resolve(prefix,module)
        const ret = fs.readFileSync(p,'utf-8')
        ctx.type = 'application/javascript'
        ctx.body = rewriteImport(ret)

    }else if(url.indexOf('.vue')>-1){
        // vue单文件组件
        const p = path.resolve(__dirname, url.split('?')[0].slice(1))
        const {descriptor} = compileSfc.parse(fs.readFileSync(p,'utf-8'))
    
        if(!query.type){
          ctx.type = 'application/javascript'
          // 借用vue自导的compile框架 解析单文件组件，其实相当于vue-loader做的事情
          ctx.body = `
      ${rewriteImport(descriptor.script.content.replace('export default ','const __script = '))}
      import { render as __render } from "${url}?type=template"
      __script.render = __render
      export default __script
          `
        }else if(query.type==='template'){
          // 模板内容
          const template = descriptor.template
          // 要在server端吧compiler做了
          const render = compileDom.compile(template.content, {mode:"module"}).code
          ctx.type = 'application/javascript'
    
          ctx.body = rewriteImport(render)
        }
    }else if(url.endsWith('.css')){
        const p = path.resolve(__dirname,url.slice(1))
        const file = fs.readFileSync(p,'utf-8')
        const content = `
        const css = "${file.replace(/\n/g,'')}"
        let link = document.createElement('style')
        link.setAttribute('type', 'text/css')
        document.head.appendChild(link)
        link.innerHTML = css
        export default css
        `
        ctx.type = 'application/javascript'
        ctx.body = content
    }else{
        ctx.body = '嘿嘿'
    }
})
app.listen(3030,()=>{
    console.log("server 3030.");
})