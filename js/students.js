document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('studentForm');
    if (!form) return;

    const storageKey = 'eduacademy.studentRecords.v1';
    const fields = {
        id: document.getElementById('studentId'),
        name: document.getElementById('studentName'),
        email: document.getElementById('studentEmail'),
        course: document.getElementById('studentCourse')
    };
    const errors = {
        name: document.getElementById('studentNameError'),
        email: document.getElementById('studentEmailError'),
        course: document.getElementById('studentCourseError')
    };
    const tableBody = document.getElementById('studentTableBody');
    const saveButton = document.getElementById('saveStudentButton');
    const cancelButton = document.getElementById('cancelEditButton');
    const formTitle = document.getElementById('formTitle');
    const formStatus = document.getElementById('studentFormStatus');
    const studentCount = document.getElementById('studentCount');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const sampleRecords = [
        { id: 'sample-1', name: 'Student One', email: 'student.one@example.com', course: 'Web Development' },
        { id: 'sample-2', name: 'Student Two', email: 'student.two@example.com', course: 'UI/UX Design' },
        { id: 'sample-3', name: 'Student Three', email: 'student.three@example.com', course: 'Python Programming' }
    ];

    let records = readRecords();

    function readRecords() {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved === null) return sampleRecords.slice();
            const parsed = JSON.parse(saved);
            if (!Array.isArray(parsed)) return sampleRecords.slice();
            return parsed.filter((record) =>
                record && typeof record.id === 'string' &&
                typeof record.name === 'string' &&
                typeof record.email === 'string' &&
                typeof record.course === 'string'
            );
        } catch (error) {
            return sampleRecords.slice();
        }
    }

    function saveRecords() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(records));
            return true;
        } catch (error) {
            return false;
        }
    }

    function makeId() {
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function setFieldState(input, errorElement, message) {
        const isValid = message === '';
        input.classList.toggle('is-invalid', !isValid);
        input.classList.toggle('is-valid', isValid && input.value.trim() !== '');
        input.setAttribute('aria-invalid', String(!isValid));
        errorElement.textContent = message;
        return isValid;
    }

    function validateName() {
        const value = fields.name.value.trim();
        if (!value) return setFieldState(fields.name, errors.name, 'Please enter the student’s name.');
        if (value.length < 2) return setFieldState(fields.name, errors.name, 'Name must contain at least 2 characters.');
        return setFieldState(fields.name, errors.name, '');
    }

    function validateEmail() {
        const value = fields.email.value.trim();
        if (!value) return setFieldState(fields.email, errors.email, 'Please enter an email address.');
        if (!emailPattern.test(value)) return setFieldState(fields.email, errors.email, 'Enter a valid email address.');
        return setFieldState(fields.email, errors.email, '');
    }

    function validateCourse() {
        if (!fields.course.value) return setFieldState(fields.course, errors.course, 'Please choose a course.');
        return setFieldState(fields.course, errors.course, '');
    }

    function addCell(row, value) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
        return cell;
    }

    function makeActionButton(label, action, id, styleClass) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `btn btn-sm ${styleClass}`;
        button.dataset.action = action;
        button.dataset.id = id;
        button.textContent = label;
        return button;
    }

    function renderRecords() {
        tableBody.replaceChildren();

        if (records.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 4;
            cell.className = 'text-center text-muted py-4';
            cell.textContent = 'No student records yet. Use the form above to add one.';
            row.appendChild(cell);
            tableBody.appendChild(row);
        } else {
            records.forEach((record) => {
                const row = document.createElement('tr');
                addCell(row, record.name);
                addCell(row, record.email);
                addCell(row, record.course);

                const actionCell = document.createElement('td');
                const actions = document.createElement('div');
                actions.className = 'student-actions';
                actions.append(
                    makeActionButton('Edit', 'edit', record.id, 'btn-outline-primary'),
                    makeActionButton('Delete', 'delete', record.id, 'btn-outline-danger')
                );
                actionCell.appendChild(actions);
                row.appendChild(actionCell);
                tableBody.appendChild(row);
            });
        }

        studentCount.textContent = `${records.length} ${records.length === 1 ? 'student' : 'students'}`;
    }

    function resetForm() {
        form.reset();
        fields.id.value = '';
        Object.keys(errors).forEach((key) => {
            fields[key].classList.remove('is-valid', 'is-invalid');
            fields[key].removeAttribute('aria-invalid');
            errors[key].textContent = '';
        });
        saveButton.textContent = 'Add student';
        formTitle.textContent = 'Add a student';
        cancelButton.hidden = true;
    }

    function startEditing(record) {
        resetForm();
        fields.id.value = record.id;
        fields.name.value = record.name;
        fields.email.value = record.email;
        fields.course.value = record.course;
        saveButton.textContent = 'Save changes';
        formTitle.textContent = 'Edit student';
        cancelButton.hidden = false;
        formStatus.textContent = `Editing ${record.name}.`;
        formStatus.className = 'form-status mt-3 mb-0 text-muted';
        fields.name.focus();
    }

    fields.name.addEventListener('input', validateName);
    fields.email.addEventListener('input', validateEmail);
    fields.course.addEventListener('change', validateCourse);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isCourseValid = validateCourse();

        if (!isNameValid || !isEmailValid || !isCourseValid) {
            formStatus.textContent = 'Please correct the highlighted fields.';
            formStatus.className = 'form-status mt-3 mb-0 text-danger';
            form.querySelector('.is-invalid')?.focus();
            return;
        }

        const student = {
            id: fields.id.value || makeId(),
            name: fields.name.value.trim(),
            email: fields.email.value.trim(),
            course: fields.course.value
        };
        const isEditing = fields.id.value !== '';

        if (isEditing) {
            const index = records.findIndex((record) => record.id === student.id);
            if (index === -1) {
                formStatus.textContent = 'That student record is no longer available. Refresh the list and try again.';
                formStatus.className = 'form-status mt-3 mb-0 text-danger';
                resetForm();
                return;
            }
            records[index] = student;
        } else {
            records.push(student);
        }

        const saved = saveRecords();
        renderRecords();
        resetForm();
        formStatus.textContent = saved
            ? (isEditing ? 'Student record updated.' : 'Student added to the list.')
            : 'Record updated for this session, but browser storage is unavailable.';
        formStatus.className = 'form-status mt-3 mb-0 text-success';
    });

    cancelButton.addEventListener('click', () => {
        resetForm();
        formStatus.textContent = 'Edit cancelled.';
        formStatus.className = 'form-status mt-3 mb-0 text-muted';
    });

    tableBody.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const record = records.find((item) => item.id === button.dataset.id);
        if (!record) return;

        if (button.dataset.action === 'edit') {
            startEditing(record);
            return;
        }

        if (button.dataset.action === 'delete' && window.confirm(`Delete the record for ${record.name}?`)) {
            records = records.filter((item) => item.id !== record.id);
            const saved = saveRecords();
            renderRecords();
            formStatus.textContent = saved
                ? 'Student record deleted.'
                : 'Record deleted for this session, but browser storage is unavailable.';
            formStatus.className = 'form-status mt-3 mb-0 text-success';
            if (fields.id.value === record.id) resetForm();
        }
    });

    renderRecords();
});
