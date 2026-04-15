import React, { useState } from "react";
import "./HelpPage.css";
import HelpSection from "../components/HelpSection";
import FAQAccordion from "../components/FAQAccordion";

export default function HelpPage() {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="help-page">
      {/* Header */}
      <section className="help-header">
        <h1>Help & Information</h1>
        <p className="help-subtitle">
          Learn how to use UniSched and make the most of the course scheduling system
        </p>
      </section>

      {/* Getting Started Section */}
      <HelpSection
        title="Getting Started"
        isExpanded={expandedSection === "getting-started"}
        onToggle={() => toggleSection("getting-started")}
      >
        <div className="section-content">
          <h3>Welcome to UniSched</h3>
          <p>
            UniSched is a comprehensive course scheduling system designed to help manage and organize academic courses, classrooms, lecturers, and lessons efficiently.
          </p>

          <h4>First Steps</h4>
          <ol>
            <li><strong>Log In:</strong> Access the system using your credentials</li>
            <li><strong>Navigate to Dashboard:</strong> View an overview of all your data</li>
            <li><strong>Upload Your Data:</strong> Start by uploading courses, classrooms, and lecturers</li>
            <li><strong>Create Lessons:</strong> Define lessons and assign them to courses</li>
            <li><strong>Generate Timetable:</strong> Use the system to generate an optimized schedule</li>
          </ol>

          <p className="tip-box">
            <strong>💡 Tip:</strong> Make sure all your data is complete and accurate before generating the timetable.
          </p>
        </div>
      </HelpSection>

      {/* Main Features Section */}
      <HelpSection
        title="Main Features"
        isExpanded={expandedSection === "main-features"}
        onToggle={() => toggleSection("main-features")}
      >
        <div className="section-content">
          <div className="feature-grid">
            {/* Dashboard */}
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h4>Dashboard</h4>
              <p>
                Get an overview of your system with statistics on courses, classrooms, lecturers, and lessons.
                Quick access to import/export functionality.
              </p>
            </div>

            {/* Courses */}
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h4>Courses</h4>
              <p>
                Upload and manage courses. Add course details and organize them for scheduling.
              </p>
            </div>

            {/* Classrooms */}
            <div className="feature-card">
              <div className="feature-icon">🏢</div>
              <h4>Classrooms</h4>
              <p>
                Define available classrooms with capacity information. Essential for course scheduling.
              </p>
            </div>

            {/* Lecturers */}
            <div className="feature-card">
              <div className="feature-icon">👨‍🏫</div>
              <h4>Lecturers</h4>
              <p>
                Manage lecturer profiles and assign them to courses. Track lecturer availability and workload.
              </p>
            </div>

            {/* Lessons */}
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h4>Lessons</h4>
              <p>
                Create and define lessons for each course. Specify lesson type, duration, and requirements.
              </p>
            </div>

            {/* Timetable */}
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h4>Timetable</h4>
              <p>
                View and manage the generated timetable. See all scheduled classes with their assigned classrooms and lecturers.
              </p>
            </div>
          </div>
        </div>
      </HelpSection>

      {/* How to Use Guide Section */}
      <HelpSection
        title="How to Use the System"
        isExpanded={expandedSection === "how-to-use"}
        onToggle={() => toggleSection("how-to-use")}
      >
        <div className="section-content">
          <h3>Step-by-Step Guide</h3>

          <h4>1. Upload Courses</h4>
          <div className="step-box">
            <p>
              Navigate to the <strong>Courses</strong> section from the sidebar. You can:
            </p>
            <ul>
              <li>Upload courses from a file (CSV, Excel, or JSON)</li>
              <li>Add individual courses manually using the add button</li>
              <li>Edit existing courses</li>
              <li>Delete courses that are no longer needed</li>
            </ul>
            <p className="tip-box">
              <strong>💡 Tip:</strong> Use the import feature for bulk uploads to save time.
            </p>
          </div>

          <h4>2. Upload Classrooms</h4>
          <div className="step-box">
            <p>
              Go to <strong>Classrooms</strong> and:
            </p>
            <ul>
              <li>Add classroom information (name, capacity, location)</li>
              <li>Specify any special features or equipment (projector, lab equipment, etc.)</li>
              <li>Upload multiple classrooms at once</li>
            </ul>
          </div>

          <h4>3. Add Lecturers</h4>
          <div className="step-box">
            <p>
              In the <strong>Lecturers</strong> section:
            </p>
            <ul>
              <li>Register all lecturers in the system</li>
              <li>Assign lecturers to courses</li>
              <li>Define lecturer availability if needed</li>
              <li>Manage lecturer preferences</li>
            </ul>
          </div>

          <h4>4. Create Lessons</h4>
          <div className="step-box">
            <p>
              Navigate to <strong>Lessons</strong> and:
            </p>
            <ul>
              <li>Create lessons for each course</li>
              <li>Specify lesson type (lecture, tutorial, lab, etc.)</li>
              <li>Set duration (in hours)</li>
              <li>Define which lecturer teaches the lesson</li>
              <li>Upload multiple lessons at once</li>
            </ul>
          </div>

          <h4>5. Generate Timetable</h4>
          <div className="step-box">
            <p>
              Once all data is entered, go to <strong>Generate</strong> to:
            </p>
            <ul>
              <li>Create an optimized schedule automatically</li>
              <li>The system avoids conflicts and respects constraints</li>
              <li>Review the generated timetable</li>
              <li>Make manual adjustments if needed</li>
            </ul>
            <p className="tip-box">
              <strong>💡 Tip:</strong> Ensure all required fields are filled before generating the timetable.
            </p>
          </div>

          <h4>6. View & Export Timetable</h4>
          <div className="step-box">
            <p>
              Access the <strong>Timetable</strong> section to:
            </p>
            <ul>
              <li>View the complete schedule</li>
              <li>Filter by course, lecturer, or classroom</li>
              <li>Export the timetable to various formats</li>
              <li>Print the schedule</li>
            </ul>
          </div>
        </div>
      </HelpSection>

      {/* Data Management Section */}
      <HelpSection
        title="Data Management"
        isExpanded={expandedSection === "data-management"}
        onToggle={() => toggleSection("data-management")}
      >
        <div className="section-content">
          <h3>Importing & Exporting Data</h3>

          <div className="step-box">
            <h4>Importing Data</h4>
            <p>You can import data from your files:</p>
            <ul>
              <li>Go to <strong>Dashboard</strong> and click the Import button</li>
              <li>Select your file (CSV, Excel, or JSON format)</li>
              <li>Map columns to the appropriate fields</li>
              <li>Review and confirm the import</li>
            </ul>
          </div>

          <div className="step-box">
            <h4>Exporting Data</h4>
            <p>Export your data for backup or external use:</p>
            <ul>
              <li>Use the Export button on the Dashboard</li>
              <li>Select which data to export (courses, lecturers, etc.)</li>
              <li>Choose your preferred format</li>
              <li>Download the file</li>
            </ul>
          </div>

          <div className="step-box">
            <h4>File Format Guidelines</h4>
            <p>Supported formats:</p>
            <ul>
              <li><strong>CSV:</strong> Comma-separated values for easy spreadsheet import</li>
              <li><strong>Excel:</strong> .xlsx files with proper formatting</li>
              <li><strong>JSON:</strong> Structured data format for advanced users</li>
            </ul>
          </div>
        </div>
      </HelpSection>

      {/* Settings & Administration Section */}
      <HelpSection
        title="Settings & Administration"
        isExpanded={expandedSection === "settings"}
        onToggle={() => toggleSection("settings")}
      >
        <div className="section-content">
          <h3>System Settings</h3>

          <div className="step-box">
            <h4>Account Management</h4>
            <p>In <strong>Settings</strong>, you can:</p>
            <ul>
              <li>Change your password</li>
              <li>Update your profile information</li>
              <li>View your account details</li>
            </ul>
          </div>

          <div className="step-box">
            <h4>User Roles (Admin Only)</h4>
            <p>Administrators can manage user access:</p>
            <ul>
              <li><strong>Admin:</strong> Full system access and user management</li>
              <li><strong>Coordinator:</strong> Can manage courses, classrooms, and lecturers</li>
              <li><strong>User:</strong> Can view data and export timetables</li>
            </ul>
          </div>

          <div className="step-box">
            <h4>User Management</h4>
            <p>Administrators can:</p>
            <ul>
              <li>Create new user accounts</li>
              <li>Assign roles and permissions</li>
              <li>Modify user settings</li>
              <li>Delete inactive accounts</li>
            </ul>
          </div>
        </div>
      </HelpSection>

      {/* Frequently Asked Questions Section */}
      <HelpSection
        title="Frequently Asked Questions"
        isExpanded={expandedSection === "faq"}
        onToggle={() => toggleSection("faq")}
      >
        <FAQAccordion />
      </HelpSection>

      {/* Troubleshooting Section */}
      <HelpSection
        title="Troubleshooting"
        isExpanded={expandedSection === "troubleshooting"}
        onToggle={() => toggleSection("troubleshooting")}
      >
        <div className="section-content">
          <h3>Common Issues & Solutions</h3>

          <div className="step-box">
            <h4>❌ Cannot log in</h4>
            <ul>
              <li>Check your email and password are correct</li>
              <li>Ensure your account has been created by an administrator</li>
              <li>Try resetting your password using the "Forgot Password" option</li>
              <li>Clear your browser cache and cookies</li>
            </ul>
          </div>

          <div className="step-box">
            <h4>❌ Import file not recognized</h4>
            <ul>
              <li>Verify the file format is supported (CSV, Excel, or JSON)</li>
              <li>Check that column headers match the required format</li>
              <li>Ensure the file is not corrupted</li>
              <li>Try re-saving the file in the correct format</li>
            </ul>
          </div>

          <div className="step-box">
            <h4>❌ Timetable generation fails</h4>
            <ul>
              <li>Ensure all required data is complete (courses, lecturers, classrooms, lessons)</li>
              <li>Check for conflicting constraints</li>
              <li>Verify that lecturers are assigned to courses</li>
              <li>Ensure classrooms have sufficient capacity</li>
            </ul>
          </div>

          <div className="step-box">
            <h4>❌ Scheduling conflicts or errors</h4>
            <ul>
              <li>Review lecturer availability and workload</li>
              <li>Check classroom capacity against class sizes</li>
              <li>Verify that all lessons are properly configured</li>
              <li>Consider adjusting constraints or preferences</li>
            </ul>
          </div>

          <div className="step-box">
            <h4>❌ Performance issues or slow loading</h4>
            <ul>
              <li>Reduce the amount of data or filter results</li>
              <li>Clear browser cache</li>
              <li>Try using a different browser</li>
              <li>Check your internet connection</li>
            </ul>
          </div>
        </div>
      </HelpSection>

      {/* Best Practices Section */}
      <HelpSection
        title="Best Practices"
        isExpanded={expandedSection === "best-practices"}
        onToggle={() => toggleSection("best-practices")}
      >
        <div className="section-content">
          <h3>Tips for Optimal Usage</h3>

          <div className="best-practice-list">
            <div className="practice-item">
              <h4>🎯 Keep Data Accurate</h4>
              <p>
                Regularly update lecturer information, classroom details, and course data. Accurate data leads to better scheduling.
              </p>
            </div>

            <div className="practice-item">
              <h4>📋 Plan Ahead</h4>
              <p>
                Prepare all your data before generating the timetable. Have courses, classrooms, and lecturers ready.
              </p>
            </div>

            <div className="practice-item">
              <h4>💾 Regular Backups</h4>
              <p>
                Export your data regularly as a backup. Use the export feature to save your schedules.
              </p>
            </div>

            <div className="practice-item">
              <h4>🔍 Review Schedules</h4>
              <p>
                Always review the generated timetable for any issues before publishing. Make manual adjustments if needed.
              </p>
            </div>

            <div className="practice-item">
              <h4>⚙️ Optimize Constraints</h4>
              <p>
                Set realistic constraints and preferences to help the algorithm generate better schedules.
              </p>
            </div>

            <div className="practice-item">
              <h4>👥 Communicate Changes</h4>
              <p>
                Keep stakeholders informed about schedule changes and system updates.
              </p>
            </div>
          </div>
        </div>
      </HelpSection>

      {/* Contact & Support Section */}
      <HelpSection
        title="Contact & Support"
        isExpanded={expandedSection === "contact"}
        onToggle={() => toggleSection("contact")}
      >
        <div className="section-content">
          <h3>Need Help?</h3>

          <div className="support-box">
            <p>
              If you encounter any issues or have questions not answered in this help guide:
            </p>
            <ul>
              <li><strong>📧 Email Support:</strong> Contact your system administrator</li>
              <li><strong>📞 Phone:</strong> Reach out to your IT department</li>
              <li><strong>🆘 Emergency Issues:</strong> Report critical issues immediately</li>
            </ul>
          </div>

          <div className="info-box">
            <p>
              <strong>System Information:</strong> UniSched v1.0 - Course Scheduling System
            </p>
          </div>
        </div>
      </HelpSection>
    </div>
  );
}
