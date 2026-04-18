import { ResumeData } from '../types';

export const DEFAULT_RESUME: ResumeData = {
  themeColor: "#e5e5e5",
  enableAnimation: true,
  profile: {
    name: "Joe Chou",
    title: "Software Engineer",
    location: "Zhongzheng Dist., Taipei City",
    email: "mujoecs@gmail.com",
    summary: "Software Engineer with practical experience in backend development, data analysis, and automation. Proficient in Python (Django, Machine Learning, Computer Vision), C# (UiPath RPA), and Smart Contract development (Sui Move). Highly passionate about learning new technologies and solving complex problems. Excellent English communication skills, ready to collaborate in international environments. Seeking full-time software engineering roles to drive product value.",
    summaryAlign: 'center',
    summaryWidth: 100,
    contactItems: [
      { id: "c1", icon: "MapPin", text: "Zhongzheng Dist., Taipei City", url: "" },
      { id: "c2", icon: "Mail", text: "mujoecs@gmail.com", url: "mailto:mujoecs@gmail.com" }
    ]
  },
  blockOrder: ["experience", "education", "skills", "languages"],
  blocks: {
    experience: {
      id: "experience",
      title: "Experience",
      type: "list",
      items: [
        { 
          id: "e1", 
          title: "Software Engineer", 
          subtitle: "CTBC Insurance Co., Ltd.", 
          period: "Jul 2025 - Present", 
          description: "RPA project requirement analysis, design, development, and maintenance. Internal system requirement analysis.\n#SoftwareDesign #SystemArchitecture #VB.net" 
        },
        { 
          id: "e2", 
          title: "English Teaching Assistant", 
          subtitle: "GINI Education", 
          period: "Oct 2024 - Feb 2025", 
          description: "Children's English teaching. Planned and executed teaching activities, designed teaching media, and provided adaptive tutoring." 
        },
        { 
          id: "e3", 
          title: "IT Intern", 
          subtitle: "CTBC Bank", 
          period: "Jul 2023 - Aug 2023", 
          description: "FinTech competitor analysis, report writing, FSC policy research, and internal data analysis." 
        },
        { 
          id: "e4", 
          title: "On-site Interpreter", 
          subtitle: "JOMEL", 
          period: "Mar 2026 - Mar 2026", 
          description: "Assisted in real-time bilingual translation for events, ensuring accurate information delivery and smooth event execution." 
        }
      ]
    },
    education: {
      id: "education",
      title: "Education",
      type: "list",
      items: [
        { 
          id: "edu1", 
          title: "BSc Information Technology", 
          subtitle: "University of the West of England (UK)", 
          period: "Sep 2023 - Jun 2024", 
          description: "Graduated with comprehensive knowledge in IT." 
        },
        { 
          id: "edu2", 
          title: "BSc Artificial Intelligence", 
          subtitle: "CTBC Business School", 
          period: "Sep 2020 - Jun 2024", 
          description: "Focused on AI, Machine Learning, and Data Science." 
        }
      ]
    },
    skills: {
      id: "skills",
      title: "Expertise",
      type: "tags",
      items: [
        { id: "s1", text: "Python (Django, OpenCV, NLP)" },
        { id: "s2", text: "Machine Learning & TensorFlow" },
        { id: "s3", text: "Smart Contracts (Sui Move, Web3)" },
        { id: "s4", text: "C# & UiPath RPA" },
        { id: "s5", text: "Prompt Engineering" }
      ]
    },
    languages: {
      id: "languages",
      title: "Languages",
      type: "tags",
      items: [
        { id: "l1", text: "English (TOEIC 865, IELTS 6.5)" },
        { id: "l2", text: "Mandarin (Native)" }
      ]
    }
  }
};
