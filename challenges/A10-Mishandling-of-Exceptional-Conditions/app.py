from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import sqlite3
import traceback
import os

app = Flask(__name__)

CORS(app, origins=[
    "https://*.vercel.app",
    "http://localhost:3000"
])

FLAG = 'OWASP{3xc3pt10n_h4ndl1ng_l3aks_1nt3rn4ls}'
DB_PATH = 'products.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT,
        price REAL,
        secret TEXT
    )''')
    c.execute("DELETE FROM products")
    c.execute("INSERT INTO products VALUES (1, '노트북', 1200000, ?)", (FLAG,))
    c.execute("INSERT INTO products VALUES (2, '마우스',  35000, 'nothing')")
    c.execute("INSERT INTO products VALUES (3, '키보드',  85000, 'nothing')")
    conn.commit()
    conn.close()

@app.route('/')
def index():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, name, price FROM products")
    products = c.fetchall()
    conn.close()
    return render_template('index.html', products=products)

@app.route('/product')
def product():
    product_id = request.args.get('id', '')

    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()

        # 취약점: 입력값 검증 없이 바로 쿼리 실행
        query = f"SELECT * FROM products WHERE id = {product_id}"
        c.execute(query)
        item = c.fetchone()
        conn.close()

        if not item:
            return render_template('product.html', error='상품을 찾을 수 없습니다.')

        return render_template('product.html', item=item)

    except Exception as e:
        # 취약점: 예외 발생 시 스택 트레이스와 내부 정보를 그대로 노출
        error_detail = {
            'error': str(e),
            'traceback': traceback.format_exc(),
            'query': f"SELECT * FROM products WHERE id = {product_id}",
            'db_path': os.path.abspath(DB_PATH),
            'db_schema': 'products(id, name, price, secret)',  # 취약점: 스키마 노출
            'hint': f'secret 컬럼에 흥미로운 데이터가 있을 수 있습니다.'
        }
        return render_template('error.html', detail=error_detail), 500

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5009, debug=False)