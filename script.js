document.addEventListener("DOMContentLoaded", function () {

  // =======================
  // Login / Roll No Lookup
  // =======================
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const rollNo = document.getElementById("studentId").value.trim();
      const student = students.find(s => s["Roll No"] === rollNo);

      if (student) {
        if (!student.paymentStatus) {
          student.paymentStatus = ((student["IV yr I Sem Due"] || 0) + (student["upto III yr Due"] || 0)) === 0 ? "verified" : "due";
        }
        localStorage.setItem("loggedInStudent", JSON.stringify(student));
        window.location.href = "feecheck.html";
      } else {
        alert("No student found with Roll No: " + rollNo);
      }
    });
  }

  // =======================
  // Display Student Details
  // =======================
  const studentDetails = document.getElementById("studentDetails");
  if (studentDetails) {
    const studentData = JSON.parse(localStorage.getItem("loggedInStudent"));
    if (!studentData) {
      studentDetails.innerHTML = "<p>No student data found. Please login again.</p>";
      return;
    }

    function updateFeeStatus(student) {
      const totalDue = (student["IV yr I Sem Due"] || 0) + (student["upto III yr Due"] || 0);
      let html = `
        <p><b>ID:</b> ${student["Roll No"]}</p>
        <p><b>Name:</b> ${student["Student Name"]}</p>
        <p><b>Branch:</b> ${student["Branch"]}</p>
        <p><b>IV Yr I Sem Due:</b> ${student["IV yr I Sem Due"] || 0}</p>
        <p><b>Up to III Yr Due:</b> ${student["upto III yr Due"] || 0}</p>
      `;

      if (totalDue === 0 && student.paymentStatus === "verified") {
        html += `
          <div class="fee-status success">No fee due. You can download your hall ticket.</div>
          <button id="downloadTicketBtn" class="btn btn-download">Download Hall Ticket</button>
        `;
      } else {
        html += `
          <div class="fee-status due">Fee due detected. Please upload your payment receipt.</div>
          <input type="file" id="receiptUpload" />
          <button id="uploadReceiptBtn" class="btn btn-upload">Upload Receipt</button>
        `;
      }

      studentDetails.innerHTML = html;

      // =======================
      // Receipt Upload (Updated)
      // =======================
      const uploadBtn = document.getElementById("uploadReceiptBtn");
      if (uploadBtn) {
        uploadBtn.addEventListener("click", () => {
          const fileInput = document.getElementById("receiptUpload");
          if (!fileInput.files[0]) return alert("Please select a receipt file.");

          const formData = new FormData();
          formData.append("roll_no", student["Roll No"]);
          formData.append("receipt", fileInput.files[0]);

          fetch("/upload_receipt", {
            method: "POST",
            body: formData
          })
          .then(res => res.json())
          .then(data => {
            if(data.status === "success") {
              // Update fee in frontend
              student["IV yr I Sem Due"] = 0;
              student["upto III yr Due"] = 0;
              student.paymentStatus = "verified";
              alert("Fees updated successfully! Hall ticket enabled.");
              updateFeeStatus(student);
            } else {
              alert(data.message);
            }
          })
          .catch(err => alert("Error uploading receipt: " + err));
        });
      }

      // =======================
      // Download Hall Ticket
      // =======================
      const downloadBtn = document.getElementById("downloadTicketBtn");
      if (downloadBtn) {
        downloadBtn.addEventListener("click", () => downloadHallTicket(student));
      }
    }

    updateFeeStatus(studentData);
  }

  // =======================
  // Hall Ticket PDF Download
  // =======================
  function downloadHallTicket(student) {
    const ticketDiv = document.getElementById("ticketTemplate");
    if (!ticketDiv) return alert("Hall ticket template is missing!");

    document.getElementById("ticketName").innerText = student["Student Name"];
    document.getElementById("ticketRoll").innerText = student["Roll No"];
    document.getElementById("ticketBranch").innerText = student["Branch"];

    ticketDiv.style.display = "block";
    ticketDiv.style.position = "absolute";
    ticketDiv.style.left = "-9999px";
    ticketDiv.style.top = "0";

    setTimeout(async () => {
      try {
        const canvas = await html2canvas(ticketDiv, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        ticketDiv.style.display = "none";

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${student["Roll No"]}_HallTicket.pdf`);
      } catch (err) {
        alert("Error generating PDF: " + err.message);
      }
    }, 200);
  }

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
