import { ResumeData } from '../types';

export const DEFAULT_RESUME: ResumeData = {
  themeColor: "#e5e5e5",
  enableAnimation: true,
  profile: {
    name: "Alex Rivera",
    title: "Product Designer",
    location: "Metropolis, Earth",
    email: "hello@alexrivera.design",
    summary: "Visionary Product Designer with a focus on creating intuitive, human-centered digital experiences. Expert in bridging the gap between user needs and business goals through elegant design and strategic thinking.",
    summaryAlign: 'center',
    summaryWidth: 100,
    contactItems: [
      { id: "c1", icon: "MapPin", text: "Metropolis, Earth", url: "" },
      { id: "c2", icon: "Mail", text: "hello@alexrivera.design", url: "mailto:hello@alexrivera.design" }
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
          title: "Senior Product Designer", 
          subtitle: "Design Studio X", 
          period: "Jan 2022 - Present", 
          description: "Led the design of award-winning mobile applications and cross-platform design systems.\n#ProductDesign #UIUX #DesignSystems" 
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
          title: "BFA in Communication Design", 
          subtitle: "University of Arts", 
          period: "Sep 2014 - Jun 2018", 
          description: "Focus on interactive media and typography." 
        }
      ]
    },
    skills: {
      id: "skills",
      title: "Expertise",
      type: "tags",
      items: [
        { id: "s1", text: "Visual Design (Figma, Adobe XD)" },
        { id: "s2", text: "User Research & Testing" },
        { id: "s3", text: "Design Systems & Prototyping" }
      ]
    },
    languages: {
      id: "languages",
      title: "Languages",
      type: "tags",
      items: [
        { id: "l1", text: "English (Native)" },
        { id: "l2", text: "Spanish (Fluent)" }
      ]
    }
  }
};
