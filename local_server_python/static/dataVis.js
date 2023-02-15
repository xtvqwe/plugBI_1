
//AJAX请求接口生成基础设置元素(json请求)
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

function table_render(datas,obj){
    var rows = datas.length-1    
    var tbdata_check = false;
    var th_datas;
    if (rows>-1){
        th_datas=datas[0];
        if (th_datas.length>0){
            tbdata_check = true;
        }
    };
    if (tbdata_check){
        var table = document.createElement("table") 
        var thead = document.createElement("thead")
        var thr = document.createElement("tr")
        var tbody = document.createElement("tbody")
        for (var i=0;i<th_datas.length;i++){
            var th = document.createElement("th")
            var vText = document.createTextNode(th_datas[i])
            th.appendChild(vText)
            thr.append(th)
        }
        thead.appendChild(thr)
        table.appendChild(thead)
        thead.setAttribute("bgcolor","#bbb")
        for (var i=0;i<rows;i++){
            var rid = i+1
            var tbr = document.createElement("tr")
            for (var j=0;j<th_datas.length;j++){
                var td = document.createElement("td")
                var tdText = document.createTextNode(datas[rid][j])
                td.appendChild(tdText)
                tbr.appendChild(td)
            }
            tbody.appendChild(tbr)
        }
        table.appendChild(tbody)
        table.setAttribute("style","border-collapse:collapse; border-style:solid;text-align:center;")
        table.setAttribute("width","100%")
        table.setAttribute("border","1px")
        obj.appendChild(table)
    }
        
}

function charts_render(datas){
    var bs_session = JSON.parse(window.sessionStorage.getItem("basic_inf"))
    var chartType = bs_session[bs_session.length-1]['value']
    var chart = document.getElementById("chartshow")
    //清空chart
    var chart_inner = chart.children
    if (chart_inner.length>0){
        for (var j=chart_inner.length-1;j>=0;j--){
            chart.removeChild(chart_inner[j])
        }
    }
    if (chartType =="table"){
        table_render(datas,chart)
    }
}

function search(){
    var names_ele = document.getElementById("name").children
    var names=[]
    for (var i=0;i<names_ele.length;i++){
        names.push(names_ele[i].getAttribute("value"))
    }
    var cals_ele = document.getElementById("caculation").children
    var caculations = []
    for (var i=0;i<cals_ele.length;i++){
        var cal={
            "name":cals_ele[i].getAttribute("value"),
            "action":cals_ele[i].getAttribute("action")
        }
        caculations.push(cal)
    }

    var rule_parent = document.getElementById("rule_0").parentNode
    var multi_rules = []
    for (var i=0;i<rule_parent.children.length;i++){
        if(rule_parent.children[i].getAttribute("class")=="object"){
            if(rule_parent.children[i].getAttribute("id").split("_")[0]=="rule"){
                var rules=[]
                var rules_ele = rule_parent.children[i]
                for(var j=0;j<rules_ele.children.length;j++){
                    var rule_ele = rules_ele.children[j]
                    var rule = {
                        "name":rule_ele.getAttribute("value"),
                        "action":rule_ele.getAttribute("action"),
                        "action_value":rule_ele.getAttribute("action_value")
                    }
                    rules.push(rule)
                }
                multi_rules.push(rules)
            }
        }
    }

    if(names.length>0 || caculations.length>0){
        require_data={
            "basic_inf":sessionStorage.getItem("basic_inf"),
            "names":names,
            "caculations":caculations,
            "rules":multi_rules
        }
        var msg = JSON.stringify(require_data)
        var url="http://localhost:5000/data_render"
        //console.log(msg)
        ajax_rqs("post",url,msg,function(data){charts_render(data)})
    }
}

