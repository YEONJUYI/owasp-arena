from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

CORS(app, origins=[
    "https://*.vercel.app",
    "http://localhost:3000"
])

FLAG = 'OWASP{supp1y_ch41n_b4ckd00r_f0und}'
BACKDOOR_SECRET = 'ld4sh-t3lemetry-k3y-9x2m'

@app.route('/')
def index():
    return render_template('index.html')

# 힌트 1: package.json 노출 - ld4sh 패키지가 수상하지만 키는 없음
@app.route('/package.json')
def package():
    data = {
        "name": "owasp-arena-shop",
        "version": "1.0.0",
        "dependencies": {
            "express": "^4.18.2",
            "lodash": "^4.17.15",
            "ld4sh": "^1.2.0",          # 수상한 패키지
            "axios": "^1.4.0"
        },
        "scripts": {
            "start": "node index.js",
            "postinstall": "node node_modules/ld4sh/index.js"  # 힌트: 설치 후 자동 실행
        }
    }
    return jsonify(data)

# 힌트 2: 악성 패키지 내부 코드 노출 - 키가 난독화되어 숨겨져 있음
@app.route('/node_modules/ld4sh/index.js')
def backdoor_module():
    # 실제 악성 패키지처럼 난독화된 코드를 노출
    # 키: ld4sh-t3lemetry-k3y-9x2m 를 base64로 인코딩 → bGQ0c2gtdDNsZW1ldHJ5LWszeTkteG0=
    code = """(function(){
    var _0x1a2b=['bGQ0c2gtdDNsZW1ldHJ5LWszeTkteG0=','L2FwaS9sZDRzaC90ZWxlbWV0cnk=','WC1UZWxlbWV0cnkta2V5','UE9TVA=='];
    var _k = Buffer.from(_0x1a2b[0], 'base64').toString();
    var _e = Buffer.from(_0x1a2b[1], 'base64').toString();
    var _h = Buffer.from(_0x1a2b[2], 'base64').toString();
    // telemetry 데이터 수집 후 전송
    require('http').request({
        host: 'localhost', port: 5002,
        path: _e, method: Buffer.from(_0x1a2b[3],'base64').toString(),
        headers: { [_h]: _k }
    }).end();
})();"""
    return app.response_class(code, mimetype='application/javascript')

# 백도어 엔드포인트 - curl로 직접 요청해야만 플래그 획득 가능
@app.route('/api/ld4sh/telemetry', methods=['POST'])
def backdoor():
    # Content-Type 확인 - 브라우저 form 제출 차단
    content_type = request.content_type or ''
    user_agent = request.headers.get('User-Agent', '')

    if 'application/x-www-form-urlencoded' in content_type:
        return jsonify({'error': 'Invalid request format'}), 400
    if 'Mozilla' in user_agent:
        return jsonify({'error': 'Direct browser access not allowed'}), 403

    secret = request.headers.get('X-Telemetry-Key')
    if not secret:
        return jsonify({'error': 'Missing telemetry key'}), 401
    if secret != BACKDOOR_SECRET:
        return jsonify({'error': 'Invalid key'}), 403

    return jsonify({
        'status': 'telemetry received',
        'server_data': {
            'flag': FLAG,
            'message': '백도어를 통해 서버 내부 데이터에 접근했습니다.'
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=False)