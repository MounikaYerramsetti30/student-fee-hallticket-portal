const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Temp folder for uploads
const upload = multer({ dest: "uploads/" });

// GET all students
app.get("/students", (req, res) => {
  const filePath = path.join(__dirname, "students.json");
  if (!fs.existsSync(filePath)) return res.json([]);
  const data = fs.readFileSync(filePath, "utf-8");
  res.json(JSON.parse(data));
});

// POST students (Excel upload by admin)
app.post("/students", upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const workbook = XLSX.readFile(req.file.path);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(firstSheet);

    const students = excelData.map(row => ({
      id: row["Roll No"] ? row["Roll No"].toString().trim() : "",
      name: row["Student Name"] ? row["Student Name"].trim() : "",
      course: row["Branch"] || "",
      year: 4,
      feeDue: row["IV yr I Sem Due"] || 0,
      password: row["DATE OF BIRTH"] ? row["DATE OF BIRTH"].toString().trim() : "",
      hallTicket: row["Roll No"] ? `halltickets/${row["Roll No"]}.pdf` : "",
      receipt: null
    }));

    fs.writeFileSync(
      path.join(__dirname, "students.json"),
      JSON.stringify(students, null, 2)
    );

    // Remove temp uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ success: true, message: "Student data uploaded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error reading Excel file" });
  }
});

// POST receipt upload
app.post("/students/receipt", upload.single("receipt"), (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Missing student ID" });
    if (!req.file) return res.status(400).json({ error: "No receipt file uploaded" });

    const studentsFile = path.join(__dirname, "students.json");
    if (!fs.existsSync(studentsFile)) return res.status(404).json({ error: "No student data found" });

    let students = JSON.parse(fs.readFileSync(studentsFile, "utf-8"));
    const studentIndex = students.findIndex(s => s.id === id);
    if (studentIndex === -1) return res.status(404).json({ error: "Student not found" });

    students[studentIndex].receipt = req.file.filename;
    students[studentIndex].feeDue = 0;

    fs.writeFileSync(studentsFile, JSON.stringify(students, null, 2));

    res.json({ success: true, message: "Receipt uploaded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error uploading receipt" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
