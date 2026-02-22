from flask import Flask, render_template, request, make_response, redirect, url_for
from flask_cors import CORS
import base64
import json

app = Flask(__name__)

CORS(app, origins=[
    "https://*.vercel.app",
    "http://localhost:3000"
])

FLAG = 'OWASP{b4s3_64_1s_n0t_3ncrypt10n}'

# 취약점: 비밀번호를 평문으로 저장
USERS = {
    'user1': 'password123',
    'admin': 'superpassword'
}

def make_cookie(username, role):
    # 취약점: Base64는 암호화가 아닌 인코딩 - 누구나 디코딩/변조 가능
    payload = json.dumps({'user': username, 'role': role})
    return base64.b64encode(payload.encode()).decode()

def parse_cookie(cookie):
    try:
        payload = base64.b64decode(cookie.encode()).decode()
        return json.loads(payload)
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
            role = 'admin' if username == 'admin' else 'user'
            cookie = make_cookie(username, role)

            resp = make_response(redirect(url_for('dashboard')))
            # 취약점: 민감한 권한 정보를 Base64 인코딩만 해서 쿠키에 저장
            resp.set_cookie('session', cookie, httponly=False)
            return resp
        else:
            return render_template('login.html', error='아이디 또는 비밀번호가 틀렸습니다.')

    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    cookie = request.cookies.get('session')
    if not cookie:
        return redirect(url_for('login'))

    data = parse_cookie(cookie)
    if not data:
        return redirect(url_for('login'))

    # 취약점: 변조된 쿠키를 검증 없이 신뢰
    if data.get('role') == 'admin':
        return render_template('admin.html', flag=FLAG, user=data['user'])

    return render_template('dashboard.html', user=data['user'], cookie=cookie)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=False)