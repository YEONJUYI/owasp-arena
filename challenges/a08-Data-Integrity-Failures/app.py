from flask import Flask, render_template, request, make_response, redirect, url_for
from flask_cors import CORS
import base64
import pickle

app = Flask(__name__)

CORS(app, origins=[
    "https://*.vercel.app",
    "http://localhost:3000"
])

FLAG = 'OWASP{uns4f3_d3s3r14l1z4t10n_pwn3d}'

USERS = {
    'user1': 'password123',
}

def serialize(obj):
    # 취약점: pickle로 직렬화 후 base64 인코딩 → 역직렬화 시 임의 코드 실행 가능
    return base64.b64encode(pickle.dumps(obj)).decode()

def deserialize(data):
    try:
        # 취약점: 서명 검증 없이 pickle 역직렬화 → 악성 페이로드 실행 가능
        return pickle.loads(base64.b64decode(data))
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

        if username not in USERS or USERS[username] != password:
            return render_template('login.html', error='아이디 또는 비밀번호가 틀렸습니다.')

        obj = {'user': username, 'role': 'user'}
        token = serialize(obj)

        resp = make_response(redirect(url_for('dashboard')))
        resp.set_cookie('session_obj', token, httponly=False)
        return resp

    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    token = request.cookies.get('session_obj')
    if not token:
        return redirect(url_for('login'))

    obj = deserialize(token)
    if not obj or not isinstance(obj, dict):
        return redirect(url_for('login'))

    return render_template('dashboard.html',
        user=obj.get('user'),
        role=obj.get('role')
    )

@app.route('/admin')
def admin():
    # 브라우저 직접 접근 차단
    user_agent = request.headers.get('User-Agent', '')
    if 'Mozilla' in user_agent:
        return render_template('admin.html',
            error='curl 또는 Burp Suite로만 접근 가능합니다.'
        )

    token = request.cookies.get('session_obj')
    if not token:
        return 'No session', 401

    obj = deserialize(token)
    if not obj or not isinstance(obj, dict):
        return 'Invalid session', 400

    if obj.get('role') == 'admin':
        return {'flag': FLAG, 'message': 'Pickle 역직렬화 공격 성공!'}

    return {'error': f'권한 없음. 현재 role: {obj.get("role")}'}, 403

@app.route('/logout')
def logout():
    resp = make_response(redirect(url_for('login')))
    resp.delete_cookie('session_obj')
    return resp

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5007, debug=False)