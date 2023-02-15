//增加规则行
function add_rule(){
    var rule_ele=document.getElementById("rule_0")
    var parent_ele=rule_ele.parentNode
    var inBf_ele;
    var eles=document.getElementsByClassName("ele")
    for (var i=0;i<eles.length;i++){
        if (eles[i].children.length>0){
            if(eles[i].children[0].getAttribute("id")=="search"){
                inBf_ele=eles[i]
                break
            }
        }
    }
    var create_id;
    //获取上一个rule_id生成新的rule_id
    for(var i=0;i<parent_ele.children.length;i++){
        if (parent_ele.children[i]==inBf_ele){
            var l_rule_id = parent_ele.children[i-1].getAttribute("id")
            var new_idx = Number(l_rule_id.split('_')[1])+1
            create_id = "rule_"+String(new_idx)
            break
        }
    }
    var new_obj = document.createElement("div")
    new_obj.setAttribute("class","object")
    new_obj.setAttribute("id",create_id)
    parent_ele.insertBefore(new_obj,inBf_ele)
}
//减少规则行
function reduce_rule(){
    var rule_ele=document.getElementById("rule_0")
    var parent_ele=rule_ele.parentNode
    var inBf_ele;
    var eles=document.getElementsByClassName("ele")
    for (var i=0;i<eles.length;i++){
        if (eles[i].children.length>0){
            if(eles[i].children[0].getAttribute("id")=="search"){
                inBf_ele=eles[i]
                break
            }
        }
    };
    for(var i=0;i<parent_ele.children.length;i++){
        if (parent_ele.children[i]==inBf_ele){
            var l_ele=parent_ele.children[i-1]
            var l_rule_id = l_ele.getAttribute("id")
            if (l_rule_id!="rule_0"){
                parent_ele.removeChild(l_ele)
                break
            }
        }
    }
}


//basic setting基础位置设置插入(数组)
function bs_insert(setting_objs){
    var basic_save_button = document.getElementById("bsb");
    var menu = basic_save_button.parentNode;
    for (var i=0;i<setting_objs.length;i++){
        var obj_row = document.createElement("div")
        obj_row.setAttribute("class","sets")
        //title渲染
        var obj_title = document.createElement("div")
        obj_title.setAttribute("class","sets1")
        obj_title.setAttribute("name",setting_objs[i]['name'])
        obj_title.appendChild(document.createTextNode(setting_objs[i]['title']))
        //操作分类渲染
        var set_type = setting_objs[i]['type']
        if (set_type == "input"){
            var obj_set = document.createElement("input")
        }
        else if (set_type == "pwd"){
            var obj_set = document.createElement("input")
            obj_set.setAttribute("type","password")
        }
        else if(set_type =="select"){
            var obj_set = document.createElement("select")
            var select_option = document.createElement("option")
            var select_datas = setting_objs[i]["datas"]
            for (var j=0;j<select_datas.length;j++){
                option_ele = select_option.cloneNode(true)
                var text = document.createTextNode(select_datas[j])
                option_ele.setAttribute("value",select_datas[j])
                option_ele.appendChild(text)
                obj_set.appendChild(option_ele)
            }
        }
        else if(set_type =="select_rt"){
            var obj_set = document.createElement("select")
            var select_option = document.createElement("option")
            var select_datas = setting_objs[i]["datas"]
            var func_r = setting_objs[i]["func"]
            for (var j=0;j<select_datas.length;j++){
                option_ele = select_option.cloneNode(true)
                var text = document.createTextNode(select_datas[j])
                option_ele.setAttribute("value",select_datas[j])
                option_ele.appendChild(text)
                obj_set.appendChild(option_ele)
            }
            obj_set.setAttribute("onchange",func_r+"(this)")
        }
        obj_set.setAttribute("class","sets2");
        
        obj_row.appendChild(obj_title)
        obj_row.appendChild(obj_set)
        menu.insertBefore(obj_row,basic_save_button)
    }
};
//AJAX请求接口生成基础设置元素
function ajax_rqs(method, url, msg,doSomething) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        // IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
        xmlhttp = new XMLHttpRequest();
    }
    else {
        // IE6, IE5 浏览器执行代码
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            doSomething(JSON.parse(this.responseText))
            //bs_insert(api_data);
        }return;
    }
    if (method == "post") {
        xmlhttp.open("POST", url, true);
        xmlhttp.setRequestHeader("Content-type", "application/json ; charset=utf-8");
        xmlhttp.send(msg);
    }
    else if (method=="get"){
        xmlhttp.open("GET", url, true)
        xmlhttp.send()
    }
    else {console.log('requests type must in "get","post"')}
};
//调用ajax写入基础设置字段
ajax_rqs("get","http://localhost:5000/basic_setting","",function (data){bs_insert(data)});


//////////////////////////////////////////////////////////////
//设置选项渲染
function render_ds_rows(ed_ele,setting_objs){
    var menu = ed_ele.parentNode;
    for (var i=0;i<setting_objs.length;i++){
        var obj_row = document.createElement("div")
        obj_row.setAttribute("class","sets")
        //title渲染
        var obj_title = document.createElement("div")
        obj_title.setAttribute("class","sets1")
        obj_title.setAttribute("name",setting_objs[i]['name'])
        obj_title.appendChild(document.createTextNode(setting_objs[i]['title']))
        //操作分类渲染
        var set_type = setting_objs[i]['type']
        if (set_type == "input"){
            var obj_set = document.createElement("input")
        }
        else if (set_type == "pwd"){
            var obj_set = document.createElement("input")
            obj_set.setAttribute("type","password")
        }
        else if(set_type =="select"){
            var obj_set = document.createElement("select")
            var select_option = document.createElement("option")
            var select_datas = setting_objs[i]["datas"]
            for (var j=0;j<select_datas.length;j++){
                option_ele = select_option.cloneNode(true)
                var text = document.createTextNode(select_datas[j])
                option_ele.setAttribute("value",select_datas[j])
                option_ele.appendChild(text)
                obj_set.appendChild(option_ele)
            }
        }
        else if(set_type =="select_rt"){
            var obj_set = document.createElement("select")
            var select_option = document.createElement("option")
            var select_datas = setting_objs[i]["datas"]
            var func_r = setting_objs[i]["func"]
            for (var j=0;j<select_datas.length;j++){
                option_ele = select_option.cloneNode(true)
                var text = document.createTextNode(select_datas[j])
                option_ele.setAttribute("value",select_datas[j])
                option_ele.appendChild(text)
                obj_set.appendChild(option_ele)
            }
            obj_set.setAttribute("onchange",func_r+"(this)")
        }
        obj_set.setAttribute("class","sets2");
        
        obj_row.appendChild(obj_title)
        obj_row.appendChild(obj_set)
        menu.insertBefore(obj_row,ed_ele)
    }
}

//选择数据源类型实时渲染设置项
function ds_info(obj){
    var block = obj.parentNode;
    var parent_ele = block.parentNode;
    var bro_eles = parent_ele.children;
    var st;
    var ed;
    var ed_ele;
    var selectIdx = obj.selectedIndex;
    var msg;
    
    for (var i=0; i<bro_eles.length;i++){
        if (bro_eles[i]==block){
            st=i+1
        }

        if (bro_eles[i].children.length>0){
            if(bro_eles[i].children[0].getAttribute("name")=="dvt"){
                ed=i
                ed_ele = bro_eles[i]
                break
            }
        }
    }

    //清除上次渲染数据
    if (ed>st){
        for (var j=ed-1;j>=st;j--){
            parent_ele.removeChild(bro_eles[j])
        }
    }
    if (selectIdx==1){
        msg = JSON.stringify({"dst":"mysql"})
    }
    else if (selectIdx==2){
        msg = JSON.stringify({"dst":"xlsx"})
    }
    //请求接口渲染数据
    if (selectIdx !=0){
        var url="http://localhost:5000/setting_detail"
        ajax_rqs("post",url,msg,function(data){render_ds_rows(ed_ele,data)})
        
    }
}

//选择excel文件实时渲染sheet选项
function show_sheets(obj){
    var selectIdx = obj.selectedIndex;
    var block = obj.parentNode;
    var parent_ele = block.parentNode;
    var bro_eles = parent_ele.children;
    var ed_ele;
    for (var i=0;i<bro_eles.length;i++){
        if (bro_eles[i]==block){
            ed_ele = bro_eles[i+1]
            break
        }
    }
    if (ed_ele.children[0].getAttribute("name")=="choose_sheet"){
        parent_ele.removeChild(ed_ele);
    }
    var fname = obj[selectIdx].getAttribute("value");
    if (selectIdx != 0 ){
        msg = JSON.stringify({"fname":fname})
        //请求接口渲染数据
        var url="http://localhost:5000/xlsxSheetnames"
        ajax_rqs("post",url,msg,function(data){render_ds_rows(ed_ele,data)})
    }
}

//////////////////////////////////////////////////////////////
//column渲染
function render_column(block_ele,datas){
    if(datas.length>0){
        for (var i=0;i<datas.length;i++){
            var text = document.createTextNode(datas[i]['name'])
            var column = document.createElement("div")
            column.setAttribute("class","col")
            column.setAttribute("value",datas[i]["value"])
            column.appendChild(text)
            block_ele.appendChild(column)
        }
    }
    else{
        alert("Data-Source ERROR !")
    }
}

//保存基础信息(+session)
function save_basic(obj){
    var setting_menu = obj.parentNode;
    var settings = setting_menu.children;
    var split_num;
    var column_block = document.getElementById("main");
    var column_eles = column_block.children;
    var isValid = true;
    //获取分割行
    for (var i=1;i<settings.length;i++){
        if (settings[i].getAttribute("name")=="split"){
            split_num = i;
            break
        };
    };

    basic_settings=[];
    if (split_num>2){
        for (var i=1;i<split_num-1;i++){
            var setting_row = settings[i]
            var title_name=setting_row.children[0].getAttribute("name")
            var value_obj=setting_row.children[1]
            if (value_obj.tagName == "INPUT"){
                var value=value_obj.value
            }
            else if (value_obj.tagName == "SELECT"){
                var vidx=value_obj.selectedIndex
                var value=value_obj.options[vidx].getAttribute("value")
            }
            var setting = {"name":title_name,"value":value}
            if (title_name != ""){
                basic_settings.push(setting)
            }
        }
    }
    //设置数组校验
    for (var i=0;i<basic_settings.length;i++){
        if(basic_settings[i]["value"]==""){
            isValid = false
            break
        }
    }
    if (basic_settings.length<4){
        isValid = false
    }
    //判断port是否为数字
    if (isNaN(basic_settings[2]["value"]) && basic_settings[0]["value"]=="mysql"){
        isValid = false
    }

    //校验成功后post请求
    if (isValid){
        //清除columns
        if (column_eles.length>0){
            for (var j=column_eles.length-1;j>=0;j--){
                column_block.removeChild(column_eles[j])
            }
        }
        
        msg=JSON.stringify(basic_settings)
        //msg=basic_settings
        //请求接口渲染数据
        var url="http://localhost:5000/column_render"
        ajax_rqs("post",url,msg,function(data){render_column(column_block,data)})
        //储存msg
        window.sessionStorage.setItem("basic_inf",msg)
    }
    else{
        //设置缺失警告
        alert("DataSource-settings ERROR !")
    }
}