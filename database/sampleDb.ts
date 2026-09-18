import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

let sqlInstance: SqlJsStatic | null = null;

export async function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlInstance) {
    sqlInstance = await initSqlJs();
  }
  return sqlInstance;
}

export async function createSampleDatabase(): Promise<Database> {
  const SQL = await getSqlJs();
  const db = new SQL.Database();

  // Create Tables
  db.run(`
    CREATE TABLE Departments (
      DepartmentID INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Location TEXT NOT NULL,
      Budget REAL NOT NULL,
      ManagerName TEXT
    );

    CREATE TABLE Employees (
      EmployeeID INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Email TEXT UNIQUE NOT NULL,
      DepartmentID INTEGER,
      Role TEXT NOT NULL,
      Salary REAL NOT NULL,
      JoinDate TEXT NOT NULL,
      PerformanceRating INTEGER CHECK(PerformanceRating BETWEEN 1 AND 5),
      FOREIGN KEY (DepartmentID) REFERENCES Departments(DepartmentID)
    );

    CREATE TABLE Projects (
      ProjectID INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      DepartmentID INTEGER,
      Budget REAL NOT NULL,
      StartDate TEXT NOT NULL,
      EndDate TEXT,
      Status TEXT CHECK(Status IN ('Planning', 'In Progress', 'Completed', 'On Hold')),
      FOREIGN KEY (DepartmentID) REFERENCES Departments(DepartmentID)
    );

    CREATE TABLE Salary (
      SalaryID INTEGER PRIMARY KEY AUTOINCREMENT,
      EmployeeID INTEGER NOT NULL,
      BaseSalary REAL NOT NULL,
      Bonus REAL NOT NULL,
      Tax REAL NOT NULL,
      PayDate TEXT NOT NULL,
      FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID)
    );

    CREATE TABLE Attendance (
      AttendanceID INTEGER PRIMARY KEY AUTOINCREMENT,
      EmployeeID INTEGER NOT NULL,
      Date TEXT NOT NULL,
      Status TEXT CHECK(Status IN ('Present', 'Remote', 'Absent', 'On Leave')),
      HoursWorked REAL NOT NULL,
      FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID)
    );

    CREATE TABLE LeaveRequests (
      LeaveID INTEGER PRIMARY KEY AUTOINCREMENT,
      EmployeeID INTEGER NOT NULL,
      LeaveType TEXT CHECK(LeaveType IN ('Vacation', 'Sick', 'Parental', 'Personal')),
      StartDate TEXT NOT NULL,
      EndDate TEXT NOT NULL,
      Status TEXT CHECK(Status IN ('Approved', 'Pending', 'Rejected')),
      FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID)
    );
  `);

  // Insert Departments
  const departments = [
    [1, 'Engineering', 'Building A - Floor 3', 1250000.00, 'Alex Mercer'],
    [2, 'Product & Design', 'Building A - Floor 2', 650000.00, 'Sophia Lin'],
    [3, 'Sales & Marketing', 'Building B - Floor 1', 890000.00, 'Marcus Vance'],
    [4, 'Human Resources', 'Building B - Floor 2', 420000.00, 'Elena Rostova'],
    [5, 'Finance & Operations', 'Building A - Floor 4', 780000.00, 'David Kincaid'],
    [6, 'Executive', 'Building C - Floor 5', 1500000.00, 'Victoria Sterling']
  ];

  for (const dep of departments) {
    db.run(
      `INSERT INTO Departments (DepartmentID, Name, Location, Budget, ManagerName) VALUES (?, ?, ?, ?, ?)`,
      dep
    );
  }

  // Generate 120 realistic employees
  const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
    'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
    'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
    'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah'
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
    'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
  ];

  const rolesByDept: Record<number, string[]> = {
    1: ['Senior Software Engineer', 'Staff Engineer', 'Backend Developer', 'Frontend Developer', 'DevOps Specialist', 'QA Architect', 'Data Engineer'],
    2: ['Product Manager', 'UX Designer', 'UI Architect', 'Technical Product Lead', 'Design Researcher'],
    3: ['Sales Manager', 'Account Executive', 'Marketing Director', 'Content Strategist', 'Growth Specialist'],
    4: ['HR Generalist', 'Recruitment Partner', 'Talent Manager', 'People Ops Specialist'],
    5: ['Financial Analyst', 'Senior Accountant', 'Operations Director', 'Compliance Officer'],
    6: ['Chief Technology Officer', 'VP of Engineering', 'VP of Product', 'Chief Financial Officer', 'Strategy Advisor']
  };

  const employeesData: Array<{ id: number; name: string; email: string; deptId: number; role: string; salary: number; joinDate: string; rating: number }> = [];

  for (let i = 1; i <= 120; i++) {
    const fn = firstNames[(i * 7) % firstNames.length];
    const ln = lastNames[(i * 11) % lastNames.length];
    const fullName = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@company.com`;
    const deptId = (i % 6) + 1; // 1 to 6
    const deptRoles = rolesByDept[deptId];
    const role = deptRoles[i % deptRoles.length];

    // Base salary range between $55,000 and $185,000
    let baseSalary = 55000 + (i * 1050) % 130000;
    if (deptId === 6) baseSalary += 45000; // Executives earned higher
    if (deptId === 1) baseSalary += 20000; // Tech

    // Join dates between 2020-01-15 and 2026-05-20
    const year = 2020 + (i % 7);
    const month = String((i % 12) + 1).padStart(2, '0');
    const day = String(((i * 3) % 28) + 1).padStart(2, '0');
    const joinDate = `${year}-${month}-${day}`;

    const rating = (i % 5) + 1;

    employeesData.push({
      id: i,
      name: fullName,
      email,
      deptId,
      role,
      salary: baseSalary,
      joinDate,
      rating
    });

    db.run(
      `INSERT INTO Employees (EmployeeID, Name, Email, DepartmentID, Role, Salary, JoinDate, PerformanceRating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [i, fullName, email, deptId, role, baseSalary, joinDate, rating]
    );
  }

  // Insert Projects (18 Projects)
  const projects = [
    [1, 'Cloud Native Migration', 1, 350000.00, '2024-01-10', '2025-12-31', 'In Progress'],
    [2, 'AI Assistant Platform', 1, 500000.00, '2024-06-01', '2026-06-30', 'In Progress'],
    [3, 'Data Warehouse Modernization', 1, 280000.00, '2023-03-15', '2024-11-20', 'Completed'],
    [4, 'Mobile App Redesign v3', 2, 180000.00, '2025-02-01', '2025-09-30', 'In Progress'],
    [5, 'Design System Standardization', 2, 120000.00, '2024-08-10', '2025-03-31', 'Completed'],
    [6, 'Enterprise Q3 Marketing Campaign', 3, 220000.00, '2025-07-01', '2025-10-31', 'Planning'],
    [7, 'Global Sales Expansion', 3, 400000.00, '2024-02-01', '2025-12-15', 'In Progress'],
    [8, 'Employee Wellness Portal', 4, 85000.00, '2024-05-01', '2024-10-15', 'Completed'],
    [9, 'Talent Acquisition AI Tool', 4, 150000.00, '2025-01-10', '2025-11-30', 'In Progress'],
    [10, 'Automated Financial Reporting', 5, 200000.00, '2024-04-01', '2025-04-01', 'Completed'],
    [11, 'SOX Compliance Audit 2025', 5, 95000.00, '2025-01-01', '2025-06-30', 'On Hold'],
    [12, 'Executive Leadership Summit', 6, 110000.00, '2025-03-01', '2025-04-15', 'Completed'],
    [13, 'Zero Trust Security Upgrade', 1, 310000.00, '2025-05-01', '2026-03-31', 'In Progress'],
    [14, 'Customer Analytics Engine', 2, 240000.00, '2024-11-01', '2025-10-01', 'In Progress'],
    [15, 'Partner Channel Portal', 3, 175000.00, '2024-09-01', '2025-05-31', 'Completed'],
    [16, 'HR Onboarding Revamp', 4, 65000.00, '2025-03-15', '2025-08-15', 'In Progress'],
    [17, 'Tax Automation Engine', 5, 130000.00, '2024-10-01', '2025-06-01', 'Completed'],
    [18, 'Strategic M&A Assessment', 6, 450000.00, '2025-02-01', '2025-12-31', 'In Progress']
  ];

  for (const proj of projects) {
    db.run(
      `INSERT INTO Projects (ProjectID, Name, DepartmentID, Budget, StartDate, EndDate, Status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      proj
    );
  }

  // Insert Salary History Records (240 records)
  for (let empId = 1; empId <= 120; empId++) {
    const emp = employeesData[empId - 1];
    const base = emp.salary;
    const bonus1 = Math.round(base * 0.08);
    const bonus2 = Math.round(base * 0.12);
    const tax = Math.round(base * 0.22);

    db.run(
      `INSERT INTO Salary (EmployeeID, BaseSalary, Bonus, Tax, PayDate) VALUES (?, ?, ?, ?, ?)`,
      [empId, base, bonus1, tax, '2024-12-31']
    );
    db.run(
      `INSERT INTO Salary (EmployeeID, BaseSalary, Bonus, Tax, PayDate) VALUES (?, ?, ?, ?, ?)`,
      [empId, base, bonus2, tax, '2025-06-30']
    );
  }

  // Insert Attendance Records (600 records across recent days)
  const attendanceStatuses = ['Present', 'Present', 'Present', 'Remote', 'Remote', 'Absent', 'On Leave'];
  const dates = ['2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24', '2026-07-25'];

  let attendanceCount = 1;
  for (const dt of dates) {
    for (let empId = 1; empId <= 120; empId++) {
      const statusIdx = (empId * 13 + attendanceCount) % attendanceStatuses.length;
      const status = attendanceStatuses[statusIdx];
      let hours = 8.0;
      if (status === 'Remote') hours = 8.5;
      if (status === 'Absent') hours = 0.0;
      if (status === 'On Leave') hours = 0.0;

      db.run(
        `INSERT INTO Attendance (EmployeeID, Date, Status, HoursWorked) VALUES (?, ?, ?, ?)`,
        [empId, dt, status, hours]
      );
      attendanceCount++;
    }
  }

  // Insert Leave Requests (80 records)
  const leaveTypes = ['Vacation', 'Sick', 'Parental', 'Personal'];
  const leaveStatuses = ['Approved', 'Approved', 'Pending', 'Rejected'];

  for (let i = 1; i <= 80; i++) {
    const empId = (i * 3) % 120 + 1;
    const type = leaveTypes[i % leaveTypes.length];
    const status = leaveStatuses[i % leaveStatuses.length];
    const m = String((i % 6) + 1).padStart(2, '0');
    const startDay = String((i % 20) + 1).padStart(2, '0');
    const endDay = String((i % 20) + 5).padStart(2, '0');
    const startDate = `2026-${m}-${startDay}`;
    const endDate = `2026-${m}-${endDay}`;

    db.run(
      `INSERT INTO LeaveRequests (EmployeeID, LeaveType, StartDate, EndDate, Status) VALUES (?, ?, ?, ?, ?)`,
      [empId, type, startDate, endDate, status]
    );
  }

  return db;
}
