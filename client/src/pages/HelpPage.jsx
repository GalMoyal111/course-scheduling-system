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
        <h1>
          <span
            className="material-icons"
            style={{
              fontSize: "48px",
              color: "#6366f1",
              marginRight: "12px",
              verticalAlign: "middle",
            }}
          >
            school
          </span>
          User Guide
        </h1>
        <p className="help-subtitle">How to Use the Smart Scheduling System</p>
      </section>

      {/* Introduction Section */}
      <HelpSection
        title="Welcome!"
        isExpanded={expandedSection === "introduction"}
        onToggle={() => toggleSection("introduction")}
      >
        <div className="section-content">
          <p>Welcome to the automatic timetable generation system!</p>
          <p>
            This system is designed to save you{" "}
            <strong>hours of manual work and frustration</strong> by creating
            the best possible schedule for students, lecturers, and college
            requirements.
          </p>
          <p>
            To let the algorithm do its magic, it needs the right input from
            you. Just follow these <strong>4 simple steps</strong>.
          </p>
        </div>
      </HelpSection>

      {/* Step 1: Login */}
      <HelpSection
        title="Step 1: Login"
        isExpanded={expandedSection === "step1"}
        onToggle={() => toggleSection("step1")}
      >
        <div className="section-content">
          <p>To get started, log in with your username and password.</p>
          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                lock
              </span>{" "}
              Why is login important?
            </h4>
            <p>
              Your login ensures that all the data you enter (lecturers,
              courses, and schedules) is securely saved in the cloud and
              available anytime, from anywhere.
            </p>
          </div>
        </div>
      </HelpSection>

      {/* Step 2: Define Clusters */}
      <HelpSection
        title="Step 2: Define Study Clusters (in Settings)"
        isExpanded={expandedSection === "step2"}
        onToggle={() => toggleSection("step2")}
      >
        <div className="section-content">
          <p>
            Before entering data, the system needs to understand how your
            students are grouped.
          </p>
          <p>
            <strong>Go to the Settings page and define your "clusters".</strong>
          </p>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                groups
              </span>{" "}
              What is a cluster?
            </h4>
            <p>A cluster is a semester number. Examples:</p>
            <ul>
              <li>"סמסטר 1"</li>
              <li>"סמסטר 2"</li>
              <li>"עיבוד אותות ורשתות תקשורת"</li>
            </ul>
          </div>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                priority_high
              </span>{" "}
              Why is this important?
            </h4>
            <p>
              The algorithm uses clusters to prevent conflicts. It will never
              schedule two courses from the same cluster at the same time, so
              students can attend both.
            </p>
          </div>
        </div>
      </HelpSection>

      {/* Step 3: Enter Data */}
      <HelpSection
        title="Step 3: Enter Data into the System"
        isExpanded={expandedSection === "step3"}
        onToggle={() => toggleSection("step3")}
      >
        <div className="section-content">
          <p>
            Now it's time to enter the information the system will use. You can
            move between the different pages using the side menu.
          </p>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                menu_book
              </span>{" "}
              Courses
            </h4>
            <p>Here you define all the courses being taught.</p>
            <p>
              <strong>For each course, enter:</strong>
            </p>
            <ul>
              <li>Course name</li>
              <li>Course code</li>
              <li>Related cluster (from Step 2)</li>
            </ul>
          </div>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                person
              </span>{" "}
              Lecturers
            </h4>
            <p>Here you add your teaching staff.</p>
            <p>
              <strong>
                The most important part of this page is the availability table.
              </strong>{" "}
              By clicking on time slots, you can define:
            </p>
            <ul>
              <li>
                <strong>Red (Hard Constraint):</strong> The lecturer absolutely
                cannot teach at this time.
              </li>
              <li>
                <strong>Orange (Soft Constraint):</strong> The lecturer prefers
                not to teach at this time (the algorithm will try to avoid it).
              </li>
            </ul>
          </div>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                meeting_room
              </span>{" "}
              Classrooms
            </h4>
            <p>These are the physical rooms on campus.</p>
            <p>
              <strong>For each classroom, define:</strong>
            </p>
            <ul>
              <li>Room name</li>
              <li>Building</li>
              <li>Capacity (number of seats)</li>
            </ul>
          </div>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                school
              </span>{" "}
              Lessons
            </h4>
            <p>This is where everything connects together!</p>
            <p>
              <strong>Here you create the actual lessons by:</strong>
            </p>
            <ul>
              <li>Choosing a course</li>
              <li>Assigning a lecturer</li>
              <li>Defining the lesson type (lecture, tutorial, lab, etc.)</li>
              <li>Setting the lesson duration (for example: 2 hours)</li>
            </ul>
          </div>

          <p className="tip-box">
            <strong>💡 Tip:</strong> If you have a lot of data, you can use the
            Excel upload option on different pages to import everything with one
            click.
          </p>
        </div>
      </HelpSection>

      {/* Step 4: Generate Timetable */}
      <HelpSection
        title="Step 4: Generate the Timetable"
        isExpanded={expandedSection === "step4"}
        onToggle={() => toggleSection("step4")}
      >
        <div className="section-content">
          <p>
            After all the data is in the system, go to the{" "}
            <strong>Generate page</strong> to run the smart algorithm.
          </p>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                calendar_month
              </span>{" "}
              1️⃣ Select Semester
            </h4>
            <p>Choose which semester you want to generate the timetable for.</p>
          </div>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                push_pin
              </span>{" "}
              2️⃣ Manual Assignments
            </h4>
            <p>
              Need a lesson to happen on Tuesday at 10:00 in a specific
              classroom? No problem. Set it here, and the algorithm will lock it
              in place and build the rest of the schedule around it.
            </p>
          </div>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                priority_high
              </span>{" "}
              3️⃣ Hard Courses
            </h4>
            <p>
              Mark courses that require high concentration, and the algorithm
              will try to place them in the early morning hours.
            </p>
          </div>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                groups
              </span>{" "}
              4️⃣ Capacity Requirements
            </h4>
            <p>
              Define how many students are expected in each lesson type
              (lecture, lab, etc.), so the system can assign suitable
              classrooms.
            </p>
          </div>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                settings
              </span>{" "}
              5️⃣ Algorithm Weights
            </h4>
            <p>Here you tell the algorithm what matters most to you.</p>
            <p>
              <strong>Move the sliders from:</strong>
            </p>
            <ul>
              <li>
                <strong>0</strong> = Ignore this rule
              </li>
              <li>
                <strong>10</strong> = Highest priority
              </li>
            </ul>
            <p>
              <strong>For example:</strong>
            </p>
            <ul>
              <li>
                Want to avoid long breaks ("windows") for lecturers? Give it a
                high weight.
              </li>
              <li>
                Want mandatory courses in the morning? Increase that slider.
              </li>
            </ul>
          </div>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                  color: "#6366f1",
                }}
              >
                rocket_launch
              </span>{" "}
              Launch!
            </h4>
            <p>
              Click the <strong>"Generate Optimal Schedule"</strong> button.
            </p>
            <p>
              The algorithm will analyze tens of thousands of possible schedules
              in seconds to minutes and present you with the best possible
              timetable!
            </p>
          </div>
        </div>
      </HelpSection>

      {/* Data Management Section */}
      <HelpSection
        title="Tips & Best Practices"
        isExpanded={expandedSection === "data-management"}
        onToggle={() => toggleSection("data-management")}
      >
        <div className="section-content">
          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                upload_file
              </span>{" "}
              Use Excel Upload for Large Datasets
            </h4>
            <p>
              If you have a lot of data (many courses, lecturers, or
              classrooms), use the Excel upload option. This saves time compared
              to entering data manually one by one.
            </p>
          </div>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                check_circle
              </span>{" "}
              Keep Data Accurate
            </h4>
            <p>
              Regularly update lecturer information, classroom details, and
              course data. Accurate data leads to better scheduling results.
            </p>
          </div>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                tune
              </span>{" "}
              Be Realistic with Constraints
            </h4>
            <p>
              Set realistic constraints and preferences. If you make every rule
              a hard constraint, the algorithm may not be able to find a valid
              schedule. Use soft constraints (orange) for preferences.
            </p>
          </div>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                save
              </span>{" "}
              Export Your Data Regularly
            </h4>
            <p>
              Use the export feature on the Dashboard to backup your data. This
              protects you if anything goes wrong.
            </p>
          </div>
        </div>
      </HelpSection>

      {/* Settings & Administration Section */}
      <HelpSection
        title="Settings & User Management"
        isExpanded={expandedSection === "settings"}
        onToggle={() => toggleSection("settings")}
      >
        <div className="section-content">
          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                lock
              </span>{" "}
              Change Your Password
            </h4>
            <p>
              In the <strong>Settings</strong> page, you can update your
              password anytime for security.
            </p>
          </div>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                category
              </span>{" "}
              Manage Study Clusters (Semesters)
            </h4>
            <p>
              In Settings, you can also add, edit, or remove the
              clusters/semesters that appear in dropdowns throughout the system.
              This is how you organize your study groups.
            </p>
          </div>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              >
                people
              </span>{" "}
              User Management (Admin Only)
            </h4>
            <p>If you're an administrator, you can:</p>
            <ul>
              <li>Create new user accounts</li>
              <li>Change user roles (Admin or User)</li>
              <li>Delete user accounts</li>
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
          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                  color: "#ef4444",
                }}
              >
                error
              </span>{" "}
              The timetable generation fails
            </h4>
            <p>
              <strong>What to do:</strong>
            </p>
            <ul>
              <li>
                Check that all required data is complete (courses, lecturers,
                classrooms, lessons)
              </li>
              <li>
                Make sure lecturers aren't blocked (unavailable) on too many
                time slots
              </li>
              <li>
                Verify classrooms have sufficient capacity for the expected
                number of students
              </li>
              <li>
                Try reducing some of the high-priority constraints or adjusting
                them to be more flexible
              </li>
            </ul>
          </div>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                  color: "#ef4444",
                }}
              >
                error
              </span>{" "}
              I can't upload my file
            </h4>
            <p>
              <strong>What to do:</strong>
            </p>
            <ul>
              <li>Make sure your file is in Excel format (.xlsx)</li>
              <li>Check that the file isn't corrupted</li>
              <li>Verify the column headers match what the system expects</li>
            </ul>
          </div>

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                  color: "#ef4444",
                }}
              >
                error
              </span>{" "}
              Can't log in
            </h4>
            <p>
              <strong>What to do:</strong>
            </p>
            <ul>
              <li>Verify your email and password are correct</li>
              <li>
                Ask your administrator to confirm your account was created
              </li>
              <li>Use the "Forgot Password" option to reset your password</li>
            </ul>
          </div>
        </div>
      </HelpSection>

      {/* Best Practices Section */}
      <HelpSection
        title="Key Takeaways"
        isExpanded={expandedSection === "best-practices"}
        onToggle={() => toggleSection("best-practices")}
      >
        <div className="section-content">
          <div className="best-practice-list">
            <div className="practice-item">
              <h4>
                <span
                  className="material-icons"
                  style={{
                    fontSize: "24px",
                    marginRight: "8px",
                    verticalAlign: "middle",
                    color: "#10b981",
                  }}
                >
                  lightbulb
                </span>{" "}
                The algorithm is smart, but needs good input
              </h4>
              <p>
                Garbage in, garbage out. Make sure all your data (courses,
                lecturers, classrooms, lessons) is complete and accurate.
              </p>
            </div>

            <div className="practice-item">
              <h4>
                <span
                  className="material-icons"
                  style={{
                    fontSize: "24px",
                    marginRight: "8px",
                    verticalAlign: "middle",
                    color: "#10b981",
                  }}
                >
                  balance
                </span>{" "}
                Balance is key when setting priorities
              </h4>
              <p>
                Not all constraints are equally important. Mix high and low
                values to let the algorithm make smart trade-offs.
              </p>
            </div>

            <div className="practice-item">
              <h4>
                <span
                  className="material-icons"
                  style={{
                    fontSize: "24px",
                    marginRight: "8px",
                    verticalAlign: "middle",
                    color: "#10b981",
                  }}
                >
                  handshake
                </span>{" "}
                Soft constraints are your friend
              </h4>
              <p>
                Use orange (soft constraints) for preferences. Hard constraints
                (red) should only be for things that are absolutely impossible.
              </p>
            </div>

            <div className="practice-item">
              <h4>
                <span
                  className="material-icons"
                  style={{
                    fontSize: "24px",
                    marginRight: "8px",
                    verticalAlign: "middle",
                    color: "#10b981",
                  }}
                >
                  preview
                </span>{" "}
                Review before you publish
              </h4>
              <p>
                Always review the generated timetable before sharing it. Look
                for any issues and make manual adjustments if needed.
              </p>
            </div>

            <div className="practice-item">
              <h4>
                <span
                  className="material-icons"
                  style={{
                    fontSize: "24px",
                    marginRight: "8px",
                    verticalAlign: "middle",
                    color: "#10b981",
                  }}
                >
                  backup
                </span>{" "}
                Backup your data
              </h4>
              <p>
                Use the export feature regularly to save your schedules as
                backup files.
              </p>
            </div>
          </div>
        </div>
      </HelpSection>

      {/* Contact & Support Section */}
      <HelpSection
        title="Need Help?"
        isExpanded={expandedSection === "contact"}
        onToggle={() => toggleSection("contact")}
      >
        <div className="section-content">
          <p>
            If you encounter any issues or have questions not answered in this
            guide, contact your system administrator.
          </p>
          <p>
            They can help you with technical issues, account problems, or
            questions about your institution's specific setup.
          </p>
        </div>
      </HelpSection>
    </div>
  );
}
