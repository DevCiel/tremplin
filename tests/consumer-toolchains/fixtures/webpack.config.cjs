const path=require('node:path')
const sass=require('sass')
module.exports={
  context:__dirname,mode:'production',entry:'./src/main.js',
  output:{path:path.join(__dirname,'dist'),filename:'app.js',publicPath:'./'},
  experiments:{css:true},
  resolve:{alias:{'../icons/datepicker-chevron.svg':path.resolve(__dirname,'../../node_modules/tremplin/dist/icons/datepicker-chevron.svg')}},
  module:{rules:[{test:/\.scss$/i,type:'css/auto',use:[{loader:require.resolve('sass-loader'),options:{implementation:sass,sassOptions:{importers:[new sass.NodePackageImporter(__dirname)]}}}]},{test:/\.svg$/i,type:'asset/resource'}]},
  performance:{hints:false}
}
