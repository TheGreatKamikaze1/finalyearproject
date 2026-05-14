# Supervisor Demo Guide

Project title: **Design and Implementation of an E-Learning Platform for Students with Disabilities**

## What To Show

1. Register as an instructor.
2. Open the instructor studio.
3. Click **Create demo course**.
4. Show that the course is published and has multiple learning materials.
5. Register as a student in another browser/session.
6. Show the student dashboard, accessibility controls, and published course catalog.
7. Enroll in the demo course.
8. Open a text lesson and use **Read aloud**.
9. Mark a material as in progress or completed.
10. Show that accessibility preferences are saved to the user profile.

## Features Already Implemented

- User registration and login with JWT authentication.
- Roles for students, instructors, and admins.
- Course creation, publishing, preview, and deletion support in the backend.
- Instructor material creation for text, PDF, audio, and video resources.
- Captions, transcripts, and audio-description metadata for materials.
- Student enrollment into published courses.
- Student progress tracking for course materials.
- Accessibility profile with font scaling, contrast modes, reduced motion, text-to-speech preference, and dyslexia-friendly reading mode.
- Railway deployment with Postgres database support and `/healthz` monitoring.

## Defense Angle

The main contribution is not only an e-learning site. It is an accessible e-learning workflow where disabled students can personalize reading conditions, access alternative media formats, and track progress, while instructors can publish materials with accessibility metadata.
