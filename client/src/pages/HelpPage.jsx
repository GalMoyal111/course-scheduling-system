import React, { useState } from "react";
import "./HelpPage.css";
import HelpSection from "../components/HelpSection";
import FAQAccordion from "../components/FAQAccordion";
import PageHeader from "../components/ui/PageHeader";

export default function HelpPage() {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="help-page">
      <PageHeader
        icon="school"
        title="System User Guide"
        subtitle="Your quick reference to the Smart Scheduling System"
      />

      {/* Introduction & Roles */}
      <HelpSection
        title="1. Welcome & User Roles"
        isExpanded={expandedSection === "introduction"}
        onToggle={() => toggleSection("introduction")}
      >
        <div className="section-content">
          <p>
            Welcome to the platform that intelligently manages your academic
            resources and generates optimal timetables.
          </p>

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
                manage_accounts
              </span>
              User Roles in the System
            </h4>
            <ul>
              <li>
                <strong>Standard User:</strong> Can view data, input
                information, and generate timetables.
              </li>
              <li>
                <strong>Administrator (Admin):</strong> Has extended
                permissions. Can add/delete users, change permissions, and
                manage advanced settings.
              </li>
            </ul>
          </div>
        </div>
      </HelpSection>

      {/* Login & Security */}
      <HelpSection
        title="2. Logging In & Security"
        isExpanded={expandedSection === "login"}
        onToggle={() => toggleSection("login")}
      >
        <div className="section-content">
          <p>
            Welcome to the platform that intelligently manages your academic
            resources and generates optimal timetables.
          </p>

          <div
            className="tip-box"
            style={{
              borderLeftColor: "#f59e0b",
              backgroundColor: "#fffbeb",
            }}
          >
            <span
              className="material-icons"
              style={{
                fontSize: "20px",
                color: "#f59e0b",
                marginRight: "8px",
                verticalAlign: "middle",
              }}
            >
              hourglass_top
            </span>
            <strong>Important Note:</strong> The system is hosted on a free
            server service, so the first login or first page load may take a
            little time. If login does not work immediately, wait a few moments
            and try again. Some pages may also take a few extra seconds to load
            on first access.
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
                manage_accounts
              </span>
              User Roles in the System
            </h4>

            <ul>
              <li>
                <strong>Standard User:</strong> Can view data, input
                information, and generate timetables.
              </li>

              <li>
                <strong>Administrator (Admin):</strong> Has extended
                permissions. Can add/delete users, change permissions, and
                manage advanced settings.
              </li>
            </ul>
          </div>
        </div>
      </HelpSection>

      {/* Navigation & Dashboard */}
      <HelpSection
        title="3. Navigation & Dashboard"
        isExpanded={expandedSection === "navigation"}
        onToggle={() => toggleSection("navigation")}
      >
        <div className="section-content">
          <p>
            The right-side navigation bar gives you access to all system
            modules. Clicking the system logo always returns you to the
            Dashboard.
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
                dashboard
              </span>
              Dashboard Features
            </h4>
            <p>
              The Dashboard is your main entry point and provides quick actions:
            </p>
            <ul>
              <li>
                <strong>Get Templates:</strong> Download Excel templates (with
                examples) to easily structure your data for upload.
              </li>
              <li>
                <strong>Import/Export Information:</strong> Quickly upload bulk
                data (e.g., lecturers) or download existing page data.
              </li>
              <li>
                <strong>Shortcuts:</strong> Quick links to Generate Timetable
                and View History.
              </li>
            </ul>
          </div>
        </div>
      </HelpSection>

      {/* Managing Data */}
      <HelpSection
        title="4. Managing Academic Data (Entities)"
        isExpanded={expandedSection === "data"}
        onToggle={() => toggleSection("data")}
      >
        <div className="section-content">
          <p>
            Use the side menu to navigate and manage your resources. Here is how
            to accurately fill in the details for each entity:
          </p>

          {/* Classrooms */}
          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                  color: "#667eea",
                }}
              >
                meeting_room
              </span>
              Classrooms
            </h4>
            <ul>
              <li>
                Click the <strong>Add Room</strong> button to fill in classroom
                details.
              </li>
              <li>
                <strong>Note:</strong> In the "Room Name" field, include the
                building name (e.g., P101).
              </li>
              <li>Select the classroom type from the provided list.</li>
            </ul>
          </div>

          {/* Courses */}
          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                  color: "#f093fb",
                }}
              >
                menu_book
              </span>
              Courses
            </h4>
            <ul>
              <li>
                Click <strong>Add Course</strong> and enter details (Code, Name,
                Hours).
              </li>
              <li>
                <strong>Semester/Cluster:</strong> The available options are
                taken from the values defined in the Settings page under Manage
                Clusters.
              </li>
              <li>
                <strong>Credit Calculation:</strong> The system automatically
                calculates credits based on the hours entered. To override this
                and enter credits manually, click the{" "}
                <strong>pencil icon</strong> next to the field and confirm the
                prompt.
              </li>
              <li>
                <strong>Prerequisites:</strong> This field is optional. If there
                are multiple prerequisites, enter the course code and click the
                small <strong>"+" icon</strong> to add it.
              </li>
              <li>
                <strong>Classroom Sizes:</strong> Default requirements are
                automatically loaded based on Settings. To override these
                values, click the pencil icon next to the field and confirm.
              </li>
            </ul>
          </div>

          {/* Lecturers */}
          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                  color: "#4facfe",
                }}
              >
                person
              </span>
              Lecturers
            </h4>
            <ul>
              <li>
                Click <strong>Add Lecturer</strong> and enter the name.{" "}
                <em>
                  Note: The system does not allow two lecturers with the exact
                  same name.
                </em>
              </li>
              <li>
                To change the lecturer's name after it has been added, click the{" "}
                <strong>pencil icon</strong> located to the right of their name.
              </li>
              <li>
                <strong>Managing Availability:</strong> Select a lecturer from
                the list to view their grid. Click the slots to cycle through
                states:
                <ul>
                  <li>
                    <strong style={{ color: "#10b981" }}>Green:</strong>{" "}
                    Available to teach.
                  </li>
                  <li>
                    <strong style={{ color: "#f59e0b" }}>Orange:</strong>{" "}
                    Prefers not to teach.
                  </li>
                  <li>
                    <strong style={{ color: "#ef4444" }}>Red:</strong> Cannot
                    teach at all.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Quick Action:</strong> Click the colored circles
                (Green/Orange/Red) at the top of each day to change all slots
                for that day to the selected color.
              </li>
            </ul>
            <p
              className="tip-box"
              style={{ borderLeftColor: "#ef4444", backgroundColor: "#fef2f2" }}
            >
              <strong>⚠️ Critical:</strong> You must click the{" "}
              <strong>Save Changes</strong> button to apply updates. Otherwise,
              preferences will not be saved!
            </p>
          </div>

          {/* Lessons */}
          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                  color: "#43e97b",
                }}
              >
                school
              </span>
              Lessons
            </h4>
            <ul>
              <li>
                This page connects all previous data.{" "}
                <strong>All fields are mandatory.</strong>
              </li>
              <li>
                <strong>Data Dependency:</strong> Dropdown menus only display
                data previously entered in the system (Clusters from Settings,
                Courses from Courses page, Lecturers from Lecturers page).
              </li>
              <li>
                <strong>Lesson Types:</strong> Available types for a course are
                derived directly from its definition on the Courses page.
              </li>
              <li>
                <strong>Automatic Splitting:</strong> The system does not allow
                single lesson blocks longer than 3 hours. If a 4-hour lesson is
                entered, it will be automatically split into two identical
                2-hour blocks.
              </li>
            </ul>
          </div>
        </div>
      </HelpSection>

      {/* Generating Schedule */}
      <HelpSection
        title="5. Generating the Timetable"
        isExpanded={expandedSection === "generate"}
        onToggle={() => toggleSection("generate")}
      >
        <div className="section-content">
          <p>
            Welcome to the platform that intelligently manages your academic
            resources and generates optimal timetables.
          </p>

          <div
            className="tip-box"
            style={{
              borderLeftColor: "#f59e0b",
              backgroundColor: "#fffbeb",
            }}
          >
            <span
              className="material-icons"
              style={{
                fontSize: "20px",
                color: "#f59e0b",
                marginRight: "8px",
                verticalAlign: "middle",
              }}
            >
              hourglass_top
            </span>
            <strong>Important Note:</strong> The system is hosted on a free
            server service, so the first login or first page load may take a
            little time. If login does not work immediately, wait a few moments
            and try again. Some pages may also take a few extra seconds to load
            on first access.
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
                manage_accounts
              </span>
              User Roles in the System
            </h4>

            <ul>
              <li>
                <strong>Standard User:</strong> Can view data, input
                information, and generate timetables.
              </li>

              <li>
                <strong>Administrator (Admin):</strong> Has extended
                permissions. Can add/delete users, change permissions, and
                manage advanced settings.
              </li>
            </ul>
          </div>
        </div>
      </HelpSection>

      {/* Timetable & History */}
      <HelpSection
        title="6. Viewing & Managing Schedules (Timetable & History)"
        isExpanded={expandedSection === "timetable"}
        onToggle={() => toggleSection("timetable")}
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
                calendar_month
              </span>{" "}
              Timetable View
            </h4>
            <ul>
              <li>
                <strong>Filter:</strong> View only specific clusters (e.g.,
                Semester 1).
              </li>
              <li>
                <strong>Manual Adjustments:</strong> You can manually delete a
                specific assignment directly from the scheduling screen.
              </li>
              <li>
                <strong>Save & Print:</strong> Print the generated schedule or
                save it to the database (you'll be prompted to give it a name).
              </li>
              <li>
                <strong>Excel Export:</strong> export it to Excel (a structured
                file organized by clusters for easy viewing)
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
                history
              </span>{" "}
              History Page
            </h4>
            <ul>
              <li>
                <strong>List View:</strong> Displays all previously saved
                timetables.
              </li>
              <li>
                <strong>Manage:</strong> You can edit the name of a saved
                schedule or delete it entirely.
              </li>
              <li>
                <strong>Load Timetable:</strong> Click this to open a saved
                schedule back in the main Timetable page for review or printing.
              </li>
            </ul>
          </div>
        </div>
      </HelpSection>

      {/* Settings */}
      <HelpSection
        title="7. Advanced Settings"
        isExpanded={expandedSection === "settings"}
        onToggle={() => toggleSection("settings")}
      >
        <div className="section-content">
          <p>
            The <strong>Settings</strong> page allows you to control system-wide
            configurations:
          </p>
          <ul>
            <li>
              <strong>Manage Clusters:</strong> Add or edit academic clusters
              (semesters) that group your students to prevent schedule overlaps.
            </li>
            <li>
              <strong>Default Classroom Size:</strong> Define standard capacity
              requirements for different lesson types.
            </li>
            <li>
              <strong>Global System Constraints:</strong> Set university-wide
              rules (like global break times or operational hours).
            </li>
            <li>
              <strong>User Management (Admins Only):</strong> Add new accounts,
              view the user list, or change their role (User/Admin).
            </li>
          </ul>
        </div>
      </HelpSection>

      {/* Excel Templates */}
      <HelpSection
        title="8. Excel Templates & Bulk Upload"
        isExpanded={expandedSection === "excel"}
        onToggle={() => toggleSection("excel")}
      >
        <div className="section-content">
          <p>
            The system supports bulk data upload using structured Excel files.
            Templates can be downloaded from the Dashboard using
            <strong> Get Templates</strong>.
          </p>

          {/* General Rules */}

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                  color: "#22c55e",
                }}
              >
                table_chart
              </span>
              General Upload Rules
            </h4>

            <ul>
              <li>
                Available templates:
                <strong> Lecturers, Courses, Lessons, and Classrooms.</strong>
              </li>

              <li>
                Download the desired template from
                <strong> Dashboard → Get Templates</strong>.
              </li>

              <li>Uploaded files must follow the exact template structure.</li>

              <li>
                Uploading a file will <strong>replace all existing data</strong>
                for that section.
              </li>

              <li>
                After upload, the system displays a summary report showing
                successful rows and validation errors.
              </li>

              <li>
                You can reopen the report later using the
                <strong> Latest Summary</strong> button.
              </li>
            </ul>
          </div>

          {/* Lecturers */}

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                  color: "#4facfe",
                }}
              >
                person
              </span>
              Lecturers Template
            </h4>

            <p>
              Columns:
              <strong>
                {" "}
                Name | Hard Block Day | Hard Block Hour | Prefer Not Day |
                Prefer Not Hour
              </strong>
            </p>

            <ul>
              <li>
                <strong>Name:</strong> Lecturer name.
              </li>

              <li>
                <strong>Hard Block Day / Hour:</strong> Slots in which the
                lecturer cannot teach.
              </li>

              <li>
                <strong>Prefer Not Day / Hour:</strong> Preferred unavailable
                slots.
              </li>

              <li>
                Days are represented numerically:
                <strong> 1 = Sunday ... 6 = Friday</strong>.
              </li>

              <li>Hours are represented using the system time slot numbers.</li>
            </ul>
          </div>

          {/* Courses */}

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                  color: "#f093fb",
                }}
              >
                menu_book
              </span>
              Courses Template
            </h4>

            <p>Main Columns:</p>

            <ul>
              <li>
                <strong>Course Code:</strong> Unique course identifier.
              </li>

              <li>
                <strong>Course Name:</strong> Course name.
              </li>

              <li>
                <strong>Prerequisites / Conditions:</strong> Optional
                prerequisite courses.
              </li>

              <li>
                <strong>Lecture / Tutorial / Lab / Project Hours:</strong>
                Weekly teaching hours.
              </li>

              <li>
                <strong>Credits:</strong> Course credits.
              </li>

              <li>
                <strong>Cluster Name:</strong> Must match an existing cluster
                defined in Settings.
              </li>

              <li>
                <strong>Lecture / Tutorial / Lab Number Students:</strong>
                Classroom size requirements.
              </li>

              <li>
                Empty classroom size values use the default values from
                Settings.
              </li>
            </ul>
          </div>

          {/* Lessons */}

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                  color: "#43e97b",
                }}
              >
                school
              </span>
              Lessons Template
            </h4>

            <p>
              Columns:
              <strong>
                {" "}
                Course Number | Course Name | Type | Lecturer | Semester |
                Department | Hours
              </strong>
            </p>

            <ul>
              <li>
                <strong>Course Number / Course Name:</strong>
                Must match existing courses.
              </li>

              <li>
                <strong>Type:</strong> Lesson type in Hebrew: הרצאה / תרגול /
                מעבדה.
              </li>

              <li>
                <strong>Lecturer:</strong>
                Must match an existing lecturer.
              </li>

              <li>
                <strong>Semester:</strong>
                סמסטר א / סמסטר ב
              </li>

              <li>Department and Hours are optional compatibility fields.</li>
            </ul>
          </div>

          {/* Classrooms */}

          <div className="step-box">
            <h4>
              <span
                className="material-icons"
                style={{
                  fontSize: "20px",
                  marginRight: "8px",
                  verticalAlign: "middle",
                  color: "#667eea",
                }}
              >
                meeting_room
              </span>
              Classrooms Template
            </h4>

            <p>
              Columns:
              <strong> Building | Classroom | Capacity | Type</strong>
            </p>

            <ul>
              <li>
                <strong>Building:</strong> Building name.
              </li>

              <li>
                <strong>Classroom:</strong> Classroom number or room name
                (include building identifier, e.g. M100).
              </li>

              <li>
                <strong>Capacity:</strong> Maximum number of students.
              </li>

              <li>
                <strong>Type:</strong> Classroom type: Normal, Laboratory,
                Auditorium, Networking Lab, Physics Lab.
              </li>
            </ul>
          </div>

          <div
            className="tip-box"
            style={{
              borderLeftColor: "#ef4444",
              backgroundColor: "#fef2f2",
            }}
          >
            <span
              className="material-icons"
              style={{
                fontSize: "20px",
                color: "#ef4444",
                marginRight: "8px",
                verticalAlign: "middle",
              }}
            >
              warning
            </span>
            <strong>Important:</strong> If referenced data does not already
            exist in the system (such as clusters, lecturers, or courses), the
            upload may fail.
          </div>
        </div>
      </HelpSection>

      {/* FAQ */}
      <HelpSection
        title="Frequently Asked Questions"
        isExpanded={expandedSection === "faq"}
        onToggle={() => toggleSection("faq")}
      >
        <FAQAccordion />
      </HelpSection>
    </div>
  );
}
