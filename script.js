
(() => {
    "use strict";

    // =====================================
    // COMMON FUNCTIONS
    // =====================================

    function getRecords(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return [];
        }
    }

    function saveRecords(key, records) {
        localStorage.setItem(key, JSON.stringify(records));
    }

    function getElement(id) {
        return document.getElementById(id);
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function showMessage(element, message) {
        if (element) element.textContent = message;
    }

    // =====================================
    // LOGIN SYSTEM
    // =====================================

    const loginForm = getElement("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const role = getElement("userRole")?.value;
            const username = getElement("username")?.value.trim();
            const password = getElement("password")?.value;
            const message = getElement("message");

            if (role === "admin" && username === "admin" && password === "1234") {
                sessionStorage.setItem("loggedInRole", "admin");
                window.location.href = "admin.html";
                return;
            }

            if (role === "teacher" && username === "teacher" && password === "teach123") {
                sessionStorage.setItem("loggedInRole", "teacher");
                window.location.href = "teacher.html";
                return;
            }

            if (role === "student" && username === "student" && password === "stud123") {
                sessionStorage.setItem("loggedInRole", "student");
                window.location.href = "student.html";
                return;
            }

            showMessage(message, "Username, Password ya Login Type galat hai.");
        });
    }

    window.logout = function () {
        sessionStorage.removeItem("loggedInRole");
        window.location.href = "login.html";
    };

    // =====================================
    // STUDENT MANAGEMENT
    // ADD + EDIT + DELETE + SEARCH
    // =====================================

    let studentRecords = getRecords("students");
    let editingStudentIndex = -1;

    const studentForm = getElement("studentForm");
    const studentSearch = getElement("studentSearch");

    function displayStudents() {
        const list = getElement("studentList");
        if (!list) return;

        list.innerHTML = "";

        const searchText = studentSearch
            ? studentSearch.value.trim().toLowerCase()
            : "";

        const filteredStudents = studentRecords
            .map((student, index) => ({ student, index }))
            .filter(item => {
                const name = String(item.student.name ?? "").toLowerCase();
                const roll = String(item.student.roll ?? "").toLowerCase();

                return name.includes(searchText) || roll.includes(searchText);
            });

        if (filteredStudents.length === 0) {
            list.textContent = searchText
                ? "No matching student found."
                : "No students added yet.";
            return;
        }

        filteredStudents.forEach(({ student, index }) => {
            const card = document.createElement("div");
            card.className = "student-card";

            const details = document.createElement("p");
            details.textContent =
                `Name: ${student.name} | Roll: ${student.roll} | Class: ${student.studentClass} | Mobile: ${student.mobile}`;

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";

            editButton.addEventListener("click", () => {
                editingStudentIndex = index;

                getElement("studentName").value = student.name ?? "";
                getElement("rollNumber").value = student.roll ?? "";
                getElement("studentClass").value = student.studentClass ?? "";
                getElement("studentMobile").value = student.mobile ?? "";

                const title = getElement("studentFormTitle");
                const submit = getElement("studentSubmitButton");
                const cancel = getElement("cancelEditButton");

                if (title) title.textContent = "Edit Student";
                if (submit) submit.textContent = "Update Student";
                if (cancel) cancel.style.display = "inline-block";

                studentForm?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                if (!confirm("Delete this student?")) return;

                studentRecords.splice(index, 1);
                saveRecords("students", studentRecords);

                if (editingStudentIndex === index) {
                    window.cancelStudentEdit();
                } else if (editingStudentIndex > index) {
                    editingStudentIndex--;
                }

                displayStudents();
            });

            card.append(details, editButton, deleteButton);
            list.appendChild(card);
        });
    }

    window.cancelStudentEdit = function () {
        editingStudentIndex = -1;

        if (studentForm) studentForm.reset();

        const title = getElement("studentFormTitle");
        const submit = getElement("studentSubmitButton");
        const cancel = getElement("cancelEditButton");

        if (title) title.textContent = "Add New Student";
        if (submit) submit.textContent = "Add Student";
        if (cancel) cancel.style.display = "none";
    };

    if (studentSearch) {
        studentSearch.addEventListener("input", displayStudents);
    }

    if (studentForm) {
        studentForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = getElement("studentName").value.trim();
            const roll = getElement("rollNumber").value.trim();
            const studentClass = getElement("studentClass").value;
            const mobile = getElement("studentMobile").value.trim();

            if (!name || !roll || !studentClass || !mobile) {
                alert("Please fill all student details.");
                return;
            }

            const duplicate = studentRecords.some((student, index) =>
                index !== editingStudentIndex &&
                String(student.roll).trim().toLowerCase() === roll.toLowerCase() &&
                String(student.studentClass).trim().toLowerCase() ===
                    studentClass.trim().toLowerCase()
            );

            if (duplicate) {
                alert("This Roll Number already exists in this class.");
                return;
            }

            const studentData = { name, roll, studentClass, mobile };

            if (editingStudentIndex >= 0) {
                studentRecords[editingStudentIndex] = studentData;
                saveRecords("students", studentRecords);

                window.cancelStudentEdit();
                displayStudents();
                alert("Student updated successfully!");
            } else {
                studentRecords.push(studentData);
                saveRecords("students", studentRecords);

                studentForm.reset();
                displayStudents();
                alert("Student added successfully!");
            }
        });
    }

    const cancelStudentButton = getElement("cancelEditButton");

    if (cancelStudentButton) {
        cancelStudentButton.addEventListener("click", window.cancelStudentEdit);
    }

    displayStudents();

    // =====================================
    // TEACHER MANAGEMENT
    // ADD + EDIT + DELETE + SEARCH
    // =====================================

    let teacherRecords = getRecords("teachers");
    let editingTeacherIndex = -1;

    const teacherForm = getElement("teacherForm");
    const teacherSearch = getElement("teacherSearch");

    function displayTeachers() {
        const list = getElement("teacherList");
        if (!list) return;

        list.innerHTML = "";

        const searchText = teacherSearch
            ? teacherSearch.value.trim().toLowerCase()
            : "";

        const filteredTeachers = teacherRecords
            .map((teacher, index) => ({ teacher, index }))
            .filter(item => {
                const name = String(item.teacher.name ?? "").toLowerCase();
                const id = String(item.teacher.employeeId ?? "").toLowerCase();

                return name.includes(searchText) || id.includes(searchText);
            });

        if (filteredTeachers.length === 0) {
            list.textContent = searchText
                ? "No matching teacher found."
                : "No teachers added yet.";
            return;
        }

        filteredTeachers.forEach(({ teacher, index }) => {
            const card = document.createElement("div");
            card.className = "teacher-card";

            const details = document.createElement("p");
            details.textContent =
                `Name: ${teacher.name} | ID: ${teacher.employeeId} | Subject: ${teacher.subject} | Mobile: ${teacher.mobile}`;

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";

            editButton.addEventListener("click", () => {
                editingTeacherIndex = index;

                getElement("teacherName").value = teacher.name ?? "";
                getElement("employeeId").value = teacher.employeeId ?? "";
                getElement("subject").value = teacher.subject ?? "";
                getElement("teacherMobile").value = teacher.mobile ?? "";

                const title = getElement("teacherFormTitle");
                const submit = getElement("teacherSubmitButton");
                const cancel = getElement("cancelTeacherEdit");

                if (title) title.textContent = "Edit Teacher";
                if (submit) submit.textContent = "Update Teacher";
                if (cancel) cancel.style.display = "inline-block";

                teacherForm?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                if (!confirm("Delete this teacher?")) return;

                teacherRecords.splice(index, 1);
                saveRecords("teachers", teacherRecords);

                if (editingTeacherIndex === index) {
                    window.cancelTeacherEdit();
                } else if (editingTeacherIndex > index) {
                    editingTeacherIndex--;
                }

                displayTeachers();
            });

            card.append(details, editButton, deleteButton);
            list.appendChild(card);
        });
    }

    window.cancelTeacherEdit = function () {
        editingTeacherIndex = -1;

        if (teacherForm) teacherForm.reset();

        const title = getElement("teacherFormTitle");
        const submit = getElement("teacherSubmitButton");
        const cancel = getElement("cancelTeacherEdit");

        if (title) title.textContent = "Add New Teacher";
        if (submit) submit.textContent = "Add Teacher";
        if (cancel) cancel.style.display = "none";
    };

    if (teacherSearch) {
        teacherSearch.addEventListener("input", displayTeachers);
    }

    if (teacherForm) {
        teacherForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = getElement("teacherName").value.trim();
            const employeeId = getElement("employeeId").value.trim();
            const subject = getElement("subject").value.trim();
            const mobile = getElement("teacherMobile").value.trim();

            if (!name || !employeeId || !subject || !mobile) {
                alert("Please fill all teacher details.");
                return;
            }

            const duplicate = teacherRecords.some((teacher, index) =>
                index !== editingTeacherIndex &&
                String(teacher.employeeId).trim().toLowerCase() ===
                    employeeId.toLowerCase()
            );

            if (duplicate) {
                alert("This Employee ID already exists.");
                return;
            }

            const teacherData = { name, employeeId, subject, mobile };

            if (editingTeacherIndex >= 0) {
                teacherRecords[editingTeacherIndex] = teacherData;
                saveRecords("teachers", teacherRecords);

                window.cancelTeacherEdit();
                displayTeachers();
                alert("Teacher updated successfully!");
            } else {
                teacherRecords.push(teacherData);
                saveRecords("teachers", teacherRecords);

                teacherForm.reset();
                displayTeachers();
                alert("Teacher added successfully!");
            }
        });
    }

    displayTeachers();

    // =====================================
    // ATTENDANCE MANAGEMENT
    // =====================================

    let attendanceRecords = getRecords("attendanceRecords");

    window.loadStudents = function () {
        const date = getElement("attendanceDate")?.value;
        const studentClass = getElement("ClassSelect")?.value;
        const list = getElement("attendanceList");

        if (!date || !studentClass || !list) {
            alert("Please select date and class.");
            return;
        }

        const students = getRecords("students").filter(student =>
            String(student.studentClass).trim().toLowerCase() ===
            studentClass.trim().toLowerCase()
        );

        list.innerHTML = "";

        if (students.length === 0) {
            list.textContent = "No students found in this class.";
            showMessage(getElement("attendanceSummary"), "");
            return;
        }

        const saved = attendanceRecords.find(record =>
            record.date === date && record.studentClass === studentClass
        );

        students.forEach(student => {
            const previous = saved?.students.find(item =>
                item.roll === student.roll
            );

            const row = document.createElement("div");
            row.className = "attendance-row";

            const name = document.createElement("span");
            name.textContent = `${student.name} (${student.roll})`;

            const select = document.createElement("select");
            select.className = "attendance-status";

            ["Present", "Absent"].forEach(status => {
                const option = document.createElement("option");
                option.value = status;
                option.textContent = status;
                select.appendChild(option);
            });

            select.value = previous?.status || "Present";
            select.addEventListener("change", updateAttendanceSummary);

            row.append(name, select);
            list.appendChild(row);
        });

        updateAttendanceSummary();
    };

    function updateAttendanceSummary() {
        const statuses = document.querySelectorAll(".attendance-status");
        const present = [...statuses].filter(s => s.value === "Present").length;
        const absent = statuses.length - present;

        showMessage(
            getElement("attendanceSummary"),
            `Total: ${statuses.length} | Present: ${present} | Absent: ${absent}`
        );
    }

    window.saveAttendance = function () {
        const date = getElement("attendanceDate")?.value;
        const studentClass = getElement("ClassSelect")?.value;
        const rows = document.querySelectorAll(".attendance-row");

        if (!date || !studentClass || rows.length === 0) {
            alert("Please load students first.");
            return;
        }

        const students = [...rows].map(row => ({
            name: row.querySelector("span").textContent.split(" (")[0],
            roll: row.querySelector("span").textContent.match(/\((.*?)\)/)?.[1] || "",
            status: row.querySelector("select").value
        }));

        const existingIndex = attendanceRecords.findIndex(record =>
            record.date === date && record.studentClass === studentClass
        );

        const record = { date, studentClass, students };

        if (existingIndex >= 0) {
            attendanceRecords[existingIndex] = record;
        } else {
            attendanceRecords.push(record);
        }

        saveRecords("attendanceRecords", attendanceRecords);
        alert("Attendance saved successfully!");
    };

    // =====================================
    // HOMEWORK MANAGEMENT
    // =====================================

    let homeworkRecords = getRecords("homeworkRecords");

    const homeworkForm = getElement("homeworkForm");

    function displayHomework() {
        const list = getElement("homeworkList");
        if (!list) return;

        list.innerHTML = "";

        if (homeworkRecords.length === 0) {
            list.textContent = "No homework added yet.";
            return;
        }

        homeworkRecords.forEach((homework, index) => {
            const card = document.createElement("div");
            card.className = "homework-card";

            const details = document.createElement("p");
            details.textContent =
                `Class: ${homework.studentClass} | Subject: ${homework.subject} | Homework: ${homework.details} | Last Date: ${homework.date}`;

            const button = document.createElement("button");
            button.textContent = "Delete";

            button.addEventListener("click", () => {
                if (!confirm("Delete this homework?")) return;

                homeworkRecords.splice(index, 1);
                saveRecords("homeworkRecords", homeworkRecords);
                displayHomework();
            });

            card.append(details, button);
            list.appendChild(card);
        });
    }

    if (homeworkForm) {
        homeworkForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const studentClass = getElement("hwClass").value;
            const subject = getElement("hwSubject").value.trim();
            const details = getElement("hwDetails").value.trim();
            const date = getElement("hwDate").value;

            homeworkRecords.push({
                studentClass,
                className: studentClass,
                subject,
                details,
                date
            });

            saveRecords("homeworkRecords", homeworkRecords);
            homeworkForm.reset();
            displayHomework();

            alert("Homework added successfully!");
        });
    }

    displayHomework();

    // STUDENT HOMEWORK DISPLAY

    const studentHomeworkList = getElement("studentHomeworkList");

    if (studentHomeworkList) {
        const allStudents = getRecords("students");
        const allHomework = getRecords("homeworkRecords");

        if (allStudents.length === 0) {
            studentHomeworkList.textContent = "No student record found.";
        } else {
            const student = allStudents[0];

            const myHomework = allHomework.filter(hw =>
                String(hw.studentClass || hw.className).trim().toLowerCase() ===
                String(student.studentClass).trim().toLowerCase()
            );

            if (myHomework.length === 0) {
                studentHomeworkList.textContent = "No homework available.";
            } else {
                myHomework.forEach(hw => {
                    const card = document.createElement("div");
                    card.className = "homework-card";

                    const details = document.createElement("p");
                    details.textContent =
                        `${hw.subject}: ${hw.details} | Last Date: ${hw.date}`;

                    card.appendChild(details);
                    studentHomeworkList.appendChild(card);
                });
            }
        }
    }

    // =====================================
    // RESULT MANAGEMENT
    // =====================================

    let resultRecords = getRecords("results");

    const resultForm = getElement("resultForm");

    function displayResults() {
        const list = getElement("resultList");
        if (!list) return;

        list.innerHTML = "";

        if (resultRecords.length === 0) {
            list.textContent = "No results added yet.";
            return;
        }

        resultRecords.forEach((result, index) => {
            const card = document.createElement("div");
            card.className = "result-card";

            const details = document.createElement("p");
            details.textContent =
                `${result.name} | Roll: ${result.roll} | Class: ${result.studentClass} | Exam: ${result.examName} | Percentage: ${result.percentage}% | ${result.status}`;

            const viewButton = document.createElement("button");
            viewButton.textContent = "View Marksheet";
            viewButton.addEventListener("click", () => window.showMarksheet(index));

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                if (!confirm("Delete this result?")) return;

                resultRecords.splice(index, 1);
                saveRecords("results", resultRecords);
                displayResults();
            });

            card.append(details, viewButton, deleteButton);
            list.appendChild(card);
        });
    }

    if (resultForm) {
        resultForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = getElement("resultName").value.trim();
            const roll = getElement("resultRoll").value.trim();
            const studentClass = getElement("resultClass").value;
            const examName = getElement("examName").value.trim();

            const subjects = {
                English: Number(getElement("english").value),
                Hindi: Number(getElement("hindi").value),
                Maths: Number(getElement("maths").value),
                Science: Number(getElement("science").value),
                Social: Number(getElement("social").value)
            };

            const marks = Object.values(subjects);

            if (marks.some(mark => !Number.isFinite(mark) || mark < 0 || mark > 100)) {
                alert("Each subject mark must be between 0 and 100.");
                return;
            }

            const total = marks.reduce((sum, mark) => sum + mark, 0);
            const percentage = (total / 500 * 100).toFixed(2);
            const status = marks.every(mark => mark >= 33) ? "PASS" : "FAIL";

            resultRecords.push({
                name, roll, studentClass, examName,
                subjects, total, percentage, status
            });

            saveRecords("results", resultRecords);
            resultForm.reset();
            displayResults();

            alert("Result saved successfully!");
        });
    }

    window.showMarksheet = function (index) {
        const result = resultRecords[index];
        const marksheet = getElement("marksheet");

        if (!result || !marksheet) return;

        marksheet.innerHTML = `
            <h2>M.P. Mission School</h2>
            <h3>Student Marksheet</h3>
            <p>Name: ${escapeHTML(result.name)}</p>
            <p>Roll Number: ${escapeHTML(result.roll)}</p>
            <p>Class: ${escapeHTML(result.studentClass)}</p>
            <p>Exam: ${escapeHTML(result.examName)}</p>
            <table border="1" cellpadding="8">
                <tr><th>Subject</th><th>Marks</th></tr>
                ${Object.entries(result.subjects).map(([subject, mark]) =>
                    `<tr><td>${escapeHTML(subject)}</td><td>${mark}</td></tr>`
                ).join("")}
            </table>
            <p>Total: ${result.total} / 500</p>
            <p>Percentage: ${result.percentage}%</p>
            <h3>Result: ${result.status}</h3>
            <button onclick="window.print()">Print Marksheet</button>
        `;

        marksheet.style.display = "block";
    };

    displayResults();

    // =====================================
    // FEE MANAGEMENT
    // =====================================

    let feeRecords = getRecords("fees");

    const feeForm = getElement("feeForm");

    function displayFees() {
        const list = getElement("feeList");
        if (!list) return;

        list.innerHTML = "";

        if (feeRecords.length === 0) {
            list.textContent = "No fee records added yet.";
            return;
        }

        feeRecords.forEach((fee, index) => {
            const card = document.createElement("div");
            card.className = "fee-card";

            const details = document.createElement("p");
            details.textContent =
                `${fee.name} | Roll: ${fee.roll} | Class: ${fee.studentClass} | Paid: ₹${fee.paid} | Due: ₹${fee.total - fee.paid}`;

            const printButton = document.createElement("button");
            printButton.textContent = "Print Receipt";
            printButton.addEventListener("click", () => window.printFeeReceipt(index));

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                if (!confirm("Delete this fee record?")) return;

                feeRecords.splice(index, 1);
                saveRecords("fees", feeRecords);
                displayFees();
            });

            card.append(details, printButton, deleteButton);
            list.appendChild(card);
        });
    }

    if (feeForm) {
        feeForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const total = Number(getElement("totalFee").value);
            const paid = Number(getElement("paidFee").value);

            if (!Number.isFinite(total) || !Number.isFinite(paid) ||
                total <= 0 || paid < 0 || paid > total) {
                alert("Please enter valid fee amounts. Paid fee cannot exceed total fee.");
                return;
            }

            feeRecords.push({
                name: getElement("feeStudentName").value.trim(),
                roll: getElement("feeRoll").value.trim(),
                studentClass: getElement("feeClass").value,
                total,
                paid,
                date: getElement("feeDate").value,
                paymentMethod: getElement("paymentMethod").value
            });

            saveRecords("fees", feeRecords);
            feeForm.reset();
            displayFees();

            alert("Fee record saved successfully!");
        });
    }

    window.printFeeReceipt = function (index) {
        const fee = feeRecords[index];
        if (!fee) return;

        const receiptWindow = window.open("", "_blank");

        if (!receiptWindow) {
            alert("Please allow pop-ups to print the receipt.");
            return;
        }

        receiptWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head><title>Fee Receipt</title></head>
            <body>
                <h2>M.P. Mission School</h2>
                <h3>Fee Payment Receipt</h3>
                <p>Name: ${escapeHTML(fee.name)}</p>
                <p>Roll Number: ${escapeHTML(fee.roll)}</p>
                <p>Class: ${escapeHTML(fee.studentClass)}</p>
                <p>Total Fee: ₹${fee.total}</p>
                <p>Paid Fee: ₹${fee.paid}</p>
                <p>Due Fee: ₹${fee.total - fee.paid}</p>
                <p>Date: ${escapeHTML(fee.date)}</p>
                <p>Payment Method: ${escapeHTML(fee.paymentMethod)}</p>
                <button onclick="window.print()">Print Receipt</button>
            </body>
            </html>
        `);

        receiptWindow.document.close();
    };

    displayFees();

    // =====================================
    // NOTICE BOARD MANAGEMENT
    // =====================================

    let noticeRecords = getRecords("notices");

    const noticeForm = getElement("noticeForm");

    function displayNotices() {
        const list = getElement("noticeList");
        if (!list) return;

        list.innerHTML = "";

        if (noticeRecords.length === 0) {
            list.textContent = "No notices published yet.";
            return;
        }

        noticeRecords.forEach((notice, index) => {
            const card = document.createElement("div");
            card.className = "notice-card";

            const title = document.createElement("h3");
            title.textContent = notice.title;

            const details = document.createElement("p");
            details.textContent = notice.details;

            const date = document.createElement("p");
            date.textContent = `Date: ${notice.date}`;

            const button = document.createElement("button");
            button.textContent = "Delete";

            button.addEventListener("click", () => {
                if (!confirm("Delete this notice?")) return;

                noticeRecords.splice(index, 1);
                saveRecords("notices", noticeRecords);
                displayNotices();
            });

            card.append(title, details, date, button);
            list.appendChild(card);
        });
    }

    if (noticeForm) {
        noticeForm.addEventListener("submit", function (event) {
            event.preventDefault();

            noticeRecords.push({
                title: getElement("noticeTitle").value.trim(),
                details: getElement("noticeDetails").value.trim(),
                date: getElement("noticeDate").value
            });

            saveRecords("notices", noticeRecords);
            noticeForm.reset();
            displayNotices();

            alert("Notice published successfully!");
        });
    }

    displayNotices();

})();
