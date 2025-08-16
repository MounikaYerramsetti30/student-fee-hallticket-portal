from flask import Flask, request, jsonify, send_from_directory
import sqlite3
import os

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DB_FILE = os.path.join(BASE_DIR, "students.db")

# Initialize SQLite database if not exists
def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY,
            name TEXT,
            course TEXT,
            year TEXT,
            dob TEXT,
            fee_due INTEGER,
            hall_ticket TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Serve login.html
@app.route('/')
def serve_login():
    return send_from_directory(BASE_DIR, 'login.html')

# Serve static files like CSS and JS
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(BASE_DIR, filename)

# Get all students (for script.js to verify login)
@app.route('/students', methods=['GET'])
def get_students():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT * FROM students")
    rows = c.fetchall()
    conn.close()

    students = []
    for r in rows:
        students.append({
            "id": r[0],
            "name": r[1],
            "course": r[2],
            "year": r[3],
            "password": r[4],  # DOB used as password
            "feeDue": r[5],
            "hallTicket": r[6] if r[6] else "#"
        })
    return jsonify(students)

# Optional: Add student (for admin)
@app.route('/add_student', methods=['POST'])
def add_student():
    data = request.get_json()
    if not data.get('id'):
        return jsonify({"error": "Roll No is required"}), 400

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    try:
        c.execute('''
            INSERT INTO students (id, name, course, year, dob, fee_due, hall_ticket)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('id'),
            data.get('name'),
            data.get('course'),
            data.get('year'),
            data.get('password', ""),  # DOB as password
            data.get('feeDue', 0),
            data.get('hallTicket', "")
        ))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Student ID already exists"}), 400
    conn.close()
    return jsonify({"message": f"Student {data.get('id')} added successfully."})

# Optional: Delete student
@app.route('/delete_student', methods=['DELETE'])
def delete_student():
    roll_no = request.args.get('roll_no')
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("DELETE FROM students WHERE id=?", (roll_no,))
    if c.rowcount == 0:
        conn.close()
        return jsonify({"error": "Student not found."}), 404
    conn.commit()
    conn.close()
    return jsonify({"message": f"Student {roll_no} deleted successfully."})

if __name__ == '__main__':
    app.run(debug=True)
