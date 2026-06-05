import { Post, Professor, PlacementExperience, InternshipExperience, SurvivalTip } from '../types';

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    title: 'How I got placed in a product company (12 LPA) from the IT Department',
    authorRole: 'Senior',
    content: 'Writing this to help my IT, CSE, and AIML junior cohorts. The autonomous REC syllabus is decent, but you ABSOLUTELY need to look outside. \n\n1. For online assessments (OA), don\'t just rely on standard syllabus dsa. Spend at least 3 months solving LeetCode (especially Array, Hashing, Two Pointers, and BFS/DFS). \n2. Zoho and Kaar Technologies recruit heavily here. For Zoho, practice nested loop printing (Z-pattern, numbers) - they love asking these in round 1. \n3. Project work: If you do standard web development, make sure you query-optimize and secure your APIs. The internal panels look at Github commits if you showcase them well in reviews. \n4. Maintain a 8.0+ CGPA. Some product companies have high eligibility cutoffs (8.2+ or even 8.5+ with no history of backlogs). Don\'t let simple internal tests (CAT exams) ruin this. CAT papers in IT are usually standard - review previous semester question patterns.',
    department: 'IT',
    category: 'discussion',
    upvotes: 42,
    commentsCount: 3,
    authorName: 'Sanjay S',
    isAnonymous: false,
    createdAt: '2026-05-28T09:00:00Z',
    tags: ['Placement', 'Zoho', 'CodingTips', 'SyllabusHack'],
    comments: [
      {
        id: 'c-1',
        authorName: 'Anand_K',
        isAnonymous: false,
        content: 'Thanks Sanjay! Does Zoho ask DP in first rounds? ',
        createdAt: '2026-05-28T10:30:00Z',
        upvotes: 8
      },
      {
        id: 'c-2',
        authorName: 'RECian_2025',
        isAnonymous: true,
        content: 'Usually Zoho stick to heavy syntax, loops and basic DS for level 1 & 2. Great comprehensive guide!',
        createdAt: '2026-05-28T11:15:00Z',
        upvotes: 12
      },
      {
        id: 'c-3',
        authorName: 'Sanjay S',
        isAnonymous: false,
        content: '@Anand_K No, standard backtracking or basic arrays, recursion is most they go. Focus on clean code formulation!',
        createdAt: '2026-05-28T12:00:00Z',
        upvotes: 5
      }
    ]
  },
  {
    id: 'post-2',
    title: 'Review: Which Professional Electives in Semester 5 are actually friendly?',
    authorRole: 'Alumni',
    content: 'Seniors let\'s compile professional elective experience for CSE & AIDS. \n\n- **Cloud Computing**: Extremely simple score-wise. The practical labs are straightforward (mostly AWS Free Tier setups and basic virtualization). Easy "O" or "A+" grade if you write key definitions and sample architecture diagrams in CAT exams. \n- **Modern Web Development**: Highly practical. If you already have some React knowledge, this is a breeze since the lab exercises can be finished in 2 classes. Highly recommended over heavy theoretical electives. \n- **Compiler Design / Theory of Computation**: NOT an easy elective. Unless you really want to go for higher studies (GATE preparation), avoid this as a casual elective. The syllabus has heavy mathematical derivations and proofs.',
    department: 'CSE',
    category: 'elective',
    upvotes: 38,
    commentsCount: 2,
    authorName: 'Deepak Raj',
    isAnonymous: false,
    createdAt: '2026-05-30T14:20:00Z',
    tags: ['Electives', 'Syllabus', 'CATExam', 'Grading'],
    comments: [
      {
        id: 'c-4',
        authorName: 'Anonymous_User',
        isAnonymous: true,
        content: 'Deepak is spot on. Cloud Computing with AWS is a GPA lifesaver.',
        createdAt: '2026-05-30T16:00:00Z',
        upvotes: 14
      },
      {
        id: 'c-5',
        authorName: 'Vigneshwaran',
        isAnonymous: false,
        content: 'For AIDS, cognitive science is also super light but lectures can be dry.',
        createdAt: '2026-05-31T02:10:00Z',
        upvotes: 6
      }
    ]
  },
  {
    id: 'post-3',
    title: 'Survival hacks for CAT exams (Continuous Assessment Tests) at REC',
    authorRole: 'Faculty',
    content: 'We all know REC is strict about attendance and CAT marks. Here are a few unwritten cheat-sheets for CATs to keep your internal marks above 45/50:\n\n1. **The 2-Year Rule**: 80% of CAT questions are copy-pasted directly from internal question banks of the past 2 years. Go to the department library or ask your class representatives (CR) for the previous year question papers. \n2. **Formatting is 50% of the game**: Internal evaluators have about 60 papers to grade in a couple of hours. Clear, highlighted formulas, neat block diagrams, and bulleted takeaways get 9/10 even if your derivation steps are slightly off-track. Avoid writing giant blocks of text. \n3. **Lab Records**: ALWAYS get your lab records signed on time. If you miss the timeline, the lab assistants will deduct direct internal marks, which is incredibly difficult to recover. No amount of pleading will change it once it is entered into the portal!',
    department: 'general',
    category: 'notes',
    upvotes: 56,
    commentsCount: 2,
    authorName: 'REC Guru',
    isAnonymous: true,
    createdAt: '2026-06-01T08:45:00Z',
    tags: ['CATExams', 'Internals', 'Hacks', 'SurvivalGuide'],
    comments: [
      {
        id: 'c-6',
        authorName: 'Preetha_M',
        isAnonymous: false,
        content: 'The 2-year question paper hack is gold. Saved me in CSE 3rd sem math paper.',
        createdAt: '2026-06-01T10:00:00Z',
        upvotes: 9
      },
      {
        id: 'c-7',
        authorName: 'Mech_Boy_REC',
        isAnonymous: true,
        content: 'For Mech students, standard thermal engineering textbook solved problems are exact CAT questions. Just memorize the formulas!',
        createdAt: '2026-06-01T11:45:00Z',
        upvotes: 11
      }
    ]
  },
  {
    id: 'post-4',
    title: 'A-Block vs M-Block Wi-Fi Speeds and Access Hacks',
    authorRole: 'Student',
    content: 'If you need high-speed connection for downloading reference projects, the Central Library reading room has the fastest uncapped REC-Student Wi-Fi. It usually is twice as fast as the classroom APs in M-Block and A-Block. Connect via your college mail ID. In case it doesn\'t authenticate, try clearing your browser cookies or use the workspace desktop inside library labs.',
    department: 'IT',
    category: 'announcement',
    upvotes: 27,
    commentsCount: 1,
    authorName: 'Wifi_Seeker',
    isAnonymous: true,
    createdAt: '2026-06-02T16:10:00Z',
    tags: ['Wifi', 'CampusLife', 'Library', 'Hacks'],
    comments: [
      {
        id: 'c-8',
        authorName: 'Suresh_K',
        isAnonymous: false,
        content: 'Library wi-fi works excellent after 3:15 PM when most buses leave. Good tip!',
        createdAt: '2026-06-03T01:30:00Z',
        upvotes: 4
      }
    ]
  },
  {
    id: 'post-5',
    title: 'Ultimate Guide to Robotics & Autonomous Systems Main Labs',
    authorRole: 'Senior',
    content: 'For Robotics and Mechanical students entering Semester 4/5: The CNC and Mechatronics labs are very strict with dress code. They will send you back to hostel or make you stand outside for standard sports shoes or unshaven beards. Always keep a backup formal shoe in your locker if you are a commuter! On the brighter side, the lab equipment is state-of-the-art; make a good impression on the lab-in-charge to get projects approved for the internal paper presentations.',
    department: 'Robotics',
    category: 'discussion',
    upvotes: 31,
    commentsCount: 0,
    authorName: 'AutomationGuy',
    isAnonymous: true,
    createdAt: '2026-06-03T08:30:00Z',
    tags: ['Lab', 'DressCode', 'Robotics', 'Hacks'],
    comments: []
  },
  {
    id: 'post-q1',
    title: 'Can we get an OD (On-Duty) approval for attending external college hackathons?',
    authorRole: 'Student',
    content: 'My team is planning to attend a national-level hackathon at IIT Madras next month. Does anyone know the procedure for getting OD? Will the CSE HOD approve it smoothly or do they ask for endless registration signatures first?',
    department: 'CSE',
    category: 'Question',
    upvotes: 18,
    commentsCount: 2,
    authorName: 'HackerREC',
    isAnonymous: true,
    createdAt: '2026-06-04T10:00:00Z',
    tags: ['ODApproval', 'Hackathon', 'Hacks', 'CSE'],
    comments: [
      {
        id: 'c-q1-1',
        authorName: 'Senior_Dev_REC',
        isAnonymous: false,
        content: 'CSE department is relatively supportive of IIT hackathons! Step 1: Get the official invite printout. Step 2: Pitch to your Class Advisor first, then they will forward it. Do not go directly to the HOD. Having a working prototype helps a lot.',
        createdAt: '2026-06-04T11:30:00Z',
        upvotes: 7
      },
      {
        id: 'c-q1-2',
        authorName: 'Anonymous Student',
        isAnonymous: true,
        content: 'It takes about 3 working days, so submit the request at least a week before. If you get selected, write a small email report afterwards to secure OD post-facto as well.',
        createdAt: '2026-06-04T12:15:00Z',
        upvotes: 4
      }
    ]
  },
  {
    id: 'post-q2',
    title: 'How strict is autonomous math exam corrections compared to university papers?',
    authorRole: 'Senior',
    content: 'I have heard mixed rumors. Some say autonomous corrections are fully chill and class teachers can add buffer marks, while others say the external double-evaluations are even harsher. Can anyone who cleared arrears in 2025 shed some real light here?',
    department: 'general',
    category: 'Question',
    upvotes: 32,
    commentsCount: 1,
    authorName: 'MathSufferer',
    isAnonymous: true,
    createdAt: '2026-06-04T15:30:00Z',
    tags: ['Exams', 'Corrections', 'Autonomous', 'Hacks'],
    comments: [
      {
        id: 'c-q2-1',
        authorName: 'AlumGrad_2025',
        isAnonymous: false,
        content: 'It is a double valuation system! Your exam paper is evaluated once by a REC professor and once by a professor from another college (e.g. SVCE or SSN). If the difference is greater than 15 marks, a third coordinator reviews it. Just ensure you write step-wise formulas; steps have mandatory marks in the rubric!',
        createdAt: '2026-06-04T16:45:00Z',
        upvotes: 15
      }
    ]
  },
  {
    id: 'post-q3',
    title: 'Lose bus pass mid-semester - How to secure renewal without pay penalties?',
    authorRole: 'Student',
    content: 'Unfortunate event: My bus ID card slipped out of my pocket during a local bus boarding. Whom should I approach at the administrative desk to request a duplicate? Do they charge the fine of ₹500 unconditionally?',
    department: 'general',
    category: 'Question',
    upvotes: 11,
    commentsCount: 1,
    authorName: 'Commuter_Life',
    isAnonymous: true,
    createdAt: '2026-06-05T09:00:00Z',
    tags: ['BusPass', 'Admin Office', 'FineHelp'],
    comments: [
      {
        id: 'c-q3-1',
        authorName: 'Admin_Guide',
        isAnonymous: true,
        content: 'Go to the transport division counter near the main college portico. If you bring an authorized letter from your class advisor stating the loss was accidental, they sometimes bypass the ₹500 fee or only collect ₹200 for plastic printing. Try it in the morning hours (8:30 to 9:30 AM)!',
        createdAt: '2026-06-05T09:45:00Z',
        upvotes: 6
      }
    ]
  }
];

export const INITIAL_PROFESSORS: Professor[] = [
  {
    id: 'prof-1',
    name: 'Dr. Priya Srinivasan',
    department: 'CSE',
    reviews: [
      {
        id: 'rev-1-1',
        content: 'Outstanding teaching! She explains Data Structures using highly applicable day-to-day objects. Attendance policy is standard 75% required, but if you genuinely pay attention, she rewards with generous internal grades.',
        teaching: 5,
        strictness: 2,
        attendance: 3,
        ease: 4,
        upvotes: 18,
        isAnonymous: true,
        authorName: 'Anonymous Student',
        createdAt: '2026-05-15T11:00:00Z'
      },
      {
        id: 'rev-1-2',
        content: 'She is friendly during lab sessions but gets strict if you don\'t submit your worksheets on time. Just follow standard instructions and you will score well.',
        teaching: 4,
        strictness: 3,
        attendance: 4,
        ease: 4,
        upvotes: 9,
        isAnonymous: false,
        authorName: 'Siddharth R',
        createdAt: '2026-05-20T08:30:00Z'
      }
    ]
  },
  {
    id: 'prof-2',
    name: 'Dr. G. Ramesh (ECE Lab Expert)',
    department: 'ECE',
    reviews: [
      {
        id: 'rev-2-1',
        content: 'Very strict attendance. If you are even 2 minutes late to the ECE lab block, he will mark you absent for the whole session. Teaching is incredibly detailed but his assignment workload is high. Highly recommend studying the manual beforehand!',
        teaching: 4,
        strictness: 5,
        attendance: 5,
        ease: 2,
        upvotes: 25,
        isAnonymous: true,
        authorName: 'Anonymous Student',
        createdAt: '2026-05-10T12:00:00Z'
      },
      {
        id: 'rev-2-2',
        content: 'Strict but clean. If you display actual curiosity and neat layout connection on the breadboard, his questions in viva are pleasant. If you copy records, you are in big trouble.',
        teaching: 3,
        strictness: 4,
        attendance: 5,
        ease: 3,
        upvotes: 11,
        isAnonymous: false,
        authorName: 'Keerthana Sundar',
        createdAt: '2026-05-22T06:40:00Z'
      }
    ]
  },
  {
    id: 'prof-3',
    name: 'Dr. Senthamarai Selvi (Math)',
    department: 'IT',
    reviews: [
      {
        id: 'rev-3-1',
        content: 'The savior for Mathematics and Operations Research! Beautiful handwriting on blackboard. Her unit notes are literally what stays in CAT. Highly student-friendly. Highly recommend taking her sections!',
        teaching: 5,
        strictness: 2,
        attendance: 2,
        ease: 5,
        upvotes: 33,
        isAnonymous: false,
        authorName: 'Aishwarya_IT',
        createdAt: '2026-05-21T02:00:00Z'
      }
    ]
  },
  {
    id: 'prof-4',
    name: 'Prof. K. Jagadeesan',
    department: 'Mechanical',
    reviews: [
      {
        id: 'rev-4-1',
        content: 'Legendary mechanical teaching. He can draw complex system engines from memory perfectly. He hates mobile phone usage in class. Just place your phone in the bag and appreciate the lecturing.',
        teaching: 5,
        strictness: 4,
        attendance: 4,
        ease: 3,
        upvotes: 19,
        isAnonymous: true,
        authorName: 'Anonymous Student',
        createdAt: '2026-05-25T15:30:00Z'
      }
    ]
  }
];

export const INITIAL_PLACEMENTS: PlacementExperience[] = [
  {
    id: 'p-1',
    title: 'Zoho Corporation - Technical Consultant Role',
    company: 'Zoho Corporation',
    role: 'Technical Consultant',
    ctc: '8.5 LPA',
    rounds: 'Round 1: Written test (C output, math, loops code writing). Round 2: In-depth programming (recursive matrix, string patterns). Round 3: App design logic. Round 4: General HR.',
    difficulty: 'Hard',
    tips: 'For Zoho, syntax fluency is everything. Review string manipulation, pointers, and manual garbage cleaning concepts in C. Avoid using high-level language wrappers in earlier rounds; they prefer seeing raw pointers and memory layout manipulation.',
    authorName: 'Karthik K',
    isAnonymous: false,
    createdAt: '2026-05-29T10:00:00Z',
    upvotes: 24
  },
  {
    id: 'p-2',
    title: 'Kaar Technologies - ERP Consultant Placement',
    company: 'Kaar Technologies',
    role: 'Associate ERP Consultant',
    ctc: '6.5 LPA',
    rounds: 'Round 1: Quantitative and Verbal Aptitude test (Elitmus pattern). Round 2: Technical interview (Database schemas, join queries, SQL, normalization). Round 3: Structured Group Discussion on trending enterprise cloud subjects.',
    difficulty: 'Medium',
    tips: 'Database concepts are heavily valued at Kaar. Know 3NF, indices, indexing constraints, triggers, and transactions thoroughly. Practice speaking clearly in GD as they assess communication posture first.',
    authorName: 'Meera Nair',
    isAnonymous: true,
    createdAt: '2026-05-25T07:15:00Z',
    upvotes: 15
  },
  {
    id: 'p-3',
    title: 'Cognizant (CTS) - GenC Elevate Track',
    company: 'Cognizant',
    role: 'Software Engineer',
    ctc: '5.2 LPA',
    rounds: 'Round 1: Cognitive assessment and basic programming loops (AMCAT / Mettl). Round 2: Single composite technical and personal interview on zoom.',
    difficulty: 'Easy',
    tips: 'Be sound with Object-Oriented Programming (OOP) concepts. They asked about polymorphism, class templates, and inheritance with real life metaphors. Show enthusiasm and clean attire.',
    authorName: 'Hari Prasad',
    isAnonymous: false,
    createdAt: '2026-05-18T14:00:00Z',
    upvotes: 11
  }
];

export const INITIAL_INTERNSHIPS: InternshipExperience[] = [
  {
    id: 'i-1',
    title: 'Backend Intern Experience at a FinTech Startup',
    company: 'Credence Tech Solutions',
    stipend: '15,000 / month',
    applicationProcess: 'Applied through LinkedIn connection of an REC IT Senior. Got shortlisted through a 1-hour take-home coding challenge (implementing express secure auth with JWT).',
    referralTips: 'Always build active side projects and tweet/post them on LinkedIn tagging startup founders in Chennai. Many alumni working in Sholinganallur and Guindy startups are always looking for interns.',
    warning: 'Avoid unpaid internship offers from shady training institutes near Vadapalani who ask for "placement training fees". Direct scam!',
    skillsRequired: ['Node.js', 'Express', 'JWT', 'PostgreSQL'],
    authorName: 'Arun Kumar',
    isAnonymous: false,
    createdAt: '2026-05-27T12:00:00Z',
    upvotes: 19,
    department: 'IT'
  },
  {
    id: 'i-2',
    title: 'Winter Internship at Caterpillar India (SRM Tech Park)',
    company: 'Caterpillar',
    stipend: '25,000 / month',
    applicationProcess: 'On-campus drive specifically for EEE and Mechanical students. Rigorous resume shortlisting followed by a physical technical presentation of college mini projects.',
    referralTips: 'Keep your mini projects original. They asked details down to electrical motor specs, power rating calculations and why we chose a specific controller. Do not copy projects from final-year repositories!',
    warning: 'They have a strict work safety assessment. Dress professionally and follow instructions precisely during the presentation.',
    skillsRequired: ['MATLAB', 'Simulink', 'Basic IoT controllers', 'Motor design'],
    authorName: 'Vijay V',
    isAnonymous: true,
    createdAt: '2026-05-20T04:20:00Z',
    upvotes: 14,
    department: 'EEE'
  },
  {
    id: 'i-3',
    title: 'Frontend React Development Internship',
    company: 'Zoho Corporation',
    stipend: '20,000 / month',
    applicationProcess: 'Off-campus recruitment test on Zoho Creator platform followed by 2 presentation rounds of a custom dashboard.',
    referralTips: 'Zoho loves pure JS concepts and React DOM manipulation depth. Understand standard web performance optimizations, web workers, and React state scheduling.',
    warning: 'They demand long-term commitment. Ensure your college gives proper Permission On-Duty forms for physical attendance.',
    skillsRequired: ['React', 'TypeScript', 'TailwindCSS', 'Redux'],
    authorName: 'Sanjay Krish',
    isAnonymous: false,
    createdAt: '2026-06-02T09:30:00Z',
    upvotes: 28,
    department: 'CSE'
  },
  {
    id: 'i-4',
    title: 'Applied AI & LLM Engineering Intern',
    company: 'Mad Street Den',
    stipend: '35,000 / month',
    applicationProcess: 'Applied through an alumnus reference from Chennai AI meetups. Coding test on Python vector calculations and a 35-minute interview explaining basic training model pipelines.',
    referralTips: 'Participate in local Python/AI user groups in Chennai. Show them a running prototype using model scraping or vector databases.',
    warning: 'The learning curve is massive. You will be expected to read research papers and write deep pipelines in your first week.',
    skillsRequired: ['Python', 'PyTorch', 'Transformers', 'FastAPI'],
    authorName: 'Sanjana R',
    isAnonymous: false,
    createdAt: '2026-06-03T11:15:00Z',
    upvotes: 22,
    department: 'AIML'
  },
  {
    id: 'i-5',
    title: 'Data Analyst Practicum',
    company: 'LatentView Analytics',
    stipend: '18,500 / month',
    applicationProcess: 'Shortcut entry through the LatentView Hackathon for Tamil Nadu engineering students. Top 50 secured interview calls directly.',
    referralTips: 'Focus heavily on SQL joins, subqueries, group by aggregates, and data curation using pandas or Tableau. They test analytic storytelling.',
    warning: 'Do not ignore basic statistics. Variance, standard deviations and hypothesis testing are absolute interview staples.',
    skillsRequired: ['SQL', 'Excel', 'Pandas', 'Tableau', 'Statistics'],
    authorName: 'Nivas Dev',
    isAnonymous: true,
    createdAt: '2026-06-01T08:00:00Z',
    upvotes: 16,
    department: 'AIDS'
  },
  {
    id: 'i-6',
    title: 'IoT & Embedded Systems Prototyper',
    company: 'Tessolve Semiconductor',
    stipend: '16,000 / month',
    applicationProcess: 'ECE department internal selection pool. Written test on electronic logic, logic gates, C programming, and microcontrollers.',
    referralTips: 'Make sure you are very comfortable with logic gates, serial communication protocols (I2C, SPI), and UART. Write some assembly or low-level C projects.',
    warning: 'Lab files are checked and questions on board setups are highly technical.',
    skillsRequired: ['Embedded C', 'Microcontrollers', 'Arduino', 'Verilog'],
    authorName: 'Anand Gopal',
    isAnonymous: false,
    createdAt: '2026-05-24T10:00:00Z',
    upvotes: 11,
    department: 'ECE'
  },
  {
    id: 'i-7',
    title: 'CAD Modeling & Design Intern',
    company: 'L&T Technology Services',
    stipend: '12,000 / month',
    applicationProcess: 'Walk-in interview on Mech department yard during placement season. Selection is on speed & accuracy drafting component structures.',
    referralTips: 'Get fully certified in SolidWorks or Fusion360. Your portfolio is your absolute resume; keep physical or cloud prints of your 3D models.',
    warning: 'Strict biometric punch-in and formal presentation reviews.',
    skillsRequired: ['SolidWorks', 'Fusion360', 'CAD', 'Drafting'],
    authorName: 'Mech_Ruler',
    isAnonymous: true,
    createdAt: '2026-05-21T06:40:00Z',
    upvotes: 9,
    department: 'Mechanical'
  }
];

export const INITIAL_SURVIVAL_TIPS: SurvivalTip[] = [
  {
    id: 's-1',
    category: 'printing',
    title: 'Cheap Bulk Printing & Binding Option',
    description: 'Never print long lab manuals or project records in the main campus library or local department desks if you are printing more than 30 pages. Instead, visit the tiny printing stall located just off the Thandalam junction main road (near the bus stand, behind the fruit stall). It costs 1 INR per page compared to 3 INR inside the campus. Save yourself hundreds of rupees during final semester project reviews.',
    upvotes: 35,
    authorName: 'Thrifty_Senior',
    isAnonymous: true
  },
  {
    id: 's-2',
    category: 'food',
    title: 'Muffins, Canteen & CCD Food Guide',
    description: 'The regular college lunch is okay, but "Muffins" (located near the mechanical labs yard) is the absolute best. Their Paneer Puff, veg cutlet, and cold coffee are legendary. It gets insanely crowded during the 12:15 PM lunch break, so send one friend 5 minutes early if your professor lets you off early. Also, the Cafe Coffee Day kiosk next to the administrative building is great for late afternoon refreshments before boarding the college bus.',
    upvotes: 45,
    authorName: 'Gourmet_REC',
    isAnonymous: false
  },
  {
    id: 's-3',
    category: 'transport',
    title: 'Navigating the College Bus Rules & Commute',
    description: 'REC operates a massive fleet of college buses. Route buses leave the campus sharp at 3:15 PM. If you are even 10 seconds late, they will not wait and you will have to walk 1.5 km to the highway border to grab a public MTC bus (like 549 or 578 towards Poonamallee). Always carry your bus pass! Regular checks happen at the gate. If you forget your bus pass, get an emergency slip from the transport desk near the admin block before 2:45 PM.',
    upvotes: 52,
    authorName: 'Route_42_Driver',
    isAnonymous: true
  },
  {
    id: 's-4',
    category: 'spots',
    title: 'Quiet Study Spots & Power Outlets',
    description: 'The absolute best place for peaceful exam prep or working on laptop is the second floor of the Central Library, specifically the back rows of the IEEE journal racks. There are hidden socket boards under the wooden desks. It is chilled out, quiet, and researchers rarely head there. Perfect for charging your device and practicing coding uninterrupted.',
    upvotes: 28,
    authorName: 'CoderInPeace',
    isAnonymous: true
  },
  {
    id: 's-5',
    category: 'hacks',
    title: 'How to bypass standard attendance warnings',
    description: 'The absolute hard ceiling is 75%. Below 75% attendance triggers automatic letters to parents. If you are at 72-74% due to medical reasons, apply for medical leave immediately with an authentic hospital checkup certificate BEFORE the monthly review cutoff. Once portals are closed, department heads cannot feed OD (On Duty) or ML logs. Pro tip: Enter NSS or technical club tasks to get OD slips whenever possible!',
    upvotes: 49,
    authorName: 'Attendance_Pro',
    isAnonymous: true
  }
];

// Helper to load state from localStorage or seed
export function getSavedPosts(): Post[] {
  const data = localStorage.getItem('rec_posts');
  if (data) {
    try { return JSON.parse(data); } catch (e) { return INITIAL_POSTS; }
  }
  localStorage.setItem('rec_posts', JSON.stringify(INITIAL_POSTS));
  return INITIAL_POSTS;
}

export function savePosts(posts: Post[]) {
  localStorage.setItem('rec_posts', JSON.stringify(posts));
}

export function getSavedProfessors(): Professor[] {
  const data = localStorage.getItem('rec_profs');
  if (data) {
    try { return JSON.parse(data); } catch (e) { return INITIAL_PROFESSORS; }
  }
  localStorage.setItem('rec_profs', JSON.stringify(INITIAL_PROFESSORS));
  return INITIAL_PROFESSORS;
}

export function saveProfessors(profs: Professor[]) {
  localStorage.setItem('rec_profs', JSON.stringify(profs));
}

export function getSavedPlacements(): PlacementExperience[] {
  const data = localStorage.getItem('rec_placements');
  if (data) {
    try { return JSON.parse(data); } catch (e) { return INITIAL_PLACEMENTS; }
  }
  localStorage.setItem('rec_placements', JSON.stringify(INITIAL_PLACEMENTS));
  return INITIAL_PLACEMENTS;
}

export function savePlacements(placements: PlacementExperience[]) {
  localStorage.setItem('rec_placements', JSON.stringify(placements));
}

export function getSavedInternships(): InternshipExperience[] {
  const data = localStorage.getItem('rec_internships');
  if (data) {
    try { return JSON.parse(data); } catch (e) { return INITIAL_INTERNSHIPS; }
  }
  localStorage.setItem('rec_internships', JSON.stringify(INITIAL_INTERNSHIPS));
  return INITIAL_INTERNSHIPS;
}

export function saveInternships(internships: InternshipExperience[]) {
  localStorage.setItem('rec_internships', JSON.stringify(internships));
}

export function getSavedSurvivalTips(): SurvivalTip[] {
  const data = localStorage.getItem('rec_survival_tips');
  if (data) {
    try { return JSON.parse(data); } catch (e) { return INITIAL_SURVIVAL_TIPS; }
  }
  localStorage.setItem('rec_survival_tips', JSON.stringify(INITIAL_SURVIVAL_TIPS));
  return INITIAL_SURVIVAL_TIPS;
}

export function saveSurvivalTips(tips: SurvivalTip[]) {
  localStorage.setItem('rec_survival_tips', JSON.stringify(tips));
}
