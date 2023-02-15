function plug_form(main_id, obj_class) {
    //校验是否为兄弟元素
    var bro_check = false;
    var parent_ele = document.getElementById(main_id).parentNode;
    //获取col元素宽
    var col = document.getElementsByClassName("col")[0]
    var col_width = col.offsetWidth-10;
    for (var i = 0; i < parent_ele.children.length; i++) {
        if (parent_ele.children[i].className == obj_class) {
            console.log(main_id, obj_class, 'are brother elements')
            bro_check = true
            break
        }
    }
    if (bro_check == false) {
        console.log(main_id, obj_class, 'not brother elements')
    }


    document.onmousedown = down;
    document.onmouseup = up;
    document.onmousemove = move;

    var diffObj;
    var diffX;
    var diffY;
    var clone_obj;
    var click_status = false;
    var moveStu = false;
    //字段编辑按钮
    function create_colset(obj){
        if (obj.children.length == 0){
        var col_ele = document.createElement("div")
        col_ele.setAttribute("class","colSet")
        col_ele.setAttribute("onclick","column_setting(this)")
        var col_img = document.createElement("img")
        col_img.setAttribute("src","./edit.svg")
        col_ele.appendChild(col_img)
        obj.appendChild(col_ele)
        obj.className = "newcol"
    }
    }

    function pos(obj) {
        return [obj.offsetLeft, obj.offsetTop, obj.offsetLeft + obj.offsetWidth, obj.offsetTop + obj.offsetHeight]
    }

    function inner_check(e, outer) {
        var outerP = pos(outer);
        var opP = pos(outer.parentNode)
        if (
            e.clientX >= outerP[0] + opP[0]
            &&
            e.clientY >= outerP[1] + opP[1]
            &&
            e.clientX <= outerP[2] + opP[0]
            &&
            e.clientY <= outerP[3] + opP[1]
        ) {
            return true;
        }
        else {
            return false;
        }
    }
    //获取原始鼠标位置计算元素与鼠标偏移量

    function getDiff(e) {
        diffObj = e.target
        diffX = e.clientX - diffObj.offsetLeft - diffObj.parentNode.offsetLeft
        diffY = e.clientY - diffObj.offsetTop - diffObj.parentNode.offsetTop
    }


    //获取字段框及内涵元素位置尺寸
    var object_objs = document.getElementsByClassName(obj_class);
    var old_elm;
    function down(e) {
        var select_obj;
        select_obj = e.target;
        if (select_obj.parentNode.id == main_id || select_obj.parentNode.className == obj_class) {
            clone_obj = select_obj.cloneNode(true);
            old_elm = select_obj;
            getDiff(e);
            click_status = true;
            if (select_obj.parentNode.className == obj_class) {
                var obj_type = select_obj.parentNode.getAttribute("id");
                var obj_value = select_obj.getAttribute("value");
                //字段设置同步移除
                var setting_menu = document.getElementById("basic_set");
                var split_num;
                var settings = setting_menu.children;
                for (var i = 1;i<settings.length;i++){
                    if (settings[i].getAttribute("name")=="split"){
                        split_num = i;
                        break
                    }
                }
                //移除字段配置
                //分割线不在最后一行说明有配置项需要移除
                if (settings.length-1 > split_num){
                    var setting_col = settings[i+1];
                    if (obj_type == setting_col.getAttribute("type") && obj_value == setting_col.getAttribute("name")){
                        for (var j=settings.length-1;j>split_num;j--){
                            setting_menu.removeChild(settings[j])
                        }
                    };
                }
                //移除框内字段
                select_obj.parentNode.removeChild(select_obj);
            }
        }
    }

    function move(e) {
        if (click_status === true) {
            clone_obj.className = "newcol"
            clone_obj.style.opacity = 0.4;
            clone_obj.style.position = "absolute";
            clone_obj.style.left = e.clientX - diffX + "px";
            clone_obj.style.top = e.clientY - diffY + "px";
            clone_obj.style.width = col_width+"px";
            document.body.appendChild(clone_obj);
            moveStu = true;
        }

    }
    var leftP;
    var rightP;
    var topP;
    var bottomP;

    function up(e) {
        click_status = false;
        //确定拖拽div移动
        if (moveStu == true) {
            moveStu = false;
            //目标框可多个
            for (var i = 0; i < object_objs.length; i++) {
                //目标框位置
                var objectP = pos(object_objs[i]);
                //判断是否在目标框内
                if (inner_check(e, object_objs[i])) {
                    //复制原始字段格式加入新列表
                    var new_obj = old_elm.cloneNode(true);
                    //var obj_value =new_obj.getAttribute("value")
                    create_colset(new_obj);
                    var objs = object_objs[i].children
                    //var obj_type = object_objs[i].getAttribute("id")
                    new_obj.style.width=col_width+"px"
                    new_obj.setAttribute("action","0")
                    new_obj.setAttribute("action_value","0")

                    //没有元素直接append
                    if (objs.length == 0) {
                        object_objs[i].appendChild(new_obj);
                    }
                    else {
                        //定义插入区域
                        for (var j = 0; j < objs.length; j++) {
                            var col_obj = objs[j];
                            var colP = pos(col_obj);
                            leftP = colP[0] + objectP[0];
                            topP = colP[1] + objectP[1];
                            rightP = colP[2] + objectP[0];
                            bottomP = colP[3] + objectP[1];
                            //元素插入区域
                            if ((e.clientX > leftP && e.clientX < rightP && e.clientY > topP && e.clientY < bottomP)) {
                                object_objs[i].insertBefore(new_obj, objs[j]);
                                break
                            }
                            //末尾区域
                            else {
                                object_objs[i].appendChild(new_obj);
                            }
                        }
                    }
                    //设置按钮位置
                    var col_edit = new_obj.children[0]
                    var edit_left = col_width-col_edit.offsetLeft-15
                    if (edit_left>0){
                        col_edit.style.left = edit_left+"px"
                    }
                    /*
                    //缓存加入字段
                    if (obj_type =="name"){
                        window.sessionStorage.setItem(obj_value+'_name',0);
                    }
                    else if (obj_type =="caculation"){
                        window.sessionStorage.setItem(obj_value+'_caculation',0);
                    }
                    */
                }
            }
            document.body.removeChild(clone_obj);
        }
    }

}