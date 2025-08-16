import sqlite3

conn = sqlite3.connect("students.db")
c = conn.cursor()

c.execute("""
CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)
""")

c.execute("INSERT OR IGNORE INTO admin (username, password) VALUES (?, ?)", ("admin", "admin123"))

conn.commit()
conn.close()
