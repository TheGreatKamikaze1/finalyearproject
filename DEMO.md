# Supervisor Demo Guide

Project title: **Design and Implementation of an E-Learning Platform for Students with Disabilities**

## What To Show

1. Register as an instructor. The app takes instructors directly to the **Instructor studio**.
2. Click **Create demo course**.
3. Show the course-management area: course count, published/draft status, selected course materials, and publish controls.
4. Register as a student in another browser/session. The app takes students to the **Learning dashboard**.
5. Show the dashboard sections: **My learning**, **Course catalog**, and **Accessibility tools**.
6. Enroll in the demo course from the catalog.
7. Open the course and show the text lesson, audio resource, and progress actions.
8. Use **Read aloud** on a text lesson.
9. Mark a material as in progress or completed.
10. Change contrast, text size, reduced motion, and dyslexia-friendly reading mode to show disability-focused personalization.

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
