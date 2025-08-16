document.addEventListener("DOMContentLoaded", function () {
    const adminUsername = "admin";
    const adminPassword = "admin@giet";

    const adminLoginForm = document.getElementById("adminLoginForm");
    const adminActions = document.getElementById("adminActions");
    const adminMessage = document.getElementById("adminMessage");

    adminActions.style.display = "none"; // Hide dashboard initially

    // Admin Login
    adminLoginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("adminUsername").value.trim();
        const password = document.getElementById("adminPassword").value.trim();

        if (username === adminUsername && password === adminPassword) {
            adminLoginForm.style.display = "none";
            adminActions.style.display = "block";
            adminMessage.textContent = "✅ Logged in as Admin.";
            adminMessage.style.color = "green";
        } else {
            alert("Invalid admin credentials!");
        }
    });

    // Add Student
    document.getElementById("addStudentBtn").addEventListener("click", async function () {
        const id = document.getElementById("studentId").value.trim();
        const name = document.getElementById("studentName").value.trim();
        const course = document.getElementById("studentCourse").value.trim();
        const year = document.getElementById("studentYear").value.trim();
        const feeDue = document.getElementById("studentFee").value.trim();

        if (!id || !name || !course || !year || feeDue === "") {
            adminMessage.textContent = "❌ Please fill all fields.";
            adminMessage.style.color = "red";
            return;
        }

        try {
            const res = await fetch("/add_student", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roll_no: id, name, course, year, fee_due: feeDue })
            });

            const data = await res.json();

            if (res.ok) {
                adminMessage.textContent = `✅ ${data.message || "Student added successfully."}`;
                adminMessage.style.color = "green";
                document.getElementById("studentId").value = "";
                document.getElementById("studentName").value = "";
                document.getElementById("studentCourse").value = "";
                document.getElementById("studentYear").value = "";
                document.getElementById("studentFee").value = "";
            } else {
                adminMessage.textContent = `❌ ${data.error || "Failed to add student."}`;
                adminMessage.style.color = "red";
            }
        } catch (err) {
            console.error(err);
            adminMessage.textContent = "❌ Server error while adding student.";
            adminMessage.style.color = "red";
        }
    });

    // Delete Student
    document.getElementById("deleteStudentBtn").addEventListener("click", async function () {
        const id = document.getElementById("deleteStudentId").value.trim();

        if (!id) {
            adminMessage.textContent = "❌ Enter Roll No to delete.";
            adminMessage.style.color = "red";
            return;
        }

        try {
            const res = await fetch(`/delete_student?roll_no=${id}`, { method: "DELETE" });
            const data = await res.json();

            if (res.ok) {
                adminMessage.textContent = `✅ ${data.message || "Student deleted successfully."}`;
                adminMessage.style.color = "green";
                document.getElementById("deleteStudentId").value = "";
            } else {
                adminMessage.textContent = `❌ ${data.error || "Failed to delete student."}`;
                adminMessage.style.color = "red";
            }
        } catch (err) {
            console.error(err);
            adminMessage.textContent = "❌ Server error while deleting student.";
            adminMessage.style.color = "red";
        }
    });

// =======================
  // Logout
  // =======================
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("loggedInStudent");
      window.location.href = "login.html";
    });
  }

});