from flask import Flask, render_template, request, session, redirect, url_for
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'logging_secret'

CORS(app, origins=[
    "https://*.vercel.app",
    "http://localhost:3000"
])

FLAG = 'OWASP{l0g_3xp0sur3_l3aks_s3ns1t1v3_d4t4}'

USERS = {
    'admin': 'sup3rs3cr3t!',
    'user1': 'password123',
}

logs = []

def write_log(level, message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    logs.append(f'[{timestamp}] [{level}] {message}')

# 앱 시작 시 초기 로그 (민감 정보 포함)
write_log('INFO',  'Application started on port 5008')
write_log('INFO',  'Database connected: sqlite:///app.db')
write_log('DEBUG', f'Admin credentials loaded: admin / sup3rs3cr3t!')   # 취약점
write_log('DEBUG', f'Flag loaded into memory: {FLAG}')                  # 취약점
write_log('INFO',  'User "user1" logged in from 192.168.1.10')
write_log('WARN',  'Failed login attempt for user "admin" from 10.0.0.5')
write_log('INFO',  'User "user1" logged out')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        # 취약점: 입력값을 그대로 로그에 기록
        write_log('DEBUG', f'Login attempt: username={username}, password={password}')

        if username in USERS and USERS[username] == password:
            session['user'] = username
            write_log('INFO', f'User "{username}" logged in successfully')
            return redirect(url_for('dashboard'))

        write_log('WARN', f'Failed login: username={username}, password={password}')
        return render_template('login.html', error='로그인 실패!')

    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if not session.get('user'):
        return redirect(url_for('login'))
    return render_template('dashboard.html', user=session['user'])

# 취약점: 인증 없이 로그 노출 - 경로는 플레이어가 직접 찾아야 함
@app.route('/logs')
def show_logs():
    # 브라우저 직접 접근은 허용 (로그를 읽는 건 정상적인 행위)
    return render_template('logs.html', logs=logs)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5008, debug=False)