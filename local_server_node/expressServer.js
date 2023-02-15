var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var dataProduce = require('./dataProduce');
 
// 创建 application/x-www-form-urlencoded 编码解析
//var urlencodedParser = bodyParser.urlencoded({ extended: false })
//创建 application/json 编码解析
var jsonEncode = bodyParser.json({ extended: false })

// 设置跨域
app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Headers", "content-type"); //允许的header类型
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS"); //跨域允许的请求方式
    if (req.method.toLowerCase() == 'options')
        res.send(200); //让options尝试请求快速结束
    else
        next();
});

app.use('/public', express.static('./'));

app.get('/basic_setting', function (req, res) {
   console.log(req.ip)
   res.end(dataProduce.basic_setting())
})
 
app.post('/setting_detail', jsonEncode, function (req, res) {
   console.log(req.ip)
   dataProduce.setting_detail(req.body,res)
})

app.post('/column_render',jsonEncode, function(req,res){
    console.log(req.ip)
    var rqs_data = req.body
    if (rqs_data[0]['value']=='mysql'){
        dataProduce.mysql_cols(rqs_data,res)
    }
    else if(rqs_data[0]['value']=='xlsx'){
        dataProduce.xlsx_cols(rqs_data,res)
    }
})
app.post('/xlsxSheetnames',jsonEncode,function(req,res){
    console.log(req.ip)
    var rqs_data = req.body
    dataProduce.sheetname(rqs_data,res)
})
app.post('/data_render',jsonEncode,function(req,res){
    console.log(req.ip)
    var rqs_data = req.body
    var basics = JSON.parse(rqs_data['basic_inf'])
    var ds_type = basics[0]['value']
    if (ds_type == 'mysql'){
        var tbname = basics[6]['value']
        var sql = dataProduce.create_sql(tbname,rqs_data)
        //console.log(sql)
        dataProduce.mysql_search(basics,sql,res)
    }
    else if (ds_type == 'xlsx'){
        dataProduce.xlsx_produce(basics,rqs_data,res)
    }
})

var server = app.listen(5000)