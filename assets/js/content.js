/*
  EDITING GUIDE
  Update the text, dates, technologies, and image paths in this file.
  The page layout and animation code live in main.js and styles.css.
*/
window.PORTFOLIO_CONTENT = {
  projects: [
    {
      id: "cell-troubleshooting",
      year: "2025 — Present",
      title: "Injection-Molding Cell Troubleshooting",
      summary: "Production support across PLC, vision, robot, sensor and pneumatic layers.",
      description: "Troubleshoot PLC-controlled injection-molding cells and downstream equipment at Axiom Group. The work follows the complete signal path—from field device and I/O through logic, HMI, robot motion and final machine response.",
      outcome: "Supported reliable production recovery, commissioning, I/O verification and controlled sequence changes in live manufacturing environments.",
      tags: ["Omron PLC", "Keyence IV2 / IV3", "Wittmann", "HMI", "EOAT"],
      points: [
        "Diagnose PLC, HMI, robot, vision, sensor and communication faults.",
        "Modify machine sequences and HMI parameters after systematic verification.",
        "Teach robot positions and support EOAT, pneumatic gripper and vacuum changes.",
        "Complete I/O checks, functional testing and production trials."
      ],
      visual: "cell"
    },
    {
      id: "vision-upgrade",
      year: "2026",
      title: "Multi-Camera Vision Inspection Upgrade",
      summary: "A complete PLC and machine-vision workflow update from logic review to validation.",
      description: "Upgraded a multi-camera inspection system by reviewing the existing PLC sequence, creating new vision programs, updating inspection-result mapping and testing the complete workflow.",
      outcome: "Completed and validated the end-to-end PLC/vision upgrade with clear result handling and reject logic.",
      tags: ["Machine vision", "PLC ladder", "Result mapping", "Inspection logic"],
      points: [
        "Analyzed existing PLC logic, sequence conditions and interlocks.",
        "Created and configured new machine-vision inspection programs.",
        "Updated camera-result mapping between the vision system and PLC.",
        "Performed end-to-end testing and troubleshooting before release."
      ],
      visual: "vision"
    },
    {
      id: "backup-manager",
      year: "2026 / V1.3",
      title: "Automation Backup Manager",
      summary: "A verifiable workflow for PLC, HMI, robot, fixture and vision-system backups.",
      description: "Defined and built a desktop tool that standardizes backup naming, folder creation, history and monthly coverage. It creates SHA-256-verified ZIP packages while preserving the original source.",
      outcome: "Turns scattered automation files into an organized, searchable and auditable maintenance workflow.",
      tags: ["Desktop tool", "SHA-256", "Traceability", "Backup workflow"],
      points: [
        "Guided package creation with consistent cell, equipment and date naming.",
        "Monthly status makes missing backups visible at a glance.",
        "Search and audit history speed up recovery of known versions.",
        "Storage views show retained versions by equipment and month."
      ],
      visual: "gallery",
      gallery: [
        { src: "assets/images/abm-1-E2D572356CE4.jpg", label: "Dashboard", title: "Monthly Dashboard", caption: "Coverage across configured cells and equipment", alt: "Automation Backup Manager monthly dashboard" },
        { src: "assets/images/abm-2-ED6D68EF2ED2.jpg", label: "New backup", title: "Guided Backup", caption: "Package a file or project folder with verification", alt: "Automation Backup Manager new backup screen" },
        { src: "assets/images/abm-3-6B7DA2CA6531.jpg", label: "Find", title: "Fast Retrieval", caption: "Filter and locate verified backups by context", alt: "Automation Backup Manager search screen" },
        { src: "assets/images/abm-4-4377E7580AB7.jpg", label: "History", title: "Audit History", caption: "Review successful, failed and interrupted operations", alt: "Automation Backup Manager audit history" },
        { src: "assets/images/abm-5-207518674770.jpg", label: "Storage", title: "Storage Overview", caption: "Understand retained versions and storage by equipment", alt: "Automation Backup Manager storage overview" }
      ]
    }
  ],
  experience: [
    {
      date: "Sep 2025 — Present",
      current: true,
      role: "Automation Technician",
      company: "Axiom Group Inc. / Aurora, ON",
      detail: "Troubleshoot PLC-controlled injection-molding cells; modify Omron PLC logic, HMI parameters and machine sequences; work with Keyence IV2/IV3 vision, Wittmann robot positions and EOAT; support commissioning, I/O verification and production trials."
    },
    {
      date: "Sep 2022 — Aug 2023",
      role: "Application Engineer",
      company: "Viraj Electromech / India",
      detail: "Developed PLC programs and HMI screens; integrated PLCs, robots, vision, servo drives, VFDs and networks; supported startup, testing and customer acceptance."
    },
    {
      date: "Aug 2021 — Aug 2022",
      role: "Service Engineer",
      company: "Viraj Electromech / India",
      detail: "Provided technical service and troubleshooting of PLC machinery using diagnostics, schematics, multimeters and oscilloscopes; supported breakdowns, maintenance, commissioning and I/O checks."
    },
    {
      date: "Nov 2020 — Aug 2021",
      role: "Panel Assembler",
      company: "Viraj Electromech / India",
      detail: "Built and wired control panels per schematics, including PLC hardware, relays, terminals and power supplies; completed wiring verification, electrical checks and functional testing."
    }
  ],
  capabilities: [
    { title: "PLC & controls", items: ["Allen-Bradley Studio 5000", "Siemens TIA Portal / S7-1200", "Omron Sysmac Studio", "CX-Programmer"] },
    { title: "Vision & robotics", items: ["Keyence IV-series systems", "Camera setup and PLC interfacing", "Wittmann robot teaching", "Sequence adjustments"] },
    { title: "Field diagnosis", items: ["PLC diagnostics and I/O", "Electrical troubleshooting", "Sensors and actuators", "Root-cause analysis"] },
    { title: "Motion & pneumatics", items: ["Servo drives and VFDs", "Automated motion systems", "Pneumatic components", "EOAT modification support"] },
    { title: "Networks & startup", items: ["EtherNet/IP", "PLC-to-equipment communications", "Equipment startup", "Production trials"] },
    { title: "Delivery & upkeep", items: ["Functional and sequence testing", "Customer acceptance support", "Preventive/corrective maintenance", "Schematics and technical manuals"] }
  ],
  education: [
    { credential: "Advanced Diploma, Electro-Mechanical Engineering Technology: Automation and Robotics", school: "Centennial College / Toronto, ON", date: "Jan 2024 — Apr 2025" },
    { credential: "Bachelor of Electrical Engineering", school: "Gujarat Technological University / India", date: "Aug 2017 — Sep 2020" },
    { credential: "Diploma in Electrical Engineering", school: "Gujarat Technological University / India", date: "Aug 2014 — Jun 2017" }
  ]
};
