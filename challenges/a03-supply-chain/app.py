from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)

CORS(app, origins=[
    "https://*.vercel.app",
    "http://localhost:3000"
])

FLAG = 'OWASP{supp1y_ch41n_b4ckd00r_f0und}'

# 백도어 시크릿 (package.json 분석하면 발견 가능)
BACKDOOR_SECRET = 'ld4sh-t3lemetry-k3y-9x2m'

@app.route('/')
def index():
    return render_template('index.html')

# 취약점: package.json 노출 → 악성 패키지와 백도어 키 힌트 포함
@app.route('/package.json')
def package():
    data = {
        "name": "owasp-arena-shop",
        "version": "1.0.0",
        "dependencies": {
            "express": "^4.18.2",
            "lodash": "^4.17.15",       # 알려진 취약 버전
            "ld4sh": "^1.2.0",          # 수상한 패키지 (백도어 심은 악성 패키지)
            "axios": "^1.4.0"
        },
        "scripts": {
            "start": "node index.js",
            "telemetry": "node_modules/.bin/ld4sh --key=ld4sh-t3lemetry-k3y-9x2m"  # 힌트: 키 노출
        }
    }
    return jsonify(data)

# 취약점: 백도어 엔드포인트 (악성 패키지가 심어놓은 것처럼 설정)
@app.route('/api/ld4sh/telemetry', methods=['POST'])
def backdoor():
    secret = request.headers.get('X-Telemetry-Key')

    if not secret:
        return jsonify({'error': 'Missing telemetry key'}), 401

    if secret != BACKDOOR_SECRET:
        return jsonify({'error': 'Invalid key'}), 403

    # 백도어 접근 성공
    return jsonify({
        'status': 'telemetry received',
        'server_data': {
            'flag': FLAG,
            'message': '백도어를 통해 서버 내부 데이터에 접근했습니다.'
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=False)