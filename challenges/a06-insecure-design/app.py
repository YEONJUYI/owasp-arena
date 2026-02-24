from flask import Flask, render_template, request, session, redirect, url_for
from flask_cors import CORS
import random

app = Flask(__name__)
app.secret_key = 'insecure_design_secret'

CORS(app, origins=[
    "https://*.vercel.app",
    "http://localhost:3000"
])

FLAG = 'OWASP{1ns3cur3_d3s1gn_r3s3t_t0k3n}'

# 취약점: 예측 가능한 4자리 숫자 토큰
reset_tokens = {}

USERS = {
    'admin': {'password': 'sup3rs3cr3t!', 'email': 'admin@loginbank.com'},
    'user1': {'password': 'password123', 'email': 'user1@loginbank.com'},
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username in USERS and USERS[username]['password'] == password:
            session['user'] = username
            return redirect(url_for('dashboard'))
        return render_template('login.html', error='아이디 또는 비밀번호가 틀렸습니다.')
    return render_template('login.html')

@app.route('/forgot', methods=['GET', 'POST'])
def forgot():
    if request.method == 'POST':
        username = request.form.get('username')
        if username in USERS:
            # 취약점: 4자리 숫자 토큰 → 브루트포스 가능 (0000~9999)
            token = str(random.randint(0, 9999)).zfill(4)
            reset_tokens[username] = token
            email = USERS[username]['email']
            # 실제로는 이메일 전송이지만 여기선 화면에 힌트 노출
            return render_template('forgot.html',
                sent=True,
                email=email,
                # 취약점: 토큰 범위를 힌트로 노출
                hint=f'이메일로 4자리 숫자 코드를 전송했습니다. (0000~9999)'
            )
        return render_template('forgot.html', error='존재하지 않는 사용자입니다.')
    return render_template('forgot.html')

@app.route('/reset', methods=['GET', 'POST'])
def reset():
    if request.method == 'POST':
        username = request.form.get('username')
        token = request.form.get('token')

        if username in reset_tokens and reset_tokens[username] == token:
            # 토큰 일치 → 비밀번호 재설정 성공 (플래그 노출)
            del reset_tokens[username]
            return render_template('reset_success.html', flag=FLAG)

        return render_template('reset.html',
            username=username,
            error='토큰이 올바르지 않습니다.',
            attempts=request.form.get('attempts', 0)
        )
    return render_template('reset.html', username=request.args.get('username', ''))

@app.route('/dashboard')
def dashboard():
    if not session.get('user'):
        return redirect(url_for('login'))
    return render_template('dashboard.html', user=session['user'])

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=False)