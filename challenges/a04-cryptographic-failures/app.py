from flask import Flask, render_template, request, session, redirect, url_for
from flask_cors import CORS
import hashlib

app = Flask(__name__)
app.secret_key = 'crypto_secret'

CORS(app, origins=[
    "https://*.vercel.app",
    "http://localhost:3000"
])

FLAG = 'OWASP{b4s3_64_1s_n0t_3ncrypt10n}'

# 취약점: 비밀번호를 MD5로만 해싱 (salt 없음, 취약한 알고리즘)
USERS = {
    'user1': hashlib.md5('password123'.encode()).hexdigest(),   # 482c811da5d5b4bc6d497ffa98491e38
    'admin': hashlib.md5('letmein'.encode()).hexdigest(),       # 0d107d09f5bbe40cade3de5c71e9e9b7
}

def md5(s):
    return hashlib.md5(s.encode()).hexdigest()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        if username in USERS and USERS[username] == md5(password):
            session['user'] = username
            return redirect(url_for('dashboard'))

        return render_template('login.html', error='아이디 또는 비밀번호가 틀렸습니다.')
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if not session.get('user'):
        return redirect(url_for('login'))
    return render_template('dashboard.html', user=session['user'])

# 취약점: 회원 목록 API가 인증 없이 노출 + MD5 해시 그대로 반환
@app.route('/api/users')
def users():
    from flask import jsonify
    return jsonify([
        {'id': 1, 'username': 'user1', 'password_hash': USERS['user1'], 'role': 'user'},
        {'id': 2, 'username': 'admin', 'password_hash': USERS['admin'], 'role': 'admin'},
    ])

@app.route('/admin')
def admin():
    if not session.get('user'):
        return redirect(url_for('login'))
    if session['user'] != 'admin':
        return render_template('admin.html', error='관리자만 접근 가능합니다.')
    return render_template('admin.html', flag=FLAG)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=False)