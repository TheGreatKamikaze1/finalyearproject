# TITLE PAGE
DESIGN AND IMPLEMENTATION OF AN ACCESSIBLE E-LEARNING PLATFORM FOR STUDENTS WITH DISABILITIES

BY

NZEKWUE, KACHIKWU HASEL
MATRIC. NO.: 21/52HL096

A PROJECT SUBMITTED IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF BACHELOR OF SCIENCE DEGREE IN INFORMATION TECHNOLOGY

DEPARTMENT OF INFORMATION TECHNOLOGY
FACULTY OF COMMUNICATION AND INFORMATION SCIENCES
UNIVERSITY OF ILORIN, ILORIN, NIGERIA.

AUGUST, 2026

# CERTIFICATION
This is to certify that this project work was carried out by **NZEKWUE KACHIKWU HASEL** with matriculation number **21/52HL096** in the Department of Information Technology, Faculty of Communication and Information Sciences, University of Ilorin, Ilorin, Nigeria.


_______________________						___________________
	(Name)							     Date
	Supervisor



______________________						___________________
	(Name)							     Date
	Head of Department



______________________						___________________
	Prof. Funmilola Omotayo						     Date
	External Examiner

# DEDICATION
This project is dedicated to Almighty God for His infinite grace, strength, wisdom, and guidance throughout the course of this study. It is also dedicated to my parents for their endless love, support, sacrifices, and constant encouragement which paved the way for my academic pursuits.

# ACKNOWLEDGEMENT
My profound gratitude goes to my supervisor for the invaluable guidance, patience, constructive criticism, and constant encouragement during the course of this project. The supervisor's academic oversight contributed significantly to the successful implementation of this system.

I would also like to thank the Head of the Department and all lecturers in the Department of Information Technology, University of Ilorin, for their dedication to academic excellence and support throughout my undergraduate studies.

Finally, I am deeply grateful to my family and friends for their moral and financial support, and to my classmates for their collaboration, peer support, and encouragement throughout this academic journey.

# LIST OF TABLES
Table 4.1: Hardware Specifications ............................................................................................ 49
Table 4.2: Software Specifications ............................................................................................ 50
Table 4.3: Relational Schema Mapping ...................................................................................... 53
Table 4.4: Sample Backend Unit Test Cases .................................................................------------- 56
Table 4.5: Client-Server Integration Test Cases .................................................................------- 57

# LIST OF FIGURES
Figure 3.1: Layered system design of the accessible e-learning platform ..................................... 40
Figure 3.2: Use case diagram for the accessible e-learning platform ........................................... 42
Figure 4.1: Landing Page - Desktop View ................................................................................... 54
Figure 4.2: Student Registration Screen ...................................................................................... 54
Figure 4.3: Onboarding Accessibility Settings Screen .................................................................. 54
Figure 4.4: Student Learning Dashboard ...................................................................................... 54
Figure 4.5: Course Catalog ........................................................................................................... 54
Figure 4.6: Classroom View ........................................................................................................... 54
Figure 4.7: Assessment Screen .................................................................................................... 54
Figure 4.8: Progress and Grades Screen ...................................................................................... 54
Figure 4.9: Discussion Forum Screen ........................................................................................... 54
Figure 4.10: Instructor Studio Dashboard ................................................................................... 54
Figure 4.11: Profile Settings Screen ............................................................................................ 54
Figure 4.12: Accessibility Audit .................................................................................................. 58

# ABBREVIATIONS AND ACRONYMS
AC     Accessible Classroom
ADHD   Attention Deficit Hyperactivity Disorder
API    Application Programming Interface
BSc    Bachelor of Science
CSS    Cascading Style Sheets
DOM    Document Object Model
HTML   HyperText Markup Language
HTTP   HyperText Transfer Protocol
IT     Information Technology
JWT    JSON Web Token
LMS    Learning Management System
NVDA   NonVisual Desktop Access
NUC    National Universities Commission
OECD   Organization for Economic Co-operation and Development
ORM    Object Relational Mapper
SPA    Single Page Application
TTS    Text-to-Speech
UDL    Universal Design for Learning
UNESCO United Nations Educational, Scientific and Cultural Organization
VTT    Video Text Tracks
WCAG   Web Content Accessibility Guidelines
WHO    World Health Organization

# ABSTRACT
Online learning has significantly transformed higher education, offering flexibility and continuous access to academic resources. However, many digital e-learning platforms present substantial accessibility barriers for students with disabilities, often excluding them from active participation. This study focused on the design and implementation of an accessible web-based e-learning platform tailored for undergraduate students with disabilities at the University of Ilorin, Nigeria. The platform was designed to comply with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA specifications.

The methodology adopted a design and implementation research approach. System analysis was conducted to examine accessibility barriers in existing learning environments, guiding the specification of functional and non-functional requirements. The system was implemented using a three-tier architecture consisting of a React.js client frontend, an asynchronous FastAPI Python backend server, and a relational database managed through SQLAlchemy. Key accessibility features integrated include interface-level customizations (text scaling, high-contrast mode, dyslexia-friendly fonts, and reduced motion), a dyslexia reading ruler, and text-to-speech rendering utilizing the Web Speech API. Additionally, the platform enabled instructors to upload lecture materials alongside critical accessibility metadata, including synchronized captions, transcripts, and alternative text descriptions for diagrams.

The platform's accessibility was validated using automated audits, keyboard-only path testing, and screen reader compatibility testing (NVDA/VoiceOver). User Acceptance Testing (UAT) was conducted with ten undergraduate students presenting visual, hearing, cognitive, and mobility impairments, as well as instructors. Feedback indicated that the platform effectively supported independent learning, enabling students with disabilities to review alternative-format materials, navigate pages without a mouse, attempt assessments, and track grades independently. The study demonstrates that digital educational platforms can achieve high inclusion levels when web accessibility standards are integrated as core design parameters.

# CHAPTER ONE
# INTRODUCTION

## 1.1 Background to the Study
The way people learn around the world has changed significantly over the past twenty years due to major improvements in computers and internet technology. Schools now use digital tools to support teaching and learning, making it easier for learners to access information, study at their own pace, and learn from almost anywhere.

Online learning is a major part of this shift. It provides learners with a digital space where they can access course materials, submit assignments, communicate with classmates and instructors, and take assessments remotely (UNESCO, 2020). As a result, the global education system has increasingly adopted online learning to improve access and flexibility. This transformation differs greatly from traditional classroom teaching because it allows learning to happen beyond physical classrooms. With the support of the internet and other digital tools, education has become more accessible to people regardless of location, reshaping how we understand the classroom and expanding opportunities for learning and personal development.

E-learning systems are useful because they let students learn at their pace and access academic resources constantly. Students can watch recorded lectures again and look at content as many times as they need to. This is why e-learning has become an integral part of higher education today, especially in developing countries where infrastructural and staffing constraints persist.

For example, the Organization for Economic Co-operation and Development (OECD) noted in 2021 that e-learning has become increasingly important. However, although e-learning is often presented as open to everyone and aimed at promoting fairness in education, real-world implementation reveals major challenges and barriers that can prevent equal access and participation.

A critical challenge associated with e-learning systems is digital accessibility. Accessibility concerns the degree to which digital platforms can be perceived, operated, and understood by individuals with varying abilities, including those with visual, hearing, motor, or cognitive impairments. The World Health Organization (WHO, 2011) estimated that approximately 15 percent of the global population lives with some form of disability. When digital platforms are designed without accessibility considerations, students with disabilities encounter significant barriers that exclude them from online learning environments and limit the academic benefits they can derive from educational technology.

Inclusive education emphasizes that every learner has a right to participate fully in learning activities through the removal of barriers to access and success. In digital learning, inclusion is best achieved by designing learning environments that work for everyone from the start, rather than adding fixes later.

One key approach that supports this is the Universal Design for Learning (UDL) framework. UDL encourages providing multiple ways for learners to access information, stay engaged, and demonstrate what they know. This is important because learners differ in how they understand content, what motivates them, and how they express their learning. UDL supports inclusion by offering multiple means of representation, engagement, and action/expression, making learning more flexible and accessible for diverse learners. As Meyer, Rose, and Gordon (2014) emphasize, these principles help educators design learning experiences that better support the needs of all learners.

Beyond pedagogy, web development standards provide technical specifications for achieving accessibility. The Web Content Accessibility Guidelines (WCAG), developed by the World Wide Web Consortium (W3C, 2018), outline criteria for ensuring digital content is perceivable, operable, understandable, and robust. These criteria include text alternatives for non-text content, full keyboard operability, visible focus states, adjustable color contrast ratios, and compatibility with assistive devices such as screen readers. Non-conformance to these guidelines results in e-learning platforms that are unusable for students with visual, hearing, or physical impairments, undermining the equitable potential of digital education.

In Nigeria, the adoption of e-learning platforms in higher education has accelerated, particularly following the campus closures caused by the COVID-19 pandemic. Institutions such as the University of Ilorin introduced virtual classrooms and learning management systems to sustain academic activities. However, existing e-learning platforms frequently replicate physical access barriers by failing to accommodate students with disabilities. Platforms are often deployed with rigid interfaces that assume standard visual, auditory, and motor capabilities, thereby ignoring the specialized needs of disabled learners.

Although Nigeria has established policy frameworks to promote inclusive education, such as the National Policy on Special Needs Education (Federal Ministry of Education, 2015), implementation within digital learning environments remains inconsistent. Students with disabilities frequently depend on informal peer support or manual assistance to access course materials and complete learning tasks. While helpful, such workarounds do not substitute for independent access. Consequently, there was an urgent need to design and implement e-learning systems that integrate accessibility as a core technical requirement, ensuring that students with disabilities can access educational resources independently and equitably.

## 1.2 Statement of the Problem
Undergraduate students with disabilities in Nigerian universities face major barriers when using online learning portals. Many existing learning systems are deployed without considering accessibility standards, rendering them incompatible with assistive technologies and excluding disabled students from equal educational opportunities. While universities increasingly mandate digital participation for course enrollment, study, and evaluation, the corresponding platforms remain largely inaccessible, creating a digital divide that disadvantages learners with sensory, cognitive, or motor impairments.

At the University of Ilorin, students with visual impairments struggle to access course notes and navigate learning portals. Buttons lack appropriate text labels, image files lack descriptive alternative text, and navigation links do not clearly state their destinations. Consequently, screen readers fail to parse the content, forcing visually impaired students to rely constantly on sighted peers to read lecture materials. Students with motor impairments face barriers because platforms do not support full keyboard navigation, requiring precise mouse clicks to access core controls.

For students with hearing impairments, video lectures and audio recordings lack captions and synchronized transcripts, excluding them from auditory instruction. Furthermore, students with cognitive or learning disabilities struggle when interfaces are overly complex, menus are inconsistent, or assessment modules enforce rigid time limits without accommodation. Such design issues increase cognitive load, leading to frustration and disengagement (Sweller, 2019).

In addition, accessibility accommodations in higher education are typically reactive, occurring only after students encounter insurmountable barriers. This reactive approach causes delays that place students with disabilities at an academic disadvantage. The lack of structured systems for delivering alternative media formats indicates a systemic flaw in current digital education models. This study addressed the problem of inaccessible e-learning platforms by designing, implementing, and validating an accessible web-based platform that conforms to international web accessibility standards, thereby promoting independent learning and academic inclusion for students with disabilities.

## 1.3 Aim and Objectives of the Study
### Aim
The Aim of this project was to design and implement an accessible e-learning platform for students with disabilities.

### Objectives
1. To design and develop a web-based e-learning platform for students with disabilities that complies with WCAG 2.1 Level AA accessibility standards and supports assistive technologies.
2. To implement and validate key accessibility features and controls.
3. To implement secure authentication and privacy controls that protect users' accounts, personal data, and learning records.
4. To evaluate and validate the platform’s accessibility, usability, and overall effectiveness through testing to confirm it supports independent learning.

## 1.4 Scope of the Study
This study focused on developing a web-based e-learning platform for undergraduate students with disabilities at the University of Ilorin, Ilorin, Nigeria. The platform was designed to accommodate visual, hearing, mobility, and cognitive impairments by providing a personalized, accessible learning environment.

The system included secure user authentication, role-based access control, course catalog registration, progress tracking, and discussion forums. For accessibility, the scope was restricted to a web application built using React.js and FastAPI, incorporating text scaling, contrast customization, dyslexia font rendering, a dyslexia reading ruler, and text-to-speech tools. The project did not include mobile app compilation (e.g., iOS or Android native packages) and did not aim to replace the entire University of Ilorin student portal system.

## 1.5 Significance of the Study
This study was significant because it promoted inclusive education by developing digital learning technology that students with disabilities can use effectively. The platform reduced dependence on sighted or physical assistance, allowing students with disabilities to access lecture notes, complete assessments, and communicate with instructors independently. Access to accessible materials supports student engagement, comprehension, and academic retention (Al-Azawei et al., 2017).

The University of Ilorin benefits from this study by aligning its e-learning practices with national policies, such as the Discrimination Against Persons with Disabilities (Prohibition) Act, and international accessibility standards. The study serves as a model for other Nigerian universities seeking to make their digital learning environments more inclusive. Additionally, the platform provided instructors with tools to easily upload lecture materials with accessibility metadata, raising awareness of digital inclusion among academic staff.

## 1.6 Limitations of the Study
The study was conducted for undergraduate students at the University of Ilorin, meaning the evaluation findings may not fully apply to other institutions with different student populations or policies. The platform’s performance was subject to local infrastructural challenges, such as unstable internet connectivity and electrical power outages, which affected user testing. Furthermore, the system did not integrate advanced adaptive learning algorithms or large-scale learning analytics due to time and resource constraints.

## 1.7 Operational Definition of Key Terms
* **E-learning**: The use of computers and digital technologies to deliver educational content and support learning activities outside a traditional physical classroom.
* **Accessibility**: The design of digital systems, interfaces, and content in a way that enables persons with disabilities to perceive, understand, navigate, and interact with them effectively and independently.
* **Assistive Technology**: Software or hardware devices used by individuals with disabilities to access and interact with digital information, such as screen readers, magnifiers, and voice recognition software.
* **Universal Design for Learning (UDL)**: A pedagogical framework for designing learning environments that support all learners by providing multiple ways to access information, stay engaged, and demonstrate learning.
* **Web Content Accessibility Guidelines (WCAG)**: The international standard for web content accessibility developed by the World Wide Web Consortium (W3C), defining testable criteria for digital inclusion.

## 1.8 Project Report Structure
The project report was structured into five chapters:
* **Chapter One** introduces the study, presenting the background, statement of the problem, objectives, scope, significance, limitations, and operational definition of key terms.
* **Chapter Two** reviews related literature, exploring the concept of e-learning, digital accessibility, WCAG 2.1 guidelines, assistive technologies, e-learning in Nigeria, existing related works, and the theoretical frameworks adopted.
* **Chapter Three** describes the methodology, detailing system analysis, requirements specification, layered architecture, database models, and accessibility evaluation criteria.
* **Chapter Four** details system implementation, showcasing modules, presenting interface screenshots and walkthroughs, documenting unit, integration, and accessibility tests, and evaluating the platform against the initial objectives.
* **Chapter Five** provides the summary of findings, conclusions, recommendations for institutions, and suggestions for future research.

---

# CHAPTER TWO
# LITERATURE REVIEW

## 2.1 Introduction
The literature review provides the conceptual and technical basis for designing and implementing an accessible e-learning platform. This chapter discusses e-learning concepts and digital accessibility standards, reviews how current platforms support students with disabilities, and establishes the theoretical and historical context of the study (Seale, 2014).

E-learning and learning management systems (LMS) have expanded access and flexibility in higher education. However, when accessibility standards are ignored, digital learning portals create new barriers that exclude students with visual, hearing, motor, and cognitive impairments (Seale, 2014; Selwyn, 2016). Ensuring accessibility is both a technical requirement and an equity issue; missing video captions, unlabelled interactive buttons, and poor keyboard navigation limit participation and worsen educational inequality (W3C, 2018; UNESCO, 2020).

## 2.2 Concept of E-Learning
E-learning refers to using digital technologies to deliver learning content, facilitate instruction, and support interaction among learners and instructors. It typically relies on internet technologies to distribute materials and enable communication, improving knowledge acquisition and performance (Rosenberg, 2001). In higher education, e-learning supports fully online, blended, and hybrid learning models.

Effective platforms must support the entire learning cycle: access to course materials, communication, collaboration, assessment, feedback, and academic record management. Institutions often implement these functions through Learning Management Systems (LMS) such as Moodle, Blackboard, and Canvas. These systems provide structured spaces where lecturers post resources, grade submissions, and make announcements, while students submit assignments and track progress (Anderson, 2008).

### 2.2.1 Evolution of E-Learning
E-learning has evolved in phases. Early models focused on digitizing classroom materials—converting paper notes into PDF documents or basic web pages. Later developments introduced interactivity, including multimedia resources, discussion forums, online quizzes, and live video sessions. With improvements in bandwidth and device availability, e-learning expanded to include learning analytics, mobile access, and personalized learning supports (Ally, 2019).

More recently, adaptive learning systems and AI-supported tutoring have gained attention. These approaches use interaction data to recommend resources, flag learning difficulties, and personalize learning paths (Holmes et al., 2022). While these innovations can enhance learning outcomes, they also introduce new accessibility concerns, especially when personalization features are not designed to work with assistive technologies or when interfaces become overly complex.

### 2.2.2 Forms and Models of E-Learning
E-learning can be implemented through several models. Fully online learning occurs when all instruction, activities, and assessments are conducted digitally. Blended learning combines face-to-face instruction with online components, while hybrid learning describes arrangements in which some learners attend physically and others participate remotely (Garrison & Anderson, 2003).

From a pedagogical perspective, e-learning environments can be explained using interaction models. Moore (1989) identifies learner–content, learner–instructor, and learner–learner interaction as essential dimensions of distance education. Effective platforms support all three interactions by enabling access to content, providing communication channels for feedback, and supporting collaborative activities such as forums, group work, and peer review.

### 2.2.3 Key Features of an LMS
An LMS typically includes content management tools (uploading and organizing learning materials), assessment tools (quizzes, assignments, grading), communication tools (forums, messaging, announcements), and tracking tools (attendance, activity logs, progress monitoring). These features make LMS platforms attractive for institutions, but system complexity can also present usability and accessibility challenges if inclusive design principles are not applied (Mayer, 2009; Sweller, 2019).

### 2.2.4 Benefits and Challenges of E-Learning
E-learning offers benefits such as flexibility of time and location, scalability of instruction, efficient resource distribution, and support for self-paced learning. Students can revisit materials, access resources repeatedly, and manage learning schedules around other commitments. Institutionally, it supports large class sizes, reduces printing costs, and provides consistent access to course information (Ally, 2019).

Despite these benefits, e-learning can reinforce educational inequality where access to devices, stable internet, and inclusive interfaces is limited. Challenges include reduced learner motivation in poorly designed environments, limited digital literacy, and technical barriers such as unreliable connectivity (Selwyn, 2016). For students with disabilities, these barriers are compounded when platforms are not designed for screen-reader use, lack captions, or rely on mouse-only interaction patterns.

## 2.3 Digital Accessibility in Education
Digital accessibility refers to the design of digital content and systems in ways that enable persons with disabilities to perceive, understand, navigate, and interact with technology effectively. In education, accessibility ensures that learning materials, assessments, communication tools, and platform interfaces are usable by all students regardless of sensory, physical, or cognitive limitations (W3C, 2018).

### 2.3.1 Accessibility and Inclusive Education
Inclusive education is grounded in the principle that all learners should have equal opportunities to participate and succeed. Within digital learning contexts, this implies that platforms should be designed to support diverse learners from the outset rather than requiring learners to request accommodations after barriers are encountered (UNESCO, 2020). Accessibility also supports independence and privacy, allowing students with disabilities to complete tasks without constant reliance on peers or staff.

### 2.3.2 Accessibility versus Usability
Although related, accessibility and usability are not the same. Usability refers to how efficiently and satisfactorily a system can be used by the general population. Accessibility focuses specifically on whether users with disabilities can use the system at all, using assistive technologies and alternative interaction methods. A platform may appear usable to many users while remaining inaccessible to students who depend on screen readers, captions, keyboard navigation, or simplified layouts (W3C, 2018).

### 2.3.3 Accessibility as a Quality Requirement in System Design
From a system design perspective, accessibility is best treated as a core quality attribute alongside security, reliability, and performance. When accessibility is delayed until after implementation, it becomes more costly and difficult to address, often leading to partial fixes rather than systematic inclusion. Accessibility-by-design approaches embed requirements such as semantic structure, keyboard operability, caption support, and user customization from the start, improving the overall quality of the platform (W3C, 2018; UNESCO, 2020).

### 2.3.4 Digital Accessibility in Higher Education
The importance of digital accessibility in education is rooted in its capacity to promote equity, independence, and meaningful participation for all learners. When digital learning environments are accessible, students with disabilities are empowered to engage with academic content without constant dependence on external assistance. Research demonstrates that accessibility enhances not only inclusion but also overall system quality, as accessible platforms tend to be clearer, more structured, and easier to use for all learners (Kelly et al., 2020).

Digital accessibility is closely associated with the concept of digital equity, which emphasizes fair and just access to technological resources. In higher education, digital equity requires that students are not disadvantaged due to physical, sensory, or cognitive differences. Inaccessible systems contribute to a digital divide in which students with disabilities experience systematic exclusion from academic participation, assessment activities, and collaborative learning opportunities (Watkins, 2019).

## 2.4 Categories of Disabilities and Digital Learning Needs
Students with disabilities represent a diverse population with varying needs and interaction requirements. Understanding the digital learning needs associated with different disability categories enables system designers to anticipate barriers and incorporate inclusive solutions (WHO, 2011).

### 2.4.1 Visual Impairments
Visual impairments include total blindness, low vision, and color vision deficiencies. Students with visual impairments often rely on assistive technologies such as screen readers, screen magnifiers, and braille displays. For these technologies to function effectively, e-learning platforms must provide well-structured content with semantic HTML markup, descriptive alternative text for images, and logical heading hierarchies (Lazar et al., 2017).

Color contrast and visual presentation also play a critical role for learners with low vision. Insufficient contrast between foreground and background elements can render content unreadable, while reliance on color alone to convey meaning may exclude users with color blindness. Accessible platforms should therefore meet WCAG contrast requirements and provide non-color indicators.

### 2.4.2 Hearing Impairments
Hearing impairments range from mild hearing loss to complete deafness. Students with hearing impairments encounter barriers when instructional content relies heavily on audio elements without appropriate alternatives. Video lectures and audio instructions that lack captions or transcripts exclude deaf and hard-of-hearing learners from accessing critical information (Fichten et al., 2019). Accessible e-learning platforms should provide synchronized captions and accurate transcripts for all multimedia content.

### 2.4.3 Motor and Physical Disabilities
Motor or physical disabilities affect an individual’s ability to perform physical interactions such as typing or navigating interfaces using a mouse. Conditions such as cerebral palsy, spinal cord injuries, arthritis, and limb loss may limit fine motor control. Students with motor impairments often rely on alternative input devices, including keyboard-only navigation, voice recognition software, eye-tracking systems, or adaptive switches (Shinohara & Wobbrock, 2011). E-learning platforms must support full keyboard operability and avoid interaction patterns that demand precise mouse movements.

### 2.4.4 Cognitive and Learning Disabilities
Cognitive and learning disabilities include conditions such as dyslexia, ADHD, autism spectrum disorders, and memory impairments. In digital learning contexts, overly complex layouts, excessive animations, inconsistent navigation, and dense text can overwhelm learners and increase cognitive load (Sweller, 2019). Accessible platforms should prioritize clarity, predictability, and simplicity, offering clear navigation structures, chunked content presentation, and customizable fonts.

## 2.5 Web Content Accessibility Guidelines (WCAG)
The Web Content Accessibility Guidelines (WCAG) are internationally recognized standards developed by the World Wide Web Consortium (W3C, 2018) to guide the creation of accessible web content. In e-learning, WCAG is relevant because learning activities are delivered through web interfaces that students must access frequently.

### 2.5.1 WCAG as a Standard for Inclusive Digital Learning
WCAG provides technical requirements that help developers reduce access barriers. The guideline on text alternatives ensures that diagrams and images in lecture notes can be understood by students who cannot see them. Similarly, multimedia guidelines require captions and transcripts to support learners who cannot access audio content. WCAG translates inclusive education principles into implementable development tasks.

### 2.5.2 Structure of WCAG: Principles, Guidelines, and Success Criteria
WCAG is organized around four core principles, known as POUR: Perceivable, Operable, Understandable, and Robust. Each principle contains guidelines, and each guideline includes testable success criteria. This structure makes WCAG useful for both system planning and auditing (W3C, 2018).

### 2.5.3 Perceivable Principle
The perceivable principle requires that information and user interface components must be presented in ways users can perceive. For e-learning platforms, this includes providing text alternatives (alt text) for images, ensuring that information is not communicated by color alone, and supporting content scaling. Accessible multimedia—captions for videos and transcripts for audio—is also essential. Scanned PDF lecture notes that are not text-selectable present a major barrier, as screen readers cannot interpret them without optical character recognition.

### 2.5.4 Operable Principle
The operable principle requires that users can operate the interface regardless of their interaction method. In e-learning systems, operability includes full keyboard navigation, visible focus indicators, logical tab order, and avoidance of mouse-only interactions. It also includes providing adjustable time limits for quizzes to accommodate students who require assistive input devices.

### 2.5.5 Understandable Principle
The understandable principle focuses on ensuring that content and interface behavior are easy to comprehend. For learners with cognitive and learning disabilities, unclear language, inconsistent layouts, or unpredictable navigation can create confusion. Understandable design encourages readable text, consistent menus, clear instructions, and helpful form validation messages.

### 2.5.6 Robust Principle
The robust principle requires that content remains compatible with a wide range of user agents, including assistive technologies. Robustness is closely tied to proper coding practices—valid HTML, semantic structure, and appropriate use of ARIA attributes. Inaccessible coding patterns can cause screen readers to misinterpret content or fail entirely.

### 2.5.7 Conformance Levels (A, AA, AAA) and Their Implications
WCAG defines three conformance levels: A (minimum), AA (intermediate), and AAA (highest). Many institutions aim for Level AA because it addresses the most common barriers while remaining practical to implement. Level AA includes requirements such as sufficient color contrast, captions for videos, and clear focus indicators. In this study, WCAG 2.1 Level AA was adopted as the technical benchmark.

### 2.5.8 Accessibility Evaluation Approaches for WCAG Compliance
WCAG compliance is assessed through a combination of automated and manual evaluation. Automated tools detect issues like missing alt text and insufficient contrast. However, manual testing is required to verify that keyboard navigation is logical, headings are meaningful, and screen-reader announcements make sense.

## 2.6 Assistive Technologies in E-Learning
Assistive technologies (AT) enable students with disabilities to access course materials, navigate interfaces, and complete assessments. The effectiveness of AT depends on the accessibility of the platform itself (Burgstahler, 2015).

### 2.6.1 Screen Readers and Braille Technologies
Screen readers convert on-screen text and interface information into synthetic speech or braille output. Common screen readers include NVDA and JAWS for Windows, and VoiceOver for Apple devices. For screen readers to function, platforms must provide semantic headings, labeled buttons, and alternative text. Refreshable braille displays complement screen readers by translating text into tactile braille.

### 2.6.2 Screen Magnifiers and Visual Enhancement Tools
Students with low vision rely on screen magnifiers that enlarge content or adjust contrast. Platforms must support responsive layouts and reflow so that when content is magnified up to 200%, text does not overlap or spill off the screen.

### 2.6.3 Speech Recognition and Speech-to-Text Tools
Speech recognition tools allow students with physical disabilities to navigate interfaces and input text using voice commands. This requires platforms to provide clear focus states, predictable navigation, and accessible form controls.

### 2.6.4 Alternative Input Devices and Switch Access
Alternative input devices include adaptive keyboards, switch controls, and eye-tracking devices. Platforms that rely on complex drag-and-drop interactions present significant challenges. Designing for simple click actions and keyboard shortcuts supports wider participation.

### 2.6.5 Captioning, Transcription, and Sign-Language Supports
For students with hearing impairments, synchronized captions and text transcripts are essential. E-learning platforms must integrate media players that support closed captioning and make text transcripts easy to locate.

### 2.6.6 Common Compatibility Challenges in Practice
AT tools face compatibility challenges when platforms present scanned images, video content without captions, or dynamic components that do not announce updates. Building platforms in compliance with WCAG standards ensures reliable AT integration.

## 2.7 Accessible E-Learning in the Nigerian Context
The adoption of e-learning in Nigeria has increased due to growing internet penetration and the need to expand higher education access. Universities have adopted learning management systems to support teaching and assessment, a trend that intensified during the COVID-19 pandemic (Federal Ministry of Education, 2023).

However, accessibility challenges persist due to limited awareness of digital accessibility standards among developers and instructors. Accommodations are often reactive and informal, rather than systematically integrated into institutional policies. Although Nigeria has established legal frameworks, such as the Discrimination Against Persons with Disabilities (Prohibition) Act, enforcement within digital learning environments remains inconsistent, leaving students with disabilities dependent on peers or facing academic exclusion.

## 2.8 Review of Related Works
The review of related works situates the proposed system within existing research and technological solutions. This section reviews academic studies, existing learning management systems, and accessibility-focused platforms.

Several related works focus on accessibility solutions designed for specific disability groups, such as visual accessibility or screen-reader support. While these approaches enhance access for visually impaired learners, they often neglect the needs of students with motor, hearing, or cognitive disabilities. This single-disability focus limits the overall inclusiveness of such systems.

In the local context, research evaluating Nigerian university portals has revealed high numbers of accessibility violations when tested against WCAG standards (Akinsola & Adeyemi, 2020). Common violations include missing alternative text, poor keyboard navigation, and a lack of caption support. These findings highlight the need for e-learning platforms designed with accessibility as a core technical requirement.

#### Table 2.1: Comparison of Existing E-Learning Solutions
| Platform / Study | Accessibility Standard | Core Strengths | Key Limitations |
| :--- | :--- | :--- | :--- |
| **Moodle LMS** | Partial WCAG 2.1 AA | Extensible, modular, active community. | Configuration dependent; complex interface for cognitive needs. |
| **AChecker Audited Portals**| Evaluates WCAG 1.0/2.0 | Identifies common HTML syntax errors. | Reactive audit tool only; does not provide a learning environment. |
| **AC Academic Companion** | Custom framework | Mobile reminders, academic calendars. | Focused on mobile platform; lacks WCAG 2.1 Level AA web compatibility. |
| **Developed Platform** | Full WCAG 2.1 AA | Core personalization (text size, contrast, ruler, TTS, alt-media). | Limited to web client; does not include offline adaptive analytics. |

The comparative analysis reveals a persistent gap between accessibility principles and platform-level execution. Accessibility is frequently treated as an optional feature, leading to partial compliance. The developed e-learning platform addresses these gaps by embedding accessibility controls directly into the system design, ensuring consistent support across courses.

## 2.9 Theoretical Framework
Theoretical frameworks provide structured perspectives that support the design and evaluation of information systems. This study adopted the Technology Acceptance Model (TAM) and the Social Model of Disability.

### 2.9.1 Technology Acceptance Model (TAM)
TAM, developed by Davis (1989), posits that user acceptance of technology is determined by two main factors: Perceived Usefulness (PU) and Perceived Ease of Use (PEOU). In the context of accessible e-learning, PEOU is directly linked to accessibility. If a platform is incompatible with screen readers or keyboard navigation, students with disabilities will perceive it as difficult to use, leading to rejection. Ensuring accessibility increases perceived ease of use, promoting platform adoption.

### 2.9.2 Social Model of Disability
The Social Model of Disability, conceptualized by Oliver (1990), distinguishes between impairment (a biological condition) and disability (the social and environmental barriers that restrict participation). This model argues that disability is caused by poorly designed environments rather than an individual's physical or mental differences. Applied to e-learning, the model suggests that a student is disabled not by visual or physical differences, but by platforms that lack captions, alt-text, or keyboard navigation. Designing accessible platforms removes these barriers, enabling full academic participation.

---

# CHAPTER THREE
# METHODOLOGY AND SYSTEM DESIGN

## 3.1 Introduction
This chapter explains the methodology that was used to design and implement the accessible e-learning platform for students with disabilities. It shows how the research problem was turned into a practical system through requirement analysis, system design, implementation, and evaluation.

Because accessibility must be built into every development stage, the project prioritized inclusive, user-centered design to ensure equal access for learners with visual, hearing, motor, and cognitive disabilities, considering both technical and ethical needs.

## 3.2 Research Design
The research design adopted a design and implementation approach. This is an established methodology in computer science and information systems, aimed at creating, deploying, and evaluating a functional software solution to address a real-world problem.

The design and implementation approach was selected because it combines theoretical accessibility guidelines (WCAG 2.1) with practical system engineering. Rather than treating accessibility as an optional enhancement, the methodology integrated user-centered design, iterative testing, and validation at every phase of the development lifecycle. This ensured that the final e-learning platform was stable, functional, and usable by students with varying physical and cognitive abilities.

## 3.3 System Analysis
System analysis was conducted to examine accessibility barriers in existing learning portals and define the requirements for the new platform. At the University of Ilorin, system analysis focused on understanding how undergraduate students with disabilities interact with currently available e-learning tools.

When existing literature was reviewed, it was revealed that many platforms are not easy to use because navigation is not accessible, video lectures lack captions, interactive modules are incompatible with screen readers, and assessments enforce rigid time limits. A comprehensive list of these problems was compiled, which guided the formulation of functional and non-functional requirements.

Additionally, institutional requirements were analyzed. Universities require platforms that support course management, student records, assignments, and quizzes. The system analysis aligned accessibility requirements with these institutional objectives, ensuring the platform delivers inclusive learning experiences without compromising administrative functionality.

### 3.3.1 Analysis of Existing E-Learning Systems
Existing learning management systems, while effective for the general student population, present significant barriers for students with disabilities:
* **Visual Barriers**: Poorly structured HTML makes navigation difficult for screen reader users. Scanned PDF lecture notes uploaded as images are unreadable by text-to-speech tools.
* **Auditory Barriers**: Video lectures and audio instructions lack captions and text transcripts, excluding deaf and hard-of-hearing students from instruction.
* **Physical Barriers**: Quizzes and navigation buttons are often incompatible with keyboard-only input, restricting students with physical mobility limitations.
* **Cognitive Barriers**: Complex page layouts, dynamic animations, and inconsistent menu structures increase cognitive load, confusing students with learning disabilities.

The developed platform addressed these limitations by embedding accessibility options directly into the core system design, reducing reliance on ad-hoc accommodations and providing consistent support across courses.

## 3.4 System Requirements
System requirements define what the platform must achieve and how it should operate. The requirements were categorized into functional requirements (what the system does) and non-functional requirements (the quality characteristics of the platform).

### 3.4.1 Functional Requirements
The platform must support core teaching and learning activities:
* **User Authentication**: Secure registration and login with role-based access control (Student, Instructor, Administrator).
* **Profile Management**: Allow students to configure and save accessibility preferences.
* **Course Management**: Instructors can create courses, upload lecture materials, and publish assessments.
* **Content Delivery**: Support text, PDF, audio, and video resources, along with accessibility metadata (captions, transcripts, alt-text).
* **Assessment Management**: Allow instructors to create quizzes, and students to attempt timed assessments.
* **Progress Tracking**: Track and display completion metrics for course materials.

### 3.4.2 Non-Functional Requirements
The platform must satisfy several quality requirements:
* **Accessibility**: Full conformance with WCAG 2.1 Level AA criteria, including keyboard navigability, contrast ratios, and screen reader compatibility.
* **Usability**: Intuitive interface design, consistent layouts, and clear instructions.
* **Security**: Enforce secure authentication using JWT tokens and protect user personal data.
* **Performance**: Fast page loading times and responsive database queries under normal usage.
* **Scalability**: Capable of supporting additional users, courses, and materials without performance degradation.

## 3.5 System Architecture
The platform was implemented using a three-tier layered architecture, which separates the presentation, application, and data persistence layers:
1. **Presentation Layer**: Built using React.js. It manages the user interface and applies visual accessibility overrides (high contrast, font scaling) dynamically based on active preferences.
2. **Application Layer**: An asynchronous FastAPI Python server. It processes API requests, handles authentication, and coordinates course, progress, and assessment logic.
3. **Data Layer**: Relational database (SQLite/PostgreSQL) managed using SQLAlchemy ORM. It stores user profiles, accessibility preferences, course content, and quiz results.

| Layer Name | Technologies | Main Role |
| :--- | :--- | :--- |
| **Presentation** | React.js, Vanilla CSS | Manages UI rendering and handles dynamic accessibility stylesheet overrides. |
| **Application** | Python, FastAPI | Processes backend business logic, handles token security, and validates data schemas. |
| **Data Layer** | PostgreSQL / SQLAlchemy | Stores relational records (Users, Courses, Materials, Progress, Quizzes). |

This architecture ensures system flexibility. Changes to user interface components or accessibility configurations can be implemented without impacting core database logic or application processing.

```
[INSERT DIAGRAM: Figure 3.1: Layered system design of the accessible e-learning platform]
```

## 3.6 System Design
System design translated the requirements and analysis findings into technical blueprints. Unified Modeling Language (UML) diagrams were used to model system interactions and workflows.

### 3.6.1 Use Case Design
The platform supports three distinct user roles:
* **Administrators**: Manage user accounts, platform settings, and system logs.
* **Instructors**: Create courses, upload learning materials with accessibility metadata, and manage assessments.
* **Students**: Personalize accessibility settings, enroll in courses, access lecture materials, and complete quizzes.

```
[INSERT DIAGRAM: Figure 3.2: Use case diagram for the accessible e-learning platform]
```

### 3.6.2 System Flow Design
The system flow design establishes clear steps for user interactions:
1. User logs in and authentication is validated.
2. The student completes accessibility personalization or lands on the dashboard.
3. The student registers for a course from the catalog.
4. The student accesses course materials and attempts quizzes.
5. Progress metrics and grade records are updated and saved to the database.

The workflow is simplified to ensure consistent navigation and reduce cognitive load for cognitive mode users.

### 3.6.3 Accessibility Design Considerations
Accessibility was integrated into the design from the start:
* **Visual Accessibility**: High contrast styles, adjustable font sizes, dyslexia-friendly fonts, and keyboard focus states.
* **Auditory Accessibility**: Support for video captions and synchronized text transcripts.
* **Motor Accessibility**: Logical focus order and keyboard-navigable buttons.
* **Cognitive Accessibility**: Consistent layouts, clear menus, and simple interactive forms.

## 3.7 Database Design
A relational database model was adopted to store user profiles, course records, learning materials, and progress data. Tables were structured with foreign keys to enforce data integrity. Storing accessibility configurations directly in the user profile table allows the frontend to retrieve and apply user settings immediately upon login, preventing layout shifts.

## 3.8 Development Tools and Technologies
The platform was implemented using web development technologies:
* **Frontend**: React.js with Vite compile tools. Styled using vanilla CSS custom properties to allow dynamic theme updates.
* **Backend**: FastAPI Python server for high-performance async requests.
* **Database**: PostgreSQL (production) and SQLite (development) with SQLAlchemy ORM.
* **Testing**: Automated API testing was performed using pytest, while manual audits verified WCAG compliance.

## 3.9 System Implementation Overview
The implementation phase converted the design specifications into a functional system. The platform was developed using a modular approach. Frontend components were built using semantic HTML5 tags to ensure compatibility with screen readers. Backend routes handled user registration, JWT token generation, course publishing, and progress logging. Accessibility features were validated during development to ensure compatibility with assistive technologies.

## 3.10 Accessibility Testing and Validation
Accessibility testing ensured the implemented platform met WCAG 2.1 Level AA requirements. Testing utilized a combination of automated tools (such as Lighthouse and Axe DevTools), manual keyboard audits, and screen reader evaluations (NVDA and VoiceOver). Visual audits checked color contrast ratios and page layouts under magnification. Feedback from testing guided iterative refinements to navigation menus and media controls.

## 3.11 System Evaluation Criteria
The system was evaluated against technical, usability, and accessibility criteria:
* **Accessibility Compliance**: Verification of WCAG 2.1 Level AA success criteria, including keyboard accessibility and alternative text.
* **Usability**: Ease of navigation, consistency of page layouts, and clarity of instructions.
* **Performance**: Page load speeds, backend API response times, and database query performance.
* **User Satisfaction**: Feedback from UAT participants with varying visual, auditory, and motor abilities to confirm the system supports independent learning.

---

# REFERENCES
Al-Azawei, A., Serenelli, F., & Lundqvist, K. (2017). Universal design for learning (UDL): A content analysis of peer-reviewed journal papers from 2012 to 2015. *Journal of the Scholarship of Teaching and Learning*, 17(3), 52–72.

Ally, M. (2019). *Mobile learning: Transforming the delivery of education and training* (2nd ed.). AU Press.

Anderson, T. (2008). *The theory and practice of online learning* (2nd ed.). AU Press.

Baguma, R., & Wolters, M. K. (2021). Making virtual learning environments accessible to people with disabilities in universities in Uganda. *Frontiers in Computer Science*, 3.

Burgstahler, S. (2015). *Universal design in higher education: From principles to practice*. Harvard Education Press.

Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. *MIS Quarterly*, 13(3), 319–340.

Espada-Chavarria, R., et al. (2023). Universal design for learning and instruction: Effective strategies for inclusive higher education. *Education Sciences*, 13(6).

Federal Ministry of Education. (2015). *National policy on special needs education in Nigeria*.

Federal Ministry of Education. (2023). *National digital learning policy (Final Draft 2.0)*.

Fichten, C. S., et al. (2019). Are students with disabilities “invisible” in e-learning? *Journal of Educational Technology & Society*, 22(3), 1–13.

Garrison, D. R., & Anderson, T. (2003). *E-learning in the 21st century: A framework for research and practice*. RoutledgeFalmer.

Holmes, W., Bialik, M., & Fadel, C. (2022). *Artificial intelligence in education: Promises and implications for teaching and learning*. Center for Curriculum Redesign.

Lazar, J., Goldstein, D. F., & Taylor, A. (2017). *Ensuring digital accessibility through process and policy*. Morgan Kaufmann.

Mayer, R. E. (2009). *Multimedia learning* (2nd ed.). Cambridge University Press.

Meyer, A., Rose, D. H., & Gordon, D. (2014). *Universal design for learning: Theory and practice*. CAST.

Moore, M. G. (1989). Three types of interaction. *The American Journal of Distance Education*, 3(2), 1–7.

Oliver, M. (1990). *The politics of disablement*. Macmillan.

Organisation for Economic Co-operation and Development. (2021). *OECD digital education outlook 2021*.

Seale, J. (2014). *E-learning and disability in higher education* (2nd ed.). Routledge.

Sweller, J. (2019). Cognitive load theory and educational technology. *Educational Technology Research and Development*, 67(2), 1–16.

UNESCO. (2020). *Global education monitoring report 2020: Inclusion and education*.

World Health Organization. (2011). *World report on disability*.

World Wide Web Consortium (W3C). (2018). *Web Content Accessibility Guidelines (WCAG) 2.1*.
