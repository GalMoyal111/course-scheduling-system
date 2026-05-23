import React, { useState } from "react";

export default function FAQAccordion() {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I format my Excel files for uploading data?",
      answer:
        "The best way is to go to the Dashboard and click 'Get Templates'. This will download properly formatted Excel files containing examples for Courses, Classrooms, Lecturers, and Lessons.",
    },
    {
      id: 2,
      question: "Can I edit a generated timetable after it's created?",
      answer:
        "Yes. In the Timetable screen, you can manually delete specific assignments. If the schedule is already saved to the database, the saved version will update automatically when you make changes.",
    },
    {
      id: 3,
      question: "What happens if the algorithm can't find a solution?",
      answer:
        "If no solution meets your 'Hard Constraints' (like unavailable lecturers), the system will notify you. Try modifying constraints, checking classroom capacities, or reducing slider priorities.",
    },
    {
      id: 4,
      question: "How do I review a schedule I generated last week?",
      answer:
        "Go to the 'History' page from the side menu. There you will see a list of all saved timetables. Click 'Load Timetable' to open it back up in the main viewing screen.",
    },
    {
      id: 5,
      question: "What is the difference between a Standard User and an Admin?",
      answer:
        "Standard Users can input data, upload files, and generate timetables. Admins have all these permissions, plus access to User Management in Settings to add, delete, or change user roles.",
    },
    {
      id: 6,
      question: "What are 'Clusters' and why do I need them?",
      answer:
        "Clusters usually represent semesters or study groups (e.g., 'Semester 1'). The algorithm uses them to ensure two courses from the same cluster are never scheduled at the same time, allowing students to attend all their classes.",
    },
    {
      id: 7,
      question: "I forgot my password. What do I do?",
      answer:
        "Click the 'Forgot Password' link on the login screen. A reset link will be sent to your email. Be sure to check your Spam or Junk folder if you don't see it in your inbox.",
    },
    {
      id: 8,
      question: "Can I rename a timetable I already saved?",
      answer:
        "Yes! Navigate to the History page. From there, you can edit the name of any saved schedule or delete it entirely to keep your workspace clean.",
    }
  ];

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="faq-accordion">
      {faqs.map((faq) => (
        <div key={faq.id} className="faq-item">
          <div
            className={`faq-question ${expandedFAQ === faq.id ? "expanded" : ""}`}
            onClick={() => toggleFAQ(faq.id)}
          >
            <span className="faq-icon">
              {expandedFAQ === faq.id ? "−" : "+"}
            </span>
            <span className="faq-text">{faq.question}</span>
          </div>
          {expandedFAQ === faq.id && (
            <div className="faq-answer">{faq.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}