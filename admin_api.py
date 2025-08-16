from flask import Flask, request, jsonify, send_from_directory
import sqlite3
import os

app = Flask(__name__)
DB_FILE = "students.db"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def serve_login():
    return send_from_directory(BASE_DIR, 'login.html')

@app.route('/student_login', methods=['POST'])
def student_login():
    data = request.get_json()
    student_id = data.get("id")
    dob = data.get("dob")

    conn = get_db_connection()
    student = conn.execute("SELECT * FROM students WHERE id=? AND dob=?", (student_id, dob)).fetchone()
    conn.close()

    if student:
        return jsonify({"success": True, "student": dict(student)})
    return jsonify({"success": False, "error": "Invalid Roll No or DOB"}), 400

@app.route('/student_info')
def student_info():
    student_id = request.args.get("id")
    conn = get_db_connection()
    student = conn.execute("SELECT * FROM students WHERE id=?", (student_id,)).fetchone()
    conn.close()

    if student:
        return jsonify({"student": dict(student)})
    return jsonify({"error": "Student not found"}), 404

# Serve static files like CSS and JS
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(BASE_DIR, filename)

if __name__ == '__main__':
    app.run(debug=True)
