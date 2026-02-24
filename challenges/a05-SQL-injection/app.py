from flask import Flask, render_template, request, session, redirect, url_for
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
app.secret_key = 'sqlinjection_secret'

CORS(app, origins=[
    "https://*.vercel.app",
    "http://localhost:3000"
])

FLAG = 'OWASP{sql_1nj3ct10n_byp4ss_succ3ss}'
DB_PATH = 'users.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT,
        password TEXT,
        role TEXT,
        flag TEXT
    )''')
    c.execute("DELETE FROM users")
    c.execute("INSERT INTO users VALUES (1, 'admin', 'sup3rs3cr3t!', 'admin', ?)", (FLAG,))
    c.execute("INSERT INTO users VALUES (2, 'user1', 'password123', 'user', '')")
    conn.commit()
    conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '')
        password = request.form.get('password', '')

        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()

        # 취약점: 사용자 입력을 그대로 쿼리에 삽입 (SQL Injection 취약)
        query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"

        try:
            c.execute(query)
            user = c.fetchone()
        except Exception as e:
            conn.close()
            return render_template('login.html', error=f'쿼리 오류: {str(e)}', query=query)

        conn.close()

        if user:
            session['user'] = user[1]
            session['role'] = user[3]
            session['flag'] = user[4]
            return redirect(url_for('dashboard'))
        else:
            return render_template('login.html', error='로그인 실패!', query=query)

    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if not session.get('user'):
        return redirect(url_for('login'))
    return render_template('dashboard.html',
        user=session['user'],
        role=session['role'],
        flag=session['flag']
    )

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5004, debug=False)