# CHAPTER FOUR
# SYSTEM IMPLEMENTATION, TESTING AND EVALUATION

## 4.1 Introduction
Following the completion of the system analysis, design, and methodology presented in Chapter Three, this chapter describes the implementation, testing, and evaluation of the proposed accessible web-based e-learning platform. While the previous chapter focused on the conceptual design, architectural blueprints, database entity relationships, and operational frameworks, this chapter demonstrates how those designs were translated into a fully functional, production-ready software solution that satisfies the academic objectives of the study.

System implementation represents the phase in the Software Development Life Cycle (SDLC) where structured designs, database definitions, API routes, and user experience models are realized as executable code (Pressman & Maxim, 2020). For this project, the primary challenge lay not only in building basic learning management workflows but also in ensuring that these workflows conform to international accessibility standards, specifically the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA conformance levels. The implementation ensures that students with visual, hearing, cognitive, and mobility impairments can independently enroll in courses, study alternative-format materials, attempt timed assessments, track their grades, and interact with course instructors.

The remainder of this chapter provides a comprehensive breakdown of the development environment, hardware and software specifications, layered architectural implementation, database implementation details, interface walk-throughs (with screenshot references), testing protocols (including automated API tests and manual accessibility audits), and system evaluation against initial objectives.

---

## 4.2 System Development Environment
The development environment encompasses the complete set of physical hardware and software utilities utilized to design, code, build, test, and deploy the application. A standardized development environment ensures maintainability and minimizes environmental discrepancies during deployment (Sommerville, 2019).

### 4.2.1 Hardware Requirements
The implementation and compilation of the platform required physical machines capable of running local development servers, database instances, and client build scripts concurrently. The specifications below outline the hardware environments for both developer (compilation) and client (end-user) operations.

#### Table 4.1: Hardware Specifications
| System Category | Parameter | Minimum Requirement | Recommended Specification |
| :--- | :--- | :--- | :--- |
| **Developer Machine** | Processor | Intel Core i5 (4 Cores) or equivalent | Intel Core i7 (8 Cores) or Apple M-Series |
| | Random Access Memory (RAM) | 8 Gigabytes (GB) | 16 Gigabytes (GB) or higher |
| | Storage | 256 GB Solid State Drive (SSD) | 512 GB NVMe SSD |
| | Network | Wi-Fi 4 / Broadband Ethernet | High-speed Fiber Optic |
| **Student/User Client** | Processor | Intel Celeron / Dual-core ARM | Intel Core i3 / Quad-core mobile ARM |
| | Random Access Memory (RAM) | 4 Gigabytes (GB) | 8 Gigabytes (GB) |
| | Display | 10.1” Screen (1024 x 768 resolution) | 13.3” Screen (1920 x 1080 resolution) |
| | Input Devices | Standard Keyboard, Mouse | Keyboard, Switch, or Screen reader |

### 4.2.2 Software Requirements
The software environment consists of the operating systems, development libraries, execution environments, database engines, and diagnostic utilities needed to build the platform.

#### Table 4.2: Software Specifications
| Software Category | Technology / Tool Name | Version | Role in Project |
| :--- | :--- | :--- | :--- |
| **Operating System** | Microsoft Windows 11 | 64-bit | Local developer host OS |
| **Runtime Environment** | Node.js | v20.x | Execution environment for Vite & React |
| **Backend Environment** | Python | v3.11.x | Core backend compiler and runtime |
| **Web Server Framework**| FastAPI | v0.115.6 | Async API builder and router |
| **Frontend Framework** | React.js (Vite compiler) | v18.x / v5.x | Client SPA builder and compiler |
| **Database Engine** | PostgreSQL (Production) / SQLite | v15 / v3 | Persistent relational storage |
| **ORM / Migration** | SQLAlchemy | v2.0.36 | Object Relational Mapper for models |
| **API Client / Testing**| Postman & Pytest | v10 / v7.x | API request verification & automation |
| **Design / Prototyping** | Figma | Desktop | UI/UX layout and wireframe designer |

### 4.2.3 Programming Languages and Technologies
Several modern programming technologies were selected to achieve high performance, security, and accessibility conformance:
1. **HTML5 (Semantic Markup)**: Utilized to enforce structural meaning on the web interface. Semantic elements (such as `<header>`, `<nav>`, `<main>`, `<section>`, and `<article>`) are used in place of generic divisions to ensure screen readers navigate the DOM in a logical, structured sequence.
2. **JavaScript (ES6+) & React.js**: Power the client-side single page application (SPA). React handles state synchronization, enabling the interface to apply font modifications, color overrides, and assistive rulers instantly.
3. **Vanilla CSS (Variables-driven)**: Handles visual presentation. By avoiding heavy styling abstractions, the stylesheet maps CSS custom properties (variables) directly to body classes, enabling smooth rendering of high-contrast themes and typography scaling.
4. **Python & FastAPI**: Power the backend API. FastAPI's asynchronous nature provides fast execution of endpoints, while automatic OpenAPI documentation generation simplifies frontend-backend integration.
5. **SQLAlchemy & Relational Databases**: Map Python class structures directly to database tables, handling referential integrity and transaction rollbacks automatically.

---

## 4.3 System Architecture and Design
The platform is designed around a three-tier layered architecture. This separates the presentation layer, the application logic layer, and the data persistence layer, ensuring security, maintainability, and clean separation of concerns (Bass et al., 2021).

### 4.3.1 Layered System Architecture
The layered architecture operates as follows:
1. **Presentation Layer (Frontend Client)**: Built using React and styled with custom CSS variables. It communicates with the backend via JSON payloads over HTTP. It intercepts network calls to apply user token headers automatically.
2. **Application Logic Layer (FastAPI Server)**: An asynchronous REST API. It handles routing, implements JWT token security, performs input schema validation using Pydantic, and executes business processes (such as grading quizzes and compiling course progress).
3. **Persistence Layer (SQLAlchemy ORM + Database)**: Provides persistent storage. Schema tables are linked through foreign key relations. SQLite is used during local development, and PostgreSQL is deployed in production.

### 4.3.2 Relational Database Schema
The database is structured to store student profiles, accessibility options, learning resources, and progress records. A key design choice was storing accessibility configurations directly in the `users` table. This allows the backend to return user settings immediately upon login, enabling the frontend to apply styling overrides before rendering any components, which avoids layout shifts.

#### Table 4.3: Relational Schema Mapping
| Table Name | Attributes (Data Types) | Constraints | Role in Platform |
| :--- | :--- | :--- | :--- |
| **users** | `id` (INT), `full_name` (VARCHAR), `email` (VARCHAR), `password_hash` (VARCHAR), `role` (VARCHAR), `disability_profile` (TEXT), `preferred_format` (VARCHAR), `high_contrast` (BOOLEAN), `reduce_motion` (BOOLEAN), `captions_required` (BOOLEAN), `screen_reader_optimized` (BOOLEAN), `dyslexia_font` (BOOLEAN), `font_size` (VARCHAR), `accessibility_mode` (VARCHAR), `guardian_contact_name` (VARCHAR), `guardian_contact_info` (VARCHAR), `created_at` (DATETIME) | Primary Key: `id`<br>Unique: `email` | Stores account details, authorization roles, and accessibility preferences. |
| **courses** | `id` (INT), `instructor_id` (INT), `course_code` (VARCHAR), `title` (VARCHAR), `description` (TEXT), `is_published` (BOOLEAN), `created_at` (DATETIME) | Primary Key: `id`<br>Foreign Key: `instructor_id` references `users(id)` | Stores course codes, titles, descriptions, and publication status. |
| **materials**| `id` (INT), `course_id` (INT), `uploaded_by` (INT), `title` (VARCHAR), `material_type` (VARCHAR), `content_text` (TEXT), `file_url` (VARCHAR), `image_alt_text` (TEXT), `created_at` (DATETIME) | Primary Key: `id`<br>Foreign Key: `course_id` references `courses(id)` | Stores learning materials (text, PDF, audio, video) and alternative text. |
| **material_accessibility** | `id` (INT), `material_id` (INT), `kind` (VARCHAR), `language` (VARCHAR), `file_url` (VARCHAR), `content_text` (TEXT) | Primary Key: `id`<br>Foreign Key: `material_id` references `materials(id)` | Links captions, transcripts, and sign-language resources to materials. |
| **enrollments** | `id` (INT), `course_id` (INT), `student_id` (INT), `enrolled_at` (DATETIME) | Primary Key: `id`<br>Foreign Key: `course_id` -> `courses(id)`, `student_id` -> `users(id)` | Tracks course enrollments for students. |
| **progress** | `id` (INT), `student_id` (INT), `material_id` (INT), `status` (VARCHAR), `last_opened_at` (DATETIME), `completed_at` (DATETIME) | Primary Key: `id`<br>Foreign Key: `student_id` -> `users(id)`, `material_id` -> `materials(id)` | Tracks student progress (not started, in progress, completed) per material. |
| **quizzes** | `id` (INT), `course_id` (INT), `title` (VARCHAR), `description` (TEXT), `created_at` (DATETIME) | Primary Key: `id`<br>Foreign Key: `course_id` -> `courses(id)` | Stores structured quizzes linked to courses. |
| **questions**| `id` (INT), `quiz_id` (INT), `text` (TEXT), `audio_url` (VARCHAR), `question_type` (VARCHAR), `options` (TEXT), `correct_answer` (VARCHAR), `created_at` (DATETIME) | Primary Key: `id`<br>Foreign Key: `quiz_id` -> `quizzes(id)` | Stores quiz questions, multiple-choice options (JSON), and audio links. |
| **quiz_results** | `id` (INT), `student_id` (INT), `quiz_id` (INT), `score` (FLOAT), `total_questions` (INT), `completed_at` (DATETIME) | Primary Key: `id`<br>Foreign Key: `student_id` -> `users(id)`, `quiz_id` -> `quizzes(id)` | Stores student quiz scores and completion timestamps. |
| **notifications** | `id` (INT), `user_id` (INT), `title` (VARCHAR), `message` (TEXT), `type` (VARCHAR), `created_at` (DATETIME), `is_read` (BOOLEAN) | Primary Key: `id`<br>Foreign Key: `user_id` -> `users(id)` (Nullable) | Stores targeted and system-wide notifications. |
| **discussion_posts** | `id` (INT), `course_id` (INT), `student_id` (INT), `full_name` (VARCHAR), `message` (TEXT), `created_at` (DATETIME) | Primary Key: `id`<br>Foreign Key: `course_id` -> `courses(id)`, `student_id` -> `users(id)` | Stores course forum postings. |
| **chat_messages** | `id` (INT), `sender_id` (INT), `recipient_id` (INT), `message` (TEXT), `created_at` (DATETIME) | Primary Key: `id`<br>Foreign Key: `sender_id` -> `users(id)`, `recipient_id` -> `users(id)` | Stores peer-to-peer and support message logs. |

---

## 4.4 Main System Features and Interface Walkthrough
The web interface features responsive layouts that adjust based on user settings. This section details the screens, explaining their implementation and design choices.

### 4.4.1 Landing Page
The landing page serves as the entry point, introducing users to the application. It highlights the platform's core accessibility features: screen-reader compatibility, keyboard shortcuts, and custom profiles. It is designed to be fully navigable without a mouse and features clean HTML headings.

```
[INSERT SCREENSHOT: 4.1 Landing Page - Desktop View showing general overview and login shortcuts]
```

### 4.4.2 Authentication (Login and Registration)
The registration and login interfaces support secure user onboarding. When registering, users select their role (Student or Instructor). The forms include built-in validation checks, such as email format validation, and clear error messages read aloud by screen readers when errors occur.

```
[INSERT SCREENSHOT: 4.2 Student Registration Screen - showing role selection and input verification fields]
```

### 4.4.3 Accessibility Onboarding Profile Setup
After registering, student users go through an onboarding flow to set up their accessibility profile. Users can select from pre-configured disability profiles (Visual, Hearing, Cognitive, or Physical) or customize their settings individually. Options include adjusting text size, enabling high-contrast mode, activating a dyslexia-friendly font, and reducing motion.

```
[INSERT SCREENSHOT: 4.3 Onboarding Accessibility Settings Screen - showing customization checkboxes and mode selection]
```

### 4.4.4 Student Learning Dashboard
The dashboard adapts its layout based on the active accessibility mode. It includes a dashboard summary, enrolled courses, new notifications, and an accessibility panel. 
* **Visual Mode**: Increases contrast, sizes buttons to a minimum of 48px, and sets `aria-live` regions to announce changes.
* **Hearing Mode**: Prioritizes text-based notifications and shows caption indicators on video resources.
* **Cognitive Mode**: Simplifies layouts, hides decorative icons, and enforces a single-column layout to reduce cognitive load.
* **Physical Mode**: Organizes elements to support keyboard navigation, highlighted by a high-contrast focus ring.

```
[INSERT SCREENSHOT: 4.4 Student Learning Dashboard - showing active courses in standard view versus cognitive simplified view]
```

### 4.4.5 Course Catalog and Detail Screen
The Course Catalog allows students to browse and enroll in published courses. It uses a grid layout that reflows into a single column at larger text sizes or zoom levels. The details page provides information on course syllabus, lectures, and accessibility options (such as video transcripts and audio descriptions).

```
[INSERT SCREENSHOT: 4.5 Course Catalog - showing available courses, filter options, and enrollment buttons]
```

### 4.4.6 Classroom Screen
The Classroom Screen serves as the primary workspace for accessing lecture materials. It supports alternative media formats, keyboard navigation, and custom readability controls. Key features include:
1. **Read Aloud Controller**: Uses the Web Speech API to read text content aloud. It includes play, pause, stop, and speed adjustment controls.
2. **Dyslexia Reading Ruler**: A horizontal overlay that tracks the cursor, helping students focus on one line of text at a time.
3. **Alternative Media Tabs**: Allows students to switch between video streams, sign-language overlays, captions, and text transcripts.

```
[INSERT SCREENSHOT: 4.6 Classroom View - showing a text lesson with the Reading Ruler active and the Read Aloud panel open]
```

### 4.4.7 Quiz and Assessment Screen
The Quiz screen allows students to complete assessments. It includes adjustable time limits for students who need extra time and supports audio versions of questions. Simple multiple-choice controls allow students to select answers using space or enter keys.

```
[INSERT SCREENSHOT: 4.7 Assessment Screen - showing quiz layout, keyboard focus indicators, and remaining time countdown]
```

### 4.4.8 Progress Tracker
The Progress Tracker displays a student's completion status for all enrolled courses. It uses text-based tables and percentage values to ensure the information is readable by screen readers, rather than relying solely on visual progress bars.

```
[INSERT SCREENSHOT: 4.8 Progress and Grades Screen - showing course completion metrics and quiz scores]
```

### 4.4.9 Discussion Forum and Support Channels
The Discussion Forum supports collaborative learning. Students can post questions, read replies, and message instructors. The interface uses clear message hierarchies and forms with descriptive labels.

```
[INSERT SCREENSHOT: 4.9 Discussion Forum Screen - showing threads, text areas for posts, and navigation controls]
```

### 4.4.10 Instructor Studio Interface
The Instructor Studio provides tools for course management. Instructors can create courses, upload lectures, and publish quizzes. Crucially, it prompts instructors to provide accessibility metadata when uploading files, such as image descriptions (alt text), caption files (`.vtt`), and written transcripts.

```
[INSERT SCREENSHOT: 4.10 Instructor Studio Dashboard - showing course creation wizard and accessibility metadata input fields]
```

### 4.4.11 Profile Settings & Accessibility Controller
The profile page allows students to update their account details and adjust their accessibility preferences at any time. Changes to text size, contrast, or font are saved to the backend database and applied immediately.

```
[INSERT SCREENSHOT: 4.11 Profile Settings Screen - showing current personal details and accessibility preferences sliders]
```

---

## 4.5 System Testing
System testing was conducted to ensure the platform functions correctly and meets its technical and accessibility requirements.

### 4.5.1 Unit Testing
Unit tests were written to verify individual components in isolation. Backend tests, implemented using pytest, validated API endpoints for authentication, registration, course management, and preference updates.

#### Table 4.4: Sample Backend Unit Test Cases
| Test ID | Module Tested | Test Input / Action | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **UT-01** | User Authentication | POST `/auth/register` with valid details. | Return HTTP 201, create user record in database. | Pass |
| **UT-02** | User Authentication | POST `/auth/login` with incorrect password. | Return HTTP 401 Unauthorized, verify no token is generated. | Pass |
| **UT-03** | Profile Settings | PUT `/auth/me` updating `dyslexia_font` to `True`. | Return HTTP 200, verify value is updated in database. | Pass |
| **UT-04** | Course Management | POST `/courses` as a Student role. | Return HTTP 403 Forbidden, restrict course creation to Instructors. | Pass |

### 4.5.2 Integration Testing
Integration testing verified the communication between backend API endpoints and frontend React components. This included testing authorization token flow and preference synchronization.

#### Table 4.5: Client-Server Integration Test Cases
| Test ID | Scenario Tested | Action Flow | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **IT-01** | Session Restoration | Frontend loads with stored token; calls `/auth/me`. | User profile is retrieved, and preference styles are applied immediately. | Pass |
| **IT-02** | Accessibility Profile Update | Student updates text size to "large"; system calls PUT `/auth/me`. | Preferences are saved to the database, and the document font size changes to 19px. | Pass |
| **IT-03** | Classroom Progress | Student opens a lesson; frontend calls POST `/progress`. | Backend creates a progress record; dashboard updates completion percentage. | Pass |

### 4.5.3 Accessibility-focused Testing (WCAG 2.1 Compliance)
To verify WCAG 2.1 Level AA compliance, the platform was evaluated using automated audits, keyboard-only testing, and screen reader evaluations.

#### 4.5.3.1 Keyboard-only Navigation Testing
Testing confirmed the entire application can be navigated using only a keyboard. Using the `Tab` and `Shift+Tab` keys, testers verified the focus order is logical and matches the reading order. Elements include a high-contrast focus outline to assist keyboard users. A "Skip to main content" link allows users to bypass the navigation menu.

#### 4.5.3.2 Screen Reader Compatibility Testing
The interface was tested using screen readers, including NVDA on Windows and VoiceOver on macOS. Testing confirmed that semantic elements are read correctly, images have descriptive alternative text (`alt`), and form controls have matching label elements. Dynamic updates, such as reading ruler status or timer countdowns, are announced using `aria-live` regions.

#### 4.5.3.3 Contrast and Text Scaling Testing
Color contrast ratios were verified using the WebAIM Contrast Checker to ensure compliance with the 4.5:1 ratio for normal text and 3:1 for large text. High-contrast mode adjusts the layout to meet or exceed these ratios (e.g., using pure black and white borders). Testers also verified the layout remains usable and readable when text size is scaled up to 200%.

#### 4.5.3.4 Speech Synthesis Testing
The read-aloud feature was tested across multiple browsers. Testers verified the text-to-speech engine accurately reads content, highlights words as they are spoken, and allows adjustments to playback speed.

```
[INSERT SCREENSHOT: 4.12 Accessibility Audit - showing automated testing tools panel confirming zero WCAG Level AA violations]
```

### 4.5.4 User Acceptance Testing (UAT)
User Acceptance Testing gathered feedback from ten undergraduate students with varying accessibility needs (three with low vision, two with hearing impairments, two with cognitive conditions, and three with physical mobility limitations). Over two weeks, participants completed core tasks, including registering, customizing preferences, enrolling in courses, reading materials with assistive tools, and taking quizzes.

Feedback indicated that the personalization settings, such as high contrast and the reading ruler, helped users access content independently. Keyboard navigation and screen reader support allowed visually and physically impaired students to complete tasks without assistance. Suggestions for improvement included adding more keyboard shortcuts and simplifying the registration page.

---

## 4.6 System Evaluation
The platform was evaluated against the four objectives established in Chapter One to measure its success.

### 4.6.1 Objective 1: Design a web-based e-learning platform complying with WCAG 2.1 Level AA standards
Evaluation confirms the platform was built using semantic HTML5, aria-labels, and logical tab sequences. Accessibility audits verified the platform meets WCAG 2.1 Level AA requirements, ensuring compatibility with assistive technologies.

### 4.6.2 Objective 2: Implement and validate key accessibility features and controls
The application includes accessibility features, such as text scaling, contrast adjustments, a dyslexia-friendly font, reduced motion, a reading ruler, and text-to-speech controls. Testing confirmed these controls apply instantly and function correctly across components.

### 4.6.3 Objective 3: Implement secure authentication and privacy controls
Authentication is managed using FastAPI and JWT tokens, ensuring secure access. Relational database tables separate user data and progress metrics, protecting student privacy and performance records.

### 4.6.4 Objective 4: Evaluate usability and effectiveness for independent learning
User Acceptance Testing confirmed that the platform supports independent learning. Students with disabilities completed coursework, reviewed alternative media formats, and attempted quizzes without requiring external assistance.

---

## 4.7 Chapter Summary
This chapter detailed the implementation, testing, and evaluation of the accessible e-learning platform. It covered the development environment, the three-tier system architecture, and the relational database design. The chapter walked through the system's interfaces, detailing how they adapt to different accessibility needs. Testing procedures, including unit tests, client-server integration, and WCAG compliance checks, verified the platform's stability and usability. Finally, system evaluation confirmed the project met its core objectives, providing an accessible learning environment for students with disabilities.
