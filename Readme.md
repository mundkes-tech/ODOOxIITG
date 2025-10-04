# Expense Management System

## Project Overview

[cite_start]This project is a comprehensive **Expense Management System** designed to streamline and automate the manual, time-consuming, and error-prone process of employee expense reimbursement[cite: 3]. [cite_start]It introduces transparency and flexibility by allowing companies to define advanced approval flows and manage expenses digitally[cite: 3].

Deployed Link :- https://odo-ox-iitg.vercel.app/

---

## Core Features

[cite_start]The system is built around robust features to handle the entire expense lifecycle, from submission to final approval[cite: 8].

### Authentication & User Management
* [cite_start]**Auto-Creation:** On first login/signup, a new **Company** (with its currency set to the selected country's currency) and an **Admin User** are automatically created[cite: 11].
* [cite_start]**User Roles:** The Admin can create **Employees & Managers** [cite: 13] [cite_start]and assign/change roles (Employee, Manager)[cite: 14].
* [cite_start]**Manager Relationships:** The Admin can define manager relationships for employees[cite: 15].

### Expense Submission (Employee Role)
* [cite_start]**Claim Submission:** Employees can submit expense claims, including the **Amount** (which can be in a currency different from the company's currency), **Category**, **Description**, and **Date**[cite: 18, 19].
* [cite_start]**Expense History:** Employees can view their expense history, including the approval status (**Approved**, **Rejected**)[cite: 20].
* [cite_start]**Receipt OCR (Additional Feature):** Employees can scan a receipt, and an **OCR algorithm** auto-generates the expense with necessary fields like amount, date, description, and expense type[cite: 46, 47].

### Flexible Approval Workflow (Manager/Admin Role)

[cite_start]The system supports both sequential and conditional approval flows[cite: 42].

#### 1. Multi-Level Sequential Approval
* [cite_start]**Manager First:** The expense is first approved by the employee's manager if the `IS MANAGER APPROVER` field is checked[cite: 22].
* [cite_start]**Defined Sequence:** When multiple approvers are assigned, the Admin can define their sequence (e.g., Manager $\rightarrow$ Finance $\rightarrow$ Director) [cite: 23-31].
* [cite_start]**Sequential Movement:** The expense moves to the next approver only after the current one approves or rejects it[cite: 32].
* [cite_start]**Approval Actions:** Managers can view expenses waiting for approval [cite: 34] [cite_start]and **Approve/Reject with comments**[cite: 35].

#### 2. Conditional Approval Flow
[cite_start]The system supports flexible approval rules[cite: 7, 37]:
* [cite_start]**Percentage Rule:** E.g., If 60% of approvers approve $\rightarrow$ Expense approved[cite: 39].
* [cite_start]**Specific Approver Rule:** E.g., If CFO approves $\rightarrow$ Expense auto-approved[cite: 40].
* [cite_start]**Hybrid Rule:** Rules can combine both (e.g., 60% **OR** CFO approves)[cite: 41].

---

## Roles & Permissions

| Role | Permissions |
| :--- | :--- |
| **Admin** | [cite_start]Create company (auto on signup), manage users, set roles, configure approval rules, view all expenses, override approvals[cite: 44]. |
| **Manager** | [cite_start]Approve/reject expenses (amount visible in company's default currency), view team expenses, escalate as per rules[cite: 44]. |
| **Employee** | [cite_start]Submit expenses, view their own expenses, check approval status[cite: 44]. |

---

## Technical Details

### API Integrations
[cite_start]The following external APIs are used to support currency and country data[cite: 48]:

* **Country and Currency Data:** `https://restcountries.com/v3.1/all?fields=name,currencies`
* **Currency Conversions:** `https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}`

### Mockup/Design
The conceptual design and flow of the application can be viewed here:
* [cite_start][Mockup Link](https://link.excalidraw.com/l/65VNwvy7c4X/4WSLZDTrhkA) [cite: 49]

### Technology Stack (To Be Filled)

*(**NOTE:** Replace the placeholders below with the actual technologies you used.)*

* **Frontend:** React
* **Backend:** Node.js/Express
* **Database:** MongoDB
* **OCR Library:**specific cloud vision API