import flask
import socket
from gevent import pywsgi
import json
import dataProduce
import os
import jinja2

path=os.path.dirname(os.path.abspath(__file__))
path_load=jinja2.FileSystemLoader(path)

#realIP=[(s.connect(('8.8.8.8', 53)), s.getsockname()[0], s.close()) for s in [socket.socket(socket.AF_INET, socket.SOCK_DGRAM)]][0][1]
#print(realIP+":5000/basic_setting")
app=flask.Flask(__name__,static_folder=path+'/static')
app.config['UPLOAD_FOLDER']='xlsx_files/'
def nocache(response):
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE'
    return response
app.after_request(nocache)

@app.route('/')
def home_page():
    t=jinja2.Environment(loader=path_load).get_template('plug_form.html')
    return t.render().encode('utf-8')

@app.route('/basic_setting',methods=['GET','POST'])
def basic_setting():
    settings=[
        {
                'title':'Data Source Type',
                'name':'dst',
                'type':'select_rt',
                'func':'ds_info',
                'datas':[
                    '[select data type]',
                    'mysql',
                    'xlsx'
                ]
            },
        {
                'title':'Data Visualization Type',
                'name':'dvt',
                'type':'select',
                'datas':[
                    'table',
                    'select2'
                ]
            }
    ]
    return json.dumps(settings)

@app.route('/setting_detail',methods=['GET','POST'])
def setting_detail_render():
    if flask.request.method =='POST':
        json_data=flask.request.json
        data=dataProduce.setting_detail(json_data['dst'])
    return json.dumps(data)


@app.route('/column_render',methods=['GET','POST'])
def column_datas():
    if flask.request.method =='POST':
        json_data=flask.request.json
        if json_data[0]['value']=='xlsx' and json_data[1]['value']!='':
            fn=json_data[1]['value']
            sn=json_data[2]['value']
            col_render=dataProduce.xlsx_columns(fn,sn)
        elif json_data[0]['value']=='mysql':
            dbInfo={
                'host':json_data[1]['value'],
                'port':int(json_data[2]['value']),
                'usr':json_data[3]['value'],
                'pwd':json_data[4]['value'],
                'db':json_data[5]['value'],
                'tb':json_data[6]['value']
            }
            try:
                col_render=dataProduce.mysql_show_cols(dbInfo)
            except:
                col_render=[]
        return json.dumps(col_render)
        
@app.route('/xlsxSheetnames',methods=['POST','GET'])
def xlsxdata():
    if flask.request.method=='POST':
        json_data=flask.request.json
        data=dataProduce.sheetname(json_data['fname'])
        return json.dumps(data)

@app.route('/data_render',methods=['GET','POST'])
def source_list():
    if flask.request.method =='POST':
        json_data=flask.request.json
        basics=eval(json_data['basic_inf'])
        ds_type=basics[0]['value']
        if ds_type=='mysql':
            sql=dataProduce.create_sql(json_data)
            dbinfo={
                'host':basics[1]['value'],
                'port':int(basics[2]['value']),
                'usr':basics[3]['value'],
                'pwd':basics[4]['value'],
                'db':basics[5]['value'],
                'tb':basics[6]['value']
            }
            #print(sql)
            cols=sql.replace('select','').replace(' ','').split('from')[0].split(',')
            data=[cols]+dataProduce.mysql_search(dbinfo,sql)
        elif ds_type=='xlsx':
            fn=basics[1]['value']
            sn=basics[2]['value']
            data=dataProduce.xlsx_produce(fn,sn,json_data)

    return json.dumps(data)





if __name__=='__main__':
    server = pywsgi.WSGIServer(('0.0.0.0', 5000), app)
    server.serve_forever()