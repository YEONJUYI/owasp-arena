from flask import Flask, render_template, request, session, redirect, url_for, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
app.secret_key = 'supersecretkey123'  # 취약점: 약한 시크릿 키

CORS(app, origins=[
    "https://*.vercel.app",
    "http://localhost:3000"
])

# 취약점: 기본 크리덴셜 그대로 사용 (admin:admin)
ADMIN_CREDENTIALS = {
    'username': 'admin',
    'password': 'admin'
}

FLAG = 'OWASP{d3fault_cr3ds_ar3_d4ng3r0us}'

@app.route('/')
def index():
    return render_template('index.html')

# 취약점: robots.txt에 민감한 경로 노출
@app.route('/robots.txt')
def robots():
    return app.response_class(
        response="""User-agent: *
Disallow: /admin
Disallow: /admin/dashboard
Disallow: /config
""",
        mimetype='text/plain'
    )

# 취약점: 설정 파일 경로 노출
@app.route('/config')
def config():
    return jsonify({
        'app': 'OWASP Arena',
        'version': '1.0.0',
        'debug': True,         # 취약점: debug 모드 노출
        'admin_path': '/admin' # 취약점: 관리자 경로 노출
    })

@app.route('/admin', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        # 취약점: 기본 크리덴셜 검증
        if username == ADMIN_CREDENTIALS['username'] and \
           password == ADMIN_CREDENTIALS['password']:
            session['admin'] = True
            return redirect(url_for('admin_dashboard'))
        else:
            return render_template('admin_login.html', error='Invalid credentials')

    return render_template('admin_login.html')

@app.route('/admin/dashboard')
def admin_dashboard():
    if not session.get('admin'):
        return redirect(url_for('admin_login'))
    return render_template('admin_dashboard.html', flag=FLAG)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)