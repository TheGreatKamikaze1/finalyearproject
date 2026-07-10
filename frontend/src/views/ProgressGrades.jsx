import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAccessibility } from '../context/AccessibilityContext';
import { ArrowLeft, Award, BookCheck, ClipboardList, Star } from 'lucide-react';

function ProgressGrades({ user, navigateTo }) {
  const { preferences } = useAccessibility();
  const [courses, setCourses] = useState([]);
  const [materialsProgress, setMaterialsProgress] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const mode = preferences.accessibility_mode || 'standard';

  useEffect(() => {
    async function loadProgressDetails() {
      try {
        setLoading(true);
        const [enrolledCourses, myProgress, results] = await Promise.all([
          api('/courses/enrolled'),
          api('/progress/me'),
          api('/quizzes/results/me')
        ]);

        // Fetch materials and quizzes for each enrolled course to calculate real progress and quiz details
        const coursesWithDetails = await Promise.all(
          enrolledCourses.map(async (course) => {
            try {
              const [materials, quizzes] = await Promise.all([
                api(`/courses/${course.id}/materials`),
                api(`/courses/${course.id}/quizzes`)
              ]);
              return { ...course, materials, quizzes };
            } catch (err) {
              console.error(`Failed to load details for course ${course.id}:`, err);
              return { ...course, materials: [], quizzes: [] };
            }
          })
        );

        setCourses(coursesWithDetails);
        setMaterialsProgress(myProgress);
        setQuizResults(results);
      } catch (err) {
        console.error("Failed to load progress details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProgressDetails();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <div style={{ border: '4px solid var(--line)', borderTop: '4px solid var(--brand)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
        <p style={{ color: 'var(--muted)' }}>Retrieving your academic transcript...</p>
      </div>
    );
  }

  // Calculate course lesson completions
  const completedLessonsMap = {};
  materialsProgress.forEach(p => {
    if (p.status === 'completed') {
      completedLessonsMap[p.material_id] = true;
    }
  });

  // Map quiz results to their details
  const quizMap = {};
  courses.forEach(course => {
    course.quizzes?.forEach(quiz => {
      quizMap[quiz.id] = {
        title: quiz.title,
        courseCode: course.course_code || 'GEN-101'
      };
    });
  });

  return (
    <div className="main-content" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigateTo('dashboard')} 
          className="btn btn-secondary btn-sm"
          aria-label="Back to dashboard screen"
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>
        <h1 style={{ fontSize: '2.2rem', margin: 0 }}>Progress & Grades</h1>
      </header>

      {/* SECTION 1: COURSE COMPLETION DETAILS */}
      <section aria-labelledby="course-progress-header" style={{ marginBottom: '3rem' }}>
        <h2 id="course-progress-header" style={{ fontSize: '1.4rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookCheck size={22} style={{ color: 'var(--brand)' }} />
          <span>Lesson Completion Progress</span>
        </h2>

        {courses.length === 0 ? (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
            You are not enrolled in any courses yet.
          </div>
        ) : (
          <div className="glass-card p-4" style={{ background: '#fff', overflowX: 'auto' }}>
            <table className="a11y-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '550px' }}>
              <caption style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
                A list of enrolled courses with course code, title, completed lessons, total lessons, and progress percentage.
              </caption>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                  <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Course Code</th>
                  <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Course Title</th>
                  <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Completed Lessons</th>
                  <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Total Lessons</th>
                  <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Progress (%)</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => {
                  const courseMaterials = course.materials || [];
                  const totalLessonsCount = courseMaterials.length;
                  const completedLessonsInCourse = courseMaterials.filter(m => completedLessonsMap[m.id]).length;
                  const completionPercentage = totalLessonsCount > 0 ? Math.round((completedLessonsInCourse / totalLessonsCount) * 100) : 0;

                  return (
                    <tr key={course.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <th scope="row" style={{ padding: '1rem', fontWeight: 800, textAlign: 'left' }}>
                        {course.course_code || 'GEN-101'}
                      </th>
                      <td style={{ padding: '1rem' }}>{course.title}</td>
                      <td style={{ padding: '1rem' }}>{completedLessonsInCourse} lessons</td>
                      <td style={{ padding: '1rem' }}>{totalLessonsCount} lessons</td>
                      <td style={{ padding: '1rem', fontWeight: 900, color: 'var(--brand)' }}>
                        {completionPercentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* SECTION 2: QUIZ GRADES TRANSCRIPT */}
      <section aria-labelledby="quiz-grades-header">
        <h2 id="quiz-grades-header" style={{ fontSize: '1.4rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardList size={22} style={{ color: 'var(--accent)' }} />
          <span>Quiz Transcripts & Grades</span>
        </h2>

        {quizResults.length === 0 ? (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
            No quizzes completed yet.
          </div>
        ) : (
          <div className="glass-card p-4" style={{ background: '#fff', overflowX: 'auto' }}>
            <table className="a11y-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '550px' }}>
              <caption style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
                A transcript of completed quizzes, including course code, quiz title, completion date, total questions, score percentage, and status.
              </caption>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                  <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Course</th>
                  <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Quiz Title</th>
                  <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Completion Date</th>
                  <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Total Questions</th>
                  <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Grade Score</th>
                  <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {quizResults.map(res => {
                  const quizInfo = quizMap[res.quiz_id] || { title: 'Assessment Quiz', courseCode: 'GEN-101' };
                  const percentScore = Math.round(res.score * 10) / 10;
                  const isPass = percentScore >= 50.0;
                  
                  return (
                    <tr key={res.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <th scope="row" style={{ padding: '1rem', fontWeight: 800, textAlign: 'left' }}>{quizInfo.courseCode}</th>
                      <td style={{ padding: '1rem' }}>{quizInfo.title}</td>
                      <td style={{ padding: '1rem' }}>{new Date(res.completed_at).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>{res.total_questions} questions</td>
                      <td style={{ padding: '1rem', fontWeight: 900, color: isPass ? 'var(--success)' : 'var(--accent)' }}>
                        {percentScore}%
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span 
                          className={`badge-a11y-pill`} 
                          style={{ 
                            margin: 0, 
                            display: 'inline-block',
                            background: isPass ? 'var(--success-light)' : 'var(--accent-light)', 
                            color: isPass ? 'var(--success)' : 'var(--accent)', 
                            borderColor: isPass ? 'var(--success)' : 'var(--accent)', 
                            borderWidth: '1px', 
                            borderStyle: 'solid',
                            fontWeight: 800
                          }}
                        >
                          {isPass ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default ProgressGrades;
