from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import re

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = "uploads"
DATA_FILE = "data.js"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Utility to update data.js
def update_student_fee(roll_no):
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # Match the student object in data.js by Roll No
    pattern = re.compile(r'(\{[^}]*"Roll No":\s*"' + re.escape(roll_no) + r'"[^}]*\})')
    match = pattern.search(content)
    if not match:
        return False

    student_str = match.group(1)

    # Replace the fee fields with 0
    student_str_updated = re.sub(r'"IV yr I Sem Due":\s*\d+', '"IV yr I Sem Due": 0', student_str)
    student_str_updated = re.sub(r'"upto III yr Due":\s*\d+', '"upto III yr Due": 0', student_str_updated)

    # Replace in full content
    content_updated = content.replace(student_str, student_str_updated)

    # Write back to data.js
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        f.write(content_updated)

    return True

# Endpoint for receipt upload
@app.route("/upload_receipt", methods=["POST"])
def upload_receipt():
    roll_no = request.form.get("roll_no")
    file = request.files.get("receipt")
    if not file or not roll_no:
        return jsonify({"status": "error", "message": "Missing Roll No or file"}), 400

    # Save the receipt
    filename = f"{roll_no}_{file.filename}"
    file.save(os.path.join(UPLOAD_FOLDER, filename))

    # Update fees in data.js
    updated = update_student_fee(roll_no)
    if updated:
        return jsonify({"status": "success", "message": "Fees updated successfully"})
    else:
        return jsonify({"status": "error", "message": "Student not found"}), 404

# Serve homepage (index.html)
@app.route("/")
def home():
    return send_from_directory(".", "index.html")

# Serve static files (HTML, CSS, JS)
@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(".", path)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
