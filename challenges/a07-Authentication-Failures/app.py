from flask import Flask, render_template, request, jsonify, make_response, redirect, url_for
from flask_cors import CORS
import base64
import json

app = Flask(__name__)

CORS(app, origins=[
    "https://*.vercel.app",
    "http://localhost:3000"
])

FLAG = 'OWASP{jwt_4lg_n0n3_byp4ss_4tt4ck}'

USERS = {
    'user1': 'password123',
    'admin': 'sup3rs3cr3t!'
}

def b64url_encode(data):
    if isinstance(data, dict):
        data = json.dumps(data, separators=(',', ':'))
    return base64.urlsafe_b64encode(data.encode()).rstrip(b'=').decode()

def b64url_decode(s):
    padding = 4 - len(s) % 4
    if padding != 4:
        s += '=' * padding
    return base64.urlsafe_b64decode(s)

def make_jwt(username, role):
    header    = b64url_encode({'alg': 'HS256', 'typ': 'JWT'})
    payload   = b64url_encode({'user': username, 'role': role})
    signature = b64url_encode('dummy_signature_not_verified')
    return f'{header}.{payload}.{signature}'

def parse_jwt(token):
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header  = json.loads(b64url_decode(parts[0]))
        payload = json.loads(b64url_decode(parts[1]))

        # 취약점: alg=none이면 서명 검증 없이 payload 신뢰
        if header.get('alg', '').lower() == 'none':
            return payload

        # HS256이어도 서명을 실제로 검증하지 않음 (취약점)
        return payload
    except:
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        if username in USERS and USERS[username] == password:
            role  = 'admin' if username == 'admin' else 'user'
            token = make_jwt(username, role)

            # 토큰을 화면에 노출하지 않고 쿠키에만 저장
            resp = make_response(redirect(url_for('dashboard')))
            resp.set_cookie('token', token, httponly=False)  # httponly=False: JS로 읽을 수 있게 (힌트)
            return resp

        return render_template('login.html', error='아이디 또는 비밀번호가 틀렸습니다.')
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    token = request.cookies.get('token')
    if not token:
        return redirect(url_for('login'))
    payload = parse_jwt(token)
    if not payload:
        return redirect(url_for('login'))

    # 힌트만 노출, 토큰 값은 직접 DevTools에서 찾아야 함
    return render_template('dashboard.html',
        user=payload.get('user'),
        role=payload.get('role'),
        hint='개발자 도구 → Application → Cookies에서 token 값을 확인해보세요.'
    )

@app.route('/admin')
def admin():
    # 브라우저 직접 접근 차단
    user_agent = request.headers.get('User-Agent', '')
    if 'Mozilla' in user_agent:
        return render_template('admin.html',
            error='curl 또는 Burp Suite로만 접근 가능합니다.',
            hint='Authorization: Bearer <token> 헤더를 사용하세요.'
        )

    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return jsonify({'error': '토큰이 없습니다.'}), 401

    payload = parse_jwt(token)
    if not payload:
        return jsonify({'error': '유효하지 않은 토큰입니다.'}), 401

    if payload.get('role') == 'admin':
        return jsonify({'flag': FLAG, 'message': 'JWT alg:none 공격 성공!'})

    return jsonify({'error': f'권한 없음. 현재 role: {payload.get("role")}'}), 403

@app.route('/logout')
def logout():
    resp = make_response(redirect(url_for('login')))
    resp.delete_cookie('token')
    return resp

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5006, debug=False)