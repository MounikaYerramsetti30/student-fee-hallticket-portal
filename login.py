from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)
DB_PATH = "students.db"  # path to your database

def query_student(student_id, dob):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, course, year, fee_due, hall_ticket FROM students WHERE id=? AND dob=?", (student_id, dob))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "id": row[0],
            "name": row[1],
            "course": row[2],
            "year": row[3],
            "feeDue": row[4],
            "hallTicket": row[5]
        }
    return None

@app.route("/student_login", methods=["POST"])
def student_login():
    data = request.get_json()
    student_id = data.get("id")
    dob = data.get("dob")  # DOB in DDMMYYYY
    if not student_id or not dob:
        return jsonify({"error": "ID and DOB are required"}), 400
    
    student = query_student(student_id, dob)
    if student:
        return jsonify({"success": True, "student": student})
    else:
        return jsonify({"success": False, "error": "Invalid Roll No or DOB"}), 401

if __name__ == "__main__":
    app.run(debug=True)
