from flask import Flask, render_template, request
from flask_cors import CORS

app = Flask(__name__)

# CORS 설정 - Vercel과 Render 허용
CORS(app, origins=[
    "https://owasp-arena-gv0nec08y-qu1cks1lv37s-projects.vercel.app",
    "https://*.vercel.app",
    "http://localhost:3000",
    "https://owasp-arena.onrender.com"  # Render 자기 자신도 추가
])

# 사용자 데이터
users = {
    1: {
        'id': 1,
        'username': 'admin',
        'email': 'admin@owasp.local',
        'role': 'Administrator',
        'secret': '🚩 Flag: OWASP{admin_pr0f1le_h4ck3d}'
    },
    2: {
        'id': 2,
        'username': 'user1',
        'email': 'user1@owasp.local',
        'role': 'User',
        'secret': 'Nothing interesting here...'
    },
    3: {
        'id': 3,
        'username': 'user2',
        'email': 'user2@owasp.local',
        'role': 'User',
        'secret': 'Just a regular user profile'
    }
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/profile')
def profile():
    # 취약점: user_id 검증 없이 직접 접근 허용
    user_id = request.args.get('user_id', 2, type=int)
    
    user = users.get(user_id)
    
    if not user:
        return "User not found", 404
    
    return render_template('profile.html', user=user)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)