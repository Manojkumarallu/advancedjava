// Advanced Java Records System - Manoj Kumar (238W1A1267)
class StudentManager {
    constructor() {
        this.students = JSON.parse(localStorage.getItem('students')) || [];
        this.nextId = parseInt(localStorage.getItem('nextId')) || 1;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderStudents();
        this.populateFilters();
        this.setupAIChat();
    }

    setupEventListeners() {
        // Sidebar Navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const week = item.dataset.week;
                this.showWeekContent(week);
                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.updateContentTitle(week);
            });
        });

        // Student form
        const studentForm = document.getElementById('student-form');
        if (studentForm) {
            studentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addStudent();
            });
        }

        // Search and filter
        const searchInput = document.getElementById('search-input');
        const filterCourse = document.getElementById('filter-course');
        if (searchInput) searchInput.addEventListener('input', () => this.filterStudents());
        if (filterCourse) filterCourse.addEventListener('change', () => this.filterStudents());

        // Edit form
        const editForm = document.getElementById('edit-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateStudent();
            });
        }

        // Modal controls
        const cancelEdit = document.getElementById('cancel-edit');
        const editModal = document.getElementById('edit-modal');
        if (cancelEdit) cancelEdit.addEventListener('click', () => this.closeModal());
        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target.id === 'edit-modal') this.closeModal();
            });
        }

        // AI Chat
        const chatFab = document.getElementById('chat-fab');
        const chatClose = document.getElementById('chat-close');
        const sendMessage = document.getElementById('send-message');
        const chatInput = document.getElementById('chat-input');
        
        if (chatFab) chatFab.addEventListener('click', () => this.toggleChat());
        if (chatClose) chatClose.addEventListener('click', () => this.toggleChat());
        if (sendMessage) sendMessage.addEventListener('click', () => this.sendMessage());
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
    }

    showWeekContent(weekId) {
        document.querySelectorAll('.week-content').forEach(content => {
            content.classList.remove('active');
        });
        const targetContent = document.getElementById(weekId);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }

    updateContentTitle(weekId) {
        const titleElement = document.getElementById('content-title');
        const titles = {
            'week1': 'Week 1 - JDBC Connection & Statement Interface',
            'week2': 'Week 2 - PreparedStatement & ResultSet Navigation',
            'week3': 'Week 3 - CallableStatement & Stored Procedures',
            'week4': 'Week 4 - Servlet Programming & Deployment',
            'week5': 'Week 5 - Request Handling & Forwarding',
            'students': 'Student Records Management',
            'add-student': 'Add New Student Record'
        };
        if (titleElement) {
            titleElement.textContent = titles[weekId] || 'Advanced Java Records System';
        }
    }

    addStudent() {
        const formData = new FormData(document.getElementById('student-form'));
        const student = {
            id: this.nextId++,
            name: formData.get('name'),
            age: parseInt(formData.get('age')),
            city: formData.get('city'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            course: formData.get('course'),
            createdAt: new Date().toLocaleDateString()
        };

        this.students.push(student);
        this.saveData();
        this.renderStudents();
        this.populateFilters();
        
        document.getElementById('student-form').reset();
        this.showNotification('🎉 Student added successfully to the database!', 'success');
        this.showWeekContent('students');
        document.querySelectorAll('.menu-item').forEach(l => l.classList.remove('active'));
        const studentsMenuItem = document.querySelector('[data-week="students"]');
        if (studentsMenuItem) {
            studentsMenuItem.classList.add('active');
            this.updateContentTitle('students');
        }
    }

    renderStudents(studentsToRender = this.students) {
        const tbody = document.getElementById('students-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        studentsToRender.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.age}</td>
                <td>${student.city}</td>
                <td>${student.email}</td>
                <td>${student.course}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="studentManager.editStudent(${student.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="studentManager.deleteStudent(${student.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    editStudent(id) {
        const student = this.students.find(s => s.id === id);
        if (!student) return;

        const editModal = document.getElementById('edit-modal');
        if (!editModal) return;

        document.getElementById('edit-id').value = student.id;
        document.getElementById('edit-name').value = student.name;
        document.getElementById('edit-age').value = student.age;
        document.getElementById('edit-city').value = student.city;
        document.getElementById('edit-email').value = student.email;
        document.getElementById('edit-phone').value = student.phone;
        document.getElementById('edit-course').value = student.course;

        editModal.style.display = 'block';
    }

    updateStudent() {
        const id = parseInt(document.getElementById('edit-id').value);
        const studentIndex = this.students.findIndex(s => s.id === id);
        
        if (studentIndex === -1) return;

        this.students[studentIndex] = {
            ...this.students[studentIndex],
            name: document.getElementById('edit-name').value,
            age: parseInt(document.getElementById('edit-age').value),
            city: document.getElementById('edit-city').value,
            email: document.getElementById('edit-email').value,
            phone: document.getElementById('edit-phone').value,
            course: document.getElementById('edit-course').value
        };

        this.saveData();
        this.renderStudents();
        this.populateFilters();
        this.closeModal();
        this.showNotification('✅ Student record updated successfully!', 'success');
    }

    deleteStudent(id) {
        if (confirm('Are you sure you want to delete this student?')) {
            this.students = this.students.filter(s => s.id !== id);
            this.saveData();
            this.renderStudents();
            this.populateFilters();
            this.showNotification('🗑️ Student record deleted successfully!', 'success');
        }
    }

    closeModal() {
        const editModal = document.getElementById('edit-modal');
        if (editModal) {
            editModal.style.display = 'none';
        }
    }

    filterStudents() {
        const searchInput = document.getElementById('search-input');
        const filterCourse = document.getElementById('filter-course');
        
        if (!searchInput || !filterCourse) return;

        const searchTerm = searchInput.value.toLowerCase();
        const courseFilter = filterCourse.value;

        const filtered = this.students.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(searchTerm) ||
                                student.email.toLowerCase().includes(searchTerm) ||
                                student.city.toLowerCase().includes(searchTerm);
            const matchesCourse = !courseFilter || student.course === courseFilter;
            return matchesSearch && matchesCourse;
        });

        this.renderStudents(filtered);
    }

    populateFilters() {
        const courseFilter = document.getElementById('filter-course');
        if (!courseFilter) return;
        
        const courses = [...new Set(this.students.map(s => s.course))];
        
        courseFilter.innerHTML = '<option value="">All Courses</option>';
        courses.forEach(course => {
            courseFilter.innerHTML += `<option value="${course}">${course}</option>`;
        });
    }

    saveData() {
        localStorage.setItem('students', JSON.stringify(this.students));
        localStorage.setItem('nextId', this.nextId.toString());
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            border-radius: 5px;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // AI Chat System
    setupAIChat() {
        this.chatResponses = {
            'hello': '👋 Hello! I\'m your AI assistant for the Advanced Java Records System.',
            'hi': '👋 Hi there! How can I help you with the student records system?',
            'help': '🤖 I can help you with:\n• 📝 Adding new students\n• 🔍 Searching records\n• 💡 Understanding system features\n• 🧪 Lab work questions\n• 📊 Database operations',
            'students': `📊 You currently have ${this.students.length} students in the system. Great progress!`,
            'add': '➕ To add a student, navigate to the "Add Student" section and fill out the comprehensive form with validation.',
            'search': '🔍 Use the powerful search bar in the Students section to find specific records by name, email, or city.',
            'labs': '🧪 Your lab work covers:\n• Week 1: JDBC Connection & Statement Interface\n• Week 2: PreparedStatement CRUD & ResultSet Navigation\n• Screenshots: 233238, 233253, 233304, 233316',
            'week1': '📚 Week 1 Lab: JDBC fundamentals with MySQL connection and Statement interface for data operations.',
            'week2': '🔧 Week 2 Lab: Advanced JDBC with PreparedStatement for secure CRUD operations and ResultSet navigation.',
            'week3': '🏗️ Week 3 Lab: CallableStatement implementation for executing stored procedures with IN/OUT parameters.',
            'week4': '🌐 Week 4 Lab: Servlet programming with web.xml deployment, ServletConfig and ServletContext usage.',
            'week5': '🔄 Week 5 Lab: RequestDispatcher forwarding, sendRedirect implementation, and attribute passing between servlets.',
            'manoj': '👨💻 This advanced software was developed by Manoj Kumar, Roll Number: 238W1A1267.',
            'developer': '🚀 Developer: Manoj Kumar (238W1A1267) - Advanced Java Records System',
            'features': '✨ Key Features:\n• 📱 Responsive Design\n• 🔐 Form Validation\n• 🤖 AI Assistant\n• 💾 Local Storage\n• 🎨 Modern UI/UX',
            'jdbc': '🔗 JDBC (Java Database Connectivity) enables Java applications to interact with databases using SQL.',
            'mysql': '🗄️ MySQL integration allows persistent data storage with CRUD operations.',
            'crud': '📝 CRUD Operations: Create, Read, Update, Delete - fundamental database operations.',
            'default': '🤔 I\'m here to help! Ask me about students, lab work, JDBC, or system features.'
        };
    }

    toggleChat() {
        const chat = document.getElementById('ai-chat');
        const fab = document.getElementById('chat-fab');
        
        if (!chat || !fab) return;
        
        if (chat.style.display === 'flex') {
            chat.style.display = 'none';
            fab.style.display = 'block';
        } else {
            chat.style.display = 'flex';
            fab.style.display = 'none';
        }
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        if (!input) return;
        
        const message = input.value.trim();
        
        if (!message) return;

        this.addChatMessage(message, 'user');
        input.value = '';

        setTimeout(() => {
            const response = this.getAIResponse(message);
            this.addChatMessage(response, 'ai');
        }, 1000);
    }

    addChatMessage(message, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;
        messageDiv.textContent = message;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    getAIResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        for (const [key, response] of Object.entries(this.chatResponses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }
        
        return this.chatResponses.default;
    }

    // Initialize sample data
    initSampleData() {
        if (this.students.length === 0) {
            const sampleStudents = [
                {
                    id: 1,
                    name: 'Manoj Kumar',
                    age: 20,
                    city: 'Hyderabad',
                    email: 'manoj.kumar@example.com',
                    phone: '9876543210',
                    course: 'Computer Science',
                    createdAt: new Date().toLocaleDateString()
                },
                {
                    id: 2,
                    name: 'Rahul Sharma',
                    age: 21,
                    city: 'Bangalore',
                    email: 'rahul@example.com',
                    phone: '9876543211',
                    course: 'Information Technology',
                    createdAt: new Date().toLocaleDateString()
                },
                {
                    id: 3,
                    name: 'Priya Singh',
                    age: 19,
                    city: 'Mumbai',
                    email: 'priya@example.com',
                    phone: '9876543212',
                    course: 'Electronics',
                    createdAt: new Date().toLocaleDateString()
                }
            ];
            
            this.students = sampleStudents;
            this.nextId = 4;
            this.saveData();
        }
    }
}

// Copy code function
function copyCode(elementId) {
    const codeElement = document.getElementById(elementId);
    if (codeElement) {
        const text = codeElement.textContent;
        navigator.clipboard.writeText(text).then(() => {
            // Show temporary feedback
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        });
    }
}

// Image modal functions
function openModal(img) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    if (modal && modalImg) {
        modal.style.display = 'block';
        modalImg.src = img.src;
    }
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initialize the application
const studentManager = new StudentManager();

// Add sample data on first load
if (localStorage.getItem('students') === null) {
    studentManager.initSampleData();
    studentManager.renderStudents();
    studentManager.populateFilters();
}

// Tab functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            const tabContainer = this.closest('.code-showcase');
            
            // Remove active class from all tabs and content
            tabContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            tabContainer.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            tabContainer.querySelector(`#${tabId}`).classList.add('active');
        });
    });
    
    // Handle accordion functionality
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const chevron = this.querySelector('.fa-chevron-down');
            
            if (content.classList.contains('active')) {
                content.classList.remove('active');
                chevron.style.transform = 'rotate(0deg)';
            } else {
                // Close all other accordions
                document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('active'));
                document.querySelectorAll('.fa-chevron-down').forEach(c => c.style.transform = 'rotate(0deg)');
                
                // Open clicked accordion
                content.classList.add('active');
                chevron.style.transform = 'rotate(180deg)';
            }
        });
    });
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .accordion-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
    }
    
    .accordion-content.active {
        max-height: 500px;
    }
    
    .fa-chevron-down {
        transition: transform 0.3s ease;
    }
`;
document.head.appendChild(style);