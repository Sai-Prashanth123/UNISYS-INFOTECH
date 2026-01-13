import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

import JobPosting from '../models/JobPosting.js';

const jobs = [
  {
    title: 'Senior Full Stack Developer',
    department: 'Engineering',
    location: 'Cornelius, NC',
    type: 'Full-time',
    description: 'We are seeking an experienced Full Stack Developer to join our engineering team. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies.',
    responsibilities: [
      'Design and develop full-stack web applications using React, Node.js, and MongoDB',
      'Collaborate with cross-functional teams to define, design, and ship new features',
      'Write clean, maintainable, and efficient code following best practices',
      'Participate in code reviews and provide constructive feedback',
      'Optimize applications for maximum speed and scalability',
      'Troubleshoot and debug applications to resolve issues',
      'Stay up-to-date with emerging technologies and industry trends'
    ],
    qualifications: [
      'Bachelor\'s degree in Computer Science or related field',
      '5+ years of experience in full-stack web development',
      'Strong proficiency in JavaScript, React, Node.js, and Express',
      'Experience with MongoDB and database design',
      'Solid understanding of RESTful APIs and microservices architecture',
      'Experience with Git version control',
      'Excellent problem-solving and communication skills',
      'Ability to work independently and in a team environment'
    ],
    expectedSkills: [
      'React.js',
      'Node.js',
      'Express.js',
      'MongoDB',
      'JavaScript/TypeScript'
    ],
    technicalStack: [
      'React.js',
      'Node.js',
      'Express.js',
      'MongoDB',
      'REST APIs',
      'Git'
    ],
    skills: [
      'React.js',
      'Node.js',
      'Express.js',
      'MongoDB',
      'JavaScript/TypeScript',
      'REST APIs',
      'Git',
      'HTML/CSS',
      'Tailwind CSS',
      'AWS/Azure'
    ],
    yearsOfExperience: 5,
    experience: '5+ years',
    salary: '$100,000 - $140,000',
    isActive: true,
    displayOrder: 1,
    postedDate: new Date()
  },
  {
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    location: 'Remote',
    type: 'Full-time',
    description: 'Join our Infrastructure team as a DevOps Engineer to help build and maintain our cloud infrastructure. You will work on automating deployments, managing CI/CD pipelines, and ensuring system reliability.',
    responsibilities: [
      'Design, implement, and maintain CI/CD pipelines using Jenkins, GitLab CI, or similar tools',
      'Manage cloud infrastructure on AWS, Azure, or Google Cloud Platform',
      'Automate infrastructure provisioning using Terraform or CloudFormation',
      'Implement monitoring and logging solutions for applications and infrastructure',
      'Manage containerized applications using Docker and Kubernetes',
      'Ensure security best practices across all systems',
      'Collaborate with development teams to improve deployment processes',
      'Respond to and resolve production incidents'
    ],
    qualifications: [
      'Bachelor\'s degree in Computer Science, Engineering, or related field',
      '3+ years of experience in DevOps or Site Reliability Engineering',
      'Strong experience with cloud platforms (AWS, Azure, or GCP)',
      'Proficiency in containerization technologies (Docker, Kubernetes)',
      'Experience with infrastructure as code tools (Terraform, Ansible)',
      'Strong scripting skills in Python, Bash, or similar languages',
      'Experience with CI/CD tools and practices',
      'Excellent troubleshooting and problem-solving skills'
    ],
    expectedSkills: [
      'AWS/Azure/GCP',
      'Docker',
      'Kubernetes',
      'Terraform',
      'CI/CD'
    ],
    technicalStack: [
      'AWS/Azure/GCP',
      'Docker',
      'Kubernetes',
      'Terraform',
      'Jenkins/GitLab CI',
      'Python'
    ],
    skills: [
      'AWS/Azure/GCP',
      'Docker',
      'Kubernetes',
      'Terraform',
      'Jenkins/GitLab CI',
      'Python',
      'Bash',
      'Ansible',
      'Monitoring (Prometheus, Grafana)',
      'Git'
    ],
    yearsOfExperience: 3,
    experience: '3+ years',
    salary: '$90,000 - $130,000',
    isActive: true,
    displayOrder: 2,
    postedDate: new Date()
  }
];

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...');

    // Clear existing jobs
    await JobPosting.deleteMany({});
    console.log('Cleared existing job postings...');

    // Insert new jobs
    const createdJobs = await JobPosting.insertMany(jobs);
    console.log(`✓ Successfully seeded ${createdJobs.length} job postings`);

    createdJobs.forEach(job => {
      console.log(`  - ${job.title} (${job.department})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding jobs:', error);
    process.exit(1);
  }
};

seedJobs();
