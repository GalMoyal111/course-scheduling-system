import React, { useState } from "react";

export default function FAQAccordion() {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I get started with UniSched?",
      answer:
        "Start by logging in, then go to the Dashboard. From there, you can upload courses, classrooms, and lecturers. After that, create lessons and generate the timetable.",
    },
    {
      id: 2,
      question: "What file formats are supported for importing?",
      answer:
        "UniSched supports CSV, Excel (.xlsx), and JSON formats. Make sure your files have proper headers and formatting before importing.",
    },
    {
      id: 3,
      question: "Can I edit the timetable after it's generated?",
      answer:
        "Yes! You can make manual adjustments to the generated timetable. View it in the Timetable section and modify schedules as needed.",
    },
    {
      id: 4,
      question: "What should I do if the timetable generation fails?",
      answer:
        "Check that all required data is complete and accurate. Verify that lecturers are assigned to courses, classrooms have capacity, and there are no conflicting constraints.",
    },
    {
      id: 5,
      question: "Can I have multiple administrators?",
      answer:
        "Yes, administrators can create and manage other user accounts with different roles. Contact your system administrator to set up additional accounts.",
    },
    {
      id: 6,
      question: "How do I export data?",
      answer:
        "Go to the Dashboard and click the Export button. Select which data you want to export and choose your preferred format (CSV, Excel, or JSON).",
    },
    {
      id: 7,
      question: "Is there a way to backup my data?",
      answer:
        "Yes! Use the export feature on the Dashboard to create regular backups. Download your data in CSV, Excel, or JSON format.",
    },
    {
      id: 8,
      question: "What are the different user roles?",
      answer:
        "Admin: Full system access and user management. Coordinator: Can manage courses, classrooms, and lecturers. User: Can view data and export timetables.",
    },
    {
      id: 9,
      question: "How do I change my password?",
      answer:
        "Go to Settings and look for the 'Change Password' option. You'll be asked to provide your current password and then set a new one.",
    },
    {
      id: 10,
      question: "What if I forget my password?",
      answer:
        "Click the 'Forgot Password' link on the login page. You'll receive an email with instructions to reset your password.",
    },
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
