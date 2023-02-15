//下拉菜单渲染
var caculation_selections = ["sum","mid","avg","max","min","count"];
var rule_selections = [">",">=","<","<=","=","<>","in"];

function selection(stype){
    var selection = document.createElement("select");
    var select_option = document.createElement("option");
    if (stype=="name"){
        var selections = ["None","asc","desc"];
    }
    else if (stype=="caculation"){
        var selections = caculation_selections;
    }
    else if (stype.split("_")[0]=="rule"){
        var selections = rule_selections;
    }
    else {
        var selections = []
    };
    
    for (var i=0;i<selections.length;i++){
        var option_ele = select_option.cloneNode(true);
        var text = document.createTextNode(selections[i])
        option_ele.setAttribute("value",selections[i])
        option_ele.appendChild(text)
        selection.appendChild(option_ele)
    }
    return selection
}

//根据字段创建设置
function create_setting(obj,col_ele){
    var sets_row = document.createElement("div")
    var sets1 = sets_row.cloneNode(true)
    var sets2 = sets_row.cloneNode(true)
    var id = col_ele.parentNode.getAttribute("id");
    var text = col_ele.innerText;
    var value = col_ele.getAttribute("value");
    var col_action = Number(col_ele.getAttribute("action"))
    var save_button = document.createElement("button")
    var save_text = document.createTextNode("Save")
    var ele_idx = 0;
    //session储存字段下标
    for (var i=0;i<col_ele.parentNode.children.length;i++){
        if (col_ele == col_ele.parentNode.children[i]){
            ele_idx = i
            break
        }
    }
    window.sessionStorage.setItem("temp_colset",ele_idx)

    save_button.appendChild(save_text)
    save_button.setAttribute("onclick","save_col(this)")
    save_button.setAttribute("class","sets")
    save_button.setAttribute("style","margin-top: 15px")
    sets_row.setAttribute("class","sets")
    sets1.setAttribute("class","sets1")
    sets2.setAttribute("class","sets2")
    //创建下拉菜单
    var col_selection = selection(id);
    if (id=="name"){
        //升降序
        var title1 = document.createTextNode("rank:")
        
        //获取缓存配置
        var rk = window.sessionStorage.getItem("rank_key");
        var rv = window.sessionStorage.getItem("rank_idx");
        
        if (value == rk){
            col_selection.options[rv].selected=true;
        }
        //创建行
        var name_row = sets_row.cloneNode(true)
        var text_ele = document.createTextNode("column: "+text)
        name_row.setAttribute("type",id)
        name_row.setAttribute("name",value)
        name_row.setAttribute("class","sets")
        var row = sets_row.cloneNode(true)
        var c_sets1 = sets1.cloneNode(true)
        var c_sets2 = sets2.cloneNode(true)
        c_sets1.appendChild(title1)
        c_sets2.appendChild(col_selection)
        row.appendChild(c_sets1)
        row.appendChild(c_sets2)
        name_row.appendChild(text_ele)
        obj.appendChild(name_row)
        obj.appendChild(row)
    }
    else if (id=="caculation"){
        //计算规则
        var title1 = document.createTextNode("method:")
        /*
        //获取缓存配置
        var session_config = window.sessionStorage.getItem(value+"_caculation");
        col_selection.options[session_config].selected=true;
        */
        col_selection.options[col_action].selected=true;
        //创建行
        var name_row = sets_row.cloneNode(true)
        var text_ele = document.createTextNode("column: "+text)
        name_row.setAttribute("type",id)
        name_row.setAttribute("name",value)
        name_row.setAttribute("class","sets")
        var row = sets_row.cloneNode(true)
        var c_sets1 = sets1.cloneNode(true)
        var c_sets2 = sets2.cloneNode(true)
        c_sets1.appendChild(title1)
        c_sets2.appendChild(col_selection)
        row.appendChild(c_sets1)
        row.appendChild(c_sets2)
        name_row.appendChild(text_ele)
        obj.appendChild(name_row)
        obj.appendChild(row)
    }
    else if (id.split("_")[0]=="rule"){
        //筛选规则
        var title1 = document.createTextNode("method:")
        var value_input = document.createElement("input")
        value_input.setAttribute("class","sets")
        /*
        //获取缓存配置
        var session_configS = window.sessionStorage.getItem(value+"_rule");
        var session_config = JSON.parse(session_configS)
        if (session_config != null){
            col_selection.options[session_config["mthd"]].selected=true;
            value_input.value = session_config["v"];
        }
        */
        col_selection.options[col_action].selected=true;
        value_input.value = col_ele.getAttribute("action_value");
        //创建行
        var name_row = sets_row.cloneNode(true)
        var text_ele = document.createTextNode("column: "+text)
        name_row.setAttribute("type",id)
        name_row.setAttribute("name",value)
        name_row.setAttribute("class","sets")
        var row1 = sets_row.cloneNode(true)
        var c_sets1 = sets1.cloneNode(true)
        var c_sets2 = sets2.cloneNode(true)
        c_sets1.appendChild(title1)
        c_sets2.appendChild(col_selection)
        row1.appendChild(c_sets1)
        row1.appendChild(c_sets2)
        name_row.appendChild(text_ele)
        obj.appendChild(name_row)
        obj.appendChild(row1)
        obj.appendChild(value_input)
    }
    obj.appendChild(save_button);
}
//根据字段渲染设置
function column_setting(obj){
    var col_ele=obj.parentNode;
    var input_area = document.getElementById("basic_set");
    var inputChilds = input_area.children;
    //定位分隔符
    var split_num;
    for (var i=0;i<inputChilds.length;i++){
        if (inputChilds[i].getAttribute("name")=="split"){
            split_num = i
            break
        }
    }
    //倒序删除规避下标冲突
    for (var j=inputChilds.length-1;j>split_num;j--){
        input_area.removeChild(inputChilds[j])
    }
    //渲染字段设置
    create_setting(input_area,col_ele);
}


//保存字段设置(session)
function save_col(obj){
    var setting_menu = obj.parentNode;
    var col_type;
    var settings = setting_menu.children;
    
    for (var i=1;i<settings.length;i++){
        if (settings[i].getAttribute("name")=="split"){
            split_num = i
            col_type = settings[i+1].getAttribute("type")
            col_name = settings[i+1].getAttribute("name")
            break
        }
    }
    var col_idx = window.sessionStorage.getItem("temp_colset")
    var col_ele = document.getElementById(col_type).children[col_idx]

    //字段配置
    var setting_select =settings[split_num+2].children[1].children[0]
    var selected_idx = setting_select.selectedIndex
    if (col_type == "name"){
        if (selected_idx != 0){
            window.sessionStorage.setItem("rank_key",col_name);
            window.sessionStorage.setItem("rank_idx",selected_idx);
        }
    }
    else if (col_type == "caculation"){
        //window.sessionStorage.setItem(col_name+"_caculation",selected_idx);
        col_ele.setAttribute("action",selected_idx)
    }
    else if (col_type.split("_")[0] == "rule"){
        var method_v = settings[split_num+3].value;
        //判断的数据类型
        var v_check = false;
        //大小比较运算符数据类型判断为数字或日期
        if ((!isNaN(method_v) || !isNaN(Date.parse(method_v))) && selected_idx<4){
            v_check = true;
        }
        //等于不等于包含运算符不限制数据类型
        else if(selected_idx>=4){
            v_check = true;
        }
        //保存校验通过数据
        if (method_v != "" && v_check){
            /*
            col_value = {
                "mthd":selected_idx,
                "v":method_v
            };
            window.sessionStorage.setItem(col_name+"_rule",JSON.stringify(col_value));
            */
            col_ele.setAttribute("action",selected_idx)
            col_ele.setAttribute("action_value",method_v)
        }
        //校验失败报错
        else if (method_v == ""){
            alert("INPUT is EMPTY !")
        }
        else if (!v_check){
            alert("INPUT is INVALID !")
        }
    }
}

