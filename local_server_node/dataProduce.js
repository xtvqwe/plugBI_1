const xlsx = require('xlsx')
var fs = require('fs')
var mysql = require('mysql')
var underscore = require('underscore')

function basic_setting() {
    rdata= [
        {
            'title': 'Data Source Type',
            'name': 'dst',
            'type': 'select_rt',
            'func': 'ds_info',
            'datas': [
                '[select data type]',
                'mysql',
                'xlsx'
            ]
        },
        {
            'title': 'Data Visualization Type',
            'name': 'dvt',
            'type': 'select',
            'datas': [
                'table',
                ''
            ]
        }
    ]
    return JSON.stringify(rdata)
}
exports.basic_setting = basic_setting;

function setting_detail(data,res) {
    datatype = data['dst'];
    if (datatype == 'mysql') {
        var result = [
            { 'title': '主机', 'name': 'mysql_host', 'type': 'input' },
            { 'title': '端口', 'name': 'mysql_port', 'type': 'input' },
            { 'title': '用户名', 'name': 'mysql_usr', 'type': 'input' },
            { 'title': '密码', 'name': 'mysql_pwd', 'type': 'pwd' },
            { 'title': '库', 'name': 'mysql_db', 'type': 'input' },
            { 'title': '表', 'name': 'mysql_tab', 'type': 'input' }
        ];
        res.end(JSON.stringify(result))
    }
    else if (datatype == 'xlsx') {
        var fpath = './xlsx';
        fs.readdir(fpath,function (err, files) {
            if (err) {
                console.warn(err);
            }
            else {
                var datas = [''].concat(files)
                res.end(JSON.stringify([{
                    'title':'choose_file',
                    'name':'choose_file',
                    'type':'select_rt',
                    'func':'show_sheets',
                    'datas':datas
                }]))
            }
        });
    }
}
exports.setting_detail = setting_detail

function mysql_cols(rqs_data,res){
    var connection = mysql.createConnection({
        host:rqs_data[1]['value'],
        port:Number(rqs_data[2]['value']),
        user:rqs_data[3]['value'],
        password:rqs_data[4]['value'],
        database:rqs_data[5]['value']
    })
    connection.connect();
    var sql = 'desc '+rqs_data[6]['value']
    connection.query(sql,function(err,result){
        if (err){
            console.log(err);
        }
        var res_data=[]
        for (var i=0;i<result.length;i++){
            fieldname=result[i]['Field']
            res_data.push({'name':fieldname,'value':fieldname})
        }
        res.end(JSON.stringify(res_data))
    })
    connection.end()
}
exports.mysql_cols=mysql_cols

function sheetname(rqs_data,res){
    var fname = rqs_data['fname']
    var workbook = xlsx.readFile('./xlsx/'+fname)
    var sheetnames = workbook.SheetNames
    var res_data=[{
        "title": "choose_sheet",
        "name": "choose_sheet", 
        "type": "select", 
        "datas": sheetnames
    }]
    //console.log(JSON.stringify(res_data))
    res.end(JSON.stringify(res_data))

}
exports.sheetname=sheetname

//xlsxsheet转二维数组
function sheet_array(sheet){
    const Range = {
        x1: sheet['!ref'].split(':')[0].match(/^[A-Z]+/)[0],
        y1: sheet['!ref'].split(':')[0].match(/\d+$/)[0],
        x2: sheet['!ref'].split(':')[1].match(/^[A-Z]+/)[0],
        y2: sheet['!ref'].split(':')[1].match(/\d+$/)[0],
      };
      let tableDataArr = [];
      for (let y = Range.y1; y <= Range.y2; y++) { // 行遍历
        let rowArr = [];
        for (let x = Range.x1.charCodeAt(); x <= Range.x2.charCodeAt(); x++) { // 列遍历 TD:暂时只支持到A~Z列，有需要的自己优化
          let position = String.fromCharCode(x) + y;
          rowArr.push(sheet[position] ? sheet[position].v : null);
        }
        tableDataArr.push(rowArr);
      }
      return tableDataArr;    
}

function xlsx_cols(rqs_data,res){
    var fname = rqs_data[1]['value']
    var sname = rqs_data[2]['value']
    var sheet = xlsx.readFile('./xlsx/'+fname).Sheets[sname]
    var data = sheet_array(sheet)
    colname_list=[]
    for (var i=0;i<data[0].length;i++){
        colname_list.push({'name':data[0][i],'value':i})
    }
    res.end(JSON.stringify(colname_list))
    //console.log(JSON.stringify(colname_list))
}
exports.xlsx_cols = xlsx_cols

//创建sql
function create_sql(tbname,rqs_data){
    var c_ts=["sum","mid","avg","max","min"]
    var r_ts=[">",">=","<","<=","=","<>","in"]
    var n_s = rqs_data['names']
    var name_query = ''
    var gb_query = ''
    if (n_s.length>0){
        name_query = n_s.join(',')
        gb_query = 'group by '+name_query
    }
    var c_s = rqs_data['caculations']
    var select_query;
    if (c_s.length>0){
        var cal_s=[]
        for (var i=0;i<c_s.length;i++){
            var action = c_ts[Number(c_s[i]['action'])]
            var cal_unit = action+'('+c_s[i]['name']+')'
            cal_s.push(cal_unit)
        }
        var cal_query = cal_s.join(',')
        if (n_s.length>0){
            select_query = 'select '+name_query+','+cal_query
        }
        else{
            select_query = 'select '+cal_query
        }
    }
    else{
        select_query = 'select '+name_query
    }
    var r_s = rqs_data['rules']
    var rule_s=[]
    for (var i=0;i<r_s.length;i++){
        var multir_s=[]
        var multi_r=r_s[i]
        var multi_query = ''
        if (multi_r.length>0){
            for (var j=0;j<multi_r.length;j++){
                var r_action = r_ts[Number(multi_r[j]['action'])]
                var r_name = multi_r[j]['name']
                var r_value = multi_r[j]['action_value']
                if(r_action=='in'){
                    var rule_unit = r_name+' in ('+r_value+')'
                }
                else if (r_action=='='||'<>'){
                    var rule_unit = r_name+r_action+'\''+r_value+'\''
                }
                else{
                    var rule_unit = r_name+r_action+r_value
                }
                multir_s.push(rule_unit)
            }
            multi_query = '('+multir_s.join(' and ')+')'
            rule_s.push(multi_query)
        }
    }
    var rule_query = ''
    if (rule_s.length>0){
        rule_query = ' where '+rule_s.join(' or ')
    }
    if (name_query == ''){
        return select_query+' from '+tbname+rule_query+' limit 1000'
    }
    else{
        return select_query+' from '+tbname+rule_query+' group by '+name_query+' limit 1000'
    }
    
}
exports.create_sql = create_sql

function mysql_search(basics,sql,res){
    var connection = mysql.createConnection({
        host:basics[1]['value'],
        port:Number(basics[2]['value']),
        user:basics[3]['value'],
        password:basics[4]['value'],
        database:basics[5]['value']
    })
    connection.connect();
    connection.query(sql,function(err,result){
        if (err){
            console.log(err);
        }
        var res_data=[underscore.keys(result[0])]
        for (var i=0;i<result.length;i++){
            res_data.push(underscore.values(result[i]))
        }
        res.end(JSON.stringify(res_data))
    })
    connection.end()
}
exports.mysql_search = mysql_search

//xlsx条件处理
function xlsx_rule(rules,data){
    var after_rule_rows = []
    for (var i=0;i<rules.length;i++){
        var multi_rule = rules[i]
        //每个并集条件过滤行
        fliter_rows=[]
        for (var j=0;j<multi_rule.length;j++){
            var cid = Number(multi_rule[j]['name'])
            var mthd = multi_rule[j]['action']
            if (mthd=='6'){
                var m_value = multi_rule[j]['action_value'].split(',')
            }
            else if(mthd=='4'||'5'){
                var m_value = multi_rule[j]['action_value']
            }
            else{
                var m_value = Number(multi_rule[j]['action_value'])
            }
            for(var i=0;i<data.length;i++){
                var unit_data = data[i][cid]
                if (mthd =='0' && unit_data<=m_value && fliter_rows.indexOf(i)==-1){
                    fliter_rows.push(i)
                }
                else if(mthd =='1' && unit_data<m_value && fliter_rows.indexOf(i)==-1){
                    fliter_rows.push(i)
                }
                else if(mthd =='2' && unit_data>=m_value && fliter_rows.indexOf(i)==-1){
                    fliter_rows.push(i)
                }
                else if(mthd =='3' && unit_data>m_value && fliter_rows.indexOf(i)==-1){
                    fliter_rows.push(i)
                }
                else if(mthd =='4' && unit_data!=m_value && fliter_rows.indexOf(i)==-1){
                    fliter_rows.push(i)
                }
                else if(mthd =='5' && unit_data==m_value && fliter_rows.indexOf(i)==-1){
                    fliter_rows.push(i)
                }
                else if(mthd =='6' && m_value.indexOf(unit_data)==-1 && fliter_rows.indexOf(i)==-1){
                    fliter_rows.push(i)
                }
            }
        }
        //交集条件行合并
        for (var i=0;i<data.length;i++){
            if (fliter_rows.indexOf(i)==-1 && after_rule_rows.indexOf(i)==-1){
                after_rule_rows.push(i)
            }
        }
    }
    return after_rule_rows
}


//xlsx字段类型

function xlsx_produce(basics,rqs_data,res){
    var fname = basics[1]['value']
    var sname = basics[2]['value']
    var sheet = xlsx.readFile('./xlsx/'+fname).Sheets[sname]
    var rdata = sheet_array(sheet)
    var data = rdata.slice(1)
    var names=rqs_data['names']
    var caculations=rqs_data['caculations']
    var namecolids = []
    if(names.length>0){
        for (var i=0;i<names.length;i++){
            namecolids.push(Number(names[i]))
        }
    }
    var calcolids = []
    var cals = []
    if(caculations.length>0){
        for (var i=0;i<caculations.length;i++){
            calcolids.push(Number(caculations[i]['name']))
            cals.push(Number(caculations[i]['action']))
        }
    }
    var rules = rqs_data['rules']
    var cal_types = ["sum","mid","avg","max","min","count"]
    var cols = []
    for (var i=0;i<namecolids.length;i++){
        cols.push(rdata[0][namecolids[i]])
    }
    for (var i=0;i<calcolids.length;i++){
        cols.push(String(rdata[0][calcolids[i]])+'_'+cal_types[cals[i]])
    }
    //解析rule
    var after_rule_rows = xlsx_rule(rules,data)
    //合并group维度行
    if (namecolids.length>0){
        var rows = []
        for (var i=0;i<namecolids.length;i++){
            var ndatas = []
            var name_col = namecolids[i]
            for (var j=0;j<after_rule_rows.length;j++){
                var r_row = after_rule_rows[j]
                var value = data[r_row][name_col]
                if (ndatas.indexOf(value)==-1 && rows.indexOf(r_row)==-1){
                    ndatas.push(value)
                    rows.push(r_row)
                }
            }
        }
    }
    else{
        var rows = after_rule_rows
    }
    //逐行calculation+获得输出二维数组
    var result = [cols]
    if(namecolids.length>0){
        for (var i=0;i<rows.length;i++){
            var row_names = []
            //逐行name
            var row_id = rows[i]
            for (var j=0;j<namecolids.length;j++){
                var name_id = namecolids[j]
                row_names.push(data[row_id][name_id])
            }
            //data包含行
            var include_rows=[]
            for (var j=0;j<data.length;j++){
                var name_match=0
                for(var k=0;k<namecolids.length;k++){
                    var dname_id = namecolids[k]
                    if(data[j][dname_id]==row_names[k]){
                        name_match+=1
                    }
                }
                if (namecolids.length == name_match){
                    include_rows.push(j)
                }
            }
            //逐行calculation
            var row_cals = []
            if (calcolids.length>0){
                for (var j=0;j<calcolids.length;j++){
                    var cal_id = calcolids[j]
                    var cal_action = cals[j]
                    var cal_datas=[]
                    for (var k=0;k<include_rows.length;k++){
                        cal_datas.push(Number(data[include_rows[k]][cal_id]))
                    }
                    //冒泡排序
                    for(var k=0;k<cal_datas.length-1;k++){
                        for(var l=0;l<cal_datas.length-l-1;l++){
                            if (cal_datas[l]>cal_datas[l+1]){
                                var tmp_data = cal_datas[l]
                                cal_datas[l] = cal_datas[l+1]
                                cal_datas[l+1] = tmp_data
                            }
                        }
                    }
                    var cal_data = 0
                    if (cal_action==0){
                        for (var k=0;k<cal_datas.length;k++){
                            cal_data+=Number(cal_datas[k])
                        }
                    }
                    else if (cal_action==1){
                        var hlen = parseInt(cal_datas.length/2)
                        if(cal_datas.length%2==0){
                            cal_data = (cal_datas[hlen]+cal_datas[hlen+1])/2
                        }
                    }
                    else if (cal_action==2){
                        var sum_data = 0
                        for (var k=0;k<cal_datas.length;k++){
                            sum_data+=Number(cal_datas[k])
                        }
                        cal_data = sum_data/cal_datas.length
                    }
                    else if (cal_action==3){
                        cal_data = cal_datas[cal_datas.length-1]
                    }
                    else if (cal_action==4){
                        cal_data = cal_datas[0]
                    }
                    else if (cal_action==5){
                        cal_data = cal_datas.length
                    }
                    row_cals.push(cal_data)
                }
            }
            var row_data = row_names.concat(row_cals)
            result.push(row_data)
        }
    }
    else{
        var row_cals = []
        if (calcolids.length>0){
            for (var j=0;j<calcolids.length;j++){
                var cal_id = calcolids[j]
                var cal_action = cals[j]
                var cal_datas=[]
                for (var k=0;k<rows.length;k++){
                    cal_datas.push(Number(data[rows[k]][cal_id]))
                }
                //冒泡排序
                for(var k=0;k<cal_datas.length-1;k++){
                    for(var l=0;l<cal_datas.length-l-1;l++){
                        if (cal_datas[l]>cal_datas[l+1]){
                            var tmp_data = cal_datas[l]
                            cal_datas[l] = cal_datas[l+1]
                            cal_datas[l+1] = tmp_data
                        }
                    }
                }
                var cal_data = 0
                if (cal_action==0){
                    for (var k=0;k<cal_datas.length;k++){
                        cal_data+=Number(cal_datas[k])
                    }
                }
                else if (cal_action==1){
                    var hlen = parseInt(cal_datas.length/2)
                    if(cal_datas.length%2==0){
                        cal_data = (cal_datas[hlen]+cal_datas[hlen+1])/2
                    }
                }
                else if (cal_action==2){
                    var sum_data = 0
                    for (var k=0;k<cal_datas.length;k++){
                        sum_data+=Number(cal_datas[k])
                    }
                    cal_data = sum_data/cal_datas.length
                }
                else if (cal_action==3){
                    cal_data = cal_datas[cal_datas.length-1]
                }
                else if (cal_action==4){
                    cal_data = cal_datas[0]
                }
                else if (cal_action==5){
                    cal_data = cal_datas.length
                }
                row_cals.push(cal_data)
            }
        }
        var row_data = row_cals
        result.push(row_data)
    }
    res.end(JSON.stringify(result))
}
exports.xlsx_produce = xlsx_produce