# Flask脱敏服务适配器
# 这个文件展示了如何将现有的Flask脱敏服务集成到YFK-admin项目中

"""
Flask脱敏服务集成说明

1. 保持现有的Flask脱敏服务 (E:\datamasking\flaskweb) 运行在端口5000
2. 前端通过API调用Flask服务进行数据脱敏处理
3. 信任值计算通过现有的YFK后端服务 (端口7878) 进行

集成步骤：

1. 启动Flask脱敏服务：
   cd E:\datamasking\flaskweb
   python main.py

2. 确保YFK后端服务运行在端口7878

3. 前端访问路径：
   http://localhost:3000/#/research/datamasking

API接口映射：

前端调用 -> Flask服务
- uploadDataFile() -> POST /upload
- processDataMasking() -> POST /process  
- viewData() -> GET /view/{data_type}
- downloadMaskedFile() -> GET /download

信任值计算：
- checkTrustValue() -> POST http://127.0.0.1:7878/api/medical_record/get_sensitive_data
- getDiseaseDataCodes() -> GET http://127.0.0.1:7878/api/medical_record/disease-data-codes

注意事项：
1. Flask服务需要支持CORS跨域请求
2. 文件上传限制16MB
3. 支持的文件格式：CSV, Excel, TXT
4. 脱敏方法：k-匿名、差分隐私、对抗生成网络
5. 应用场景：决策、展示、分析、预测
"""

# 如果需要修改Flask服务以支持CORS，可以在main.py中添加：
"""
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 启用CORS支持
"""

# 如果需要修改Flask服务的响应格式以匹配前端期望，可以修改路由返回：
"""
# 示例：修改upload路由返回格式
@app.route('/upload', methods=['POST'])
def upload():
    # ... 现有逻辑 ...
    return {
        'filename': filename,
        'headers': headers,
        'message': '文件上传成功',
        'status': 'success'
    }
"""
