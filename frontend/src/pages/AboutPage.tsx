import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Accessibility,
  ShieldCheck,
  Award,
  Lightbulb,
  Users,
  BookOpen,
  Layers,
  Cpu,
  ArrowRight,
} from 'lucide-react';

interface Value {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

interface Stat {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const values: Value[] = [
  {
    title: 'Accessibility',
    description:
      'Education should reach every child regardless of location, income, or connectivity. We design for low-bandwidth environments, offer offline capabilities, and keep our core platform free.',
    icon: <Accessibility className="w-7 h-7" />,
  },
  {
    title: 'Safety',
    description:
      'Children come first. We enforce strict data protection, require verifiable parental consent, use content filters on all AI interactions, and comply fully with Kenya\'s Data Protection Act 2019.',
    icon: <ShieldCheck className="w-7 h-7" />,
  },
  {
    title: 'Quality',
    description:
      'Every lesson, quiz, and AI interaction is aligned with Kenya\'s Competency-Based Curriculum. Our content is reviewed by Kenyan educators and continuously improved based on learning outcomes.',
    icon: <Award className="w-7 h-7" />,
  },
  {
    title: 'Innovation',
    description:
      'We leverage cutting-edge multi-AI orchestration to deliver personalized tutoring at scale. Six AI models work together to provide the best possible learning experience for each child.',
    icon: <Lightbulb className="w-7 h-7" />,
  },
];

const team: TeamMember[] = [
  {
    name: 'Edwin Odhiambo',
    role: 'Founder & CEO',
    bio: 'Passionate about leveraging technology to bridge educational gaps for children in underserved communities across Kenya.',
    image: 'https://picsum.photos/seed/team1/300/300',
  },
  {
    name: 'Amina Hassan',
    role: 'Head of Education',
    bio: 'Former CBC curriculum developer with 15 years of experience in Kenyan education. Ensures all content meets KICD standards.',
    image: 'https://picsum.photos/seed/team2/300/300',
  },
  {
    name: 'David Mwangi',
    role: 'CTO',
    bio: 'AI and machine learning specialist focused on building scalable, child-safe AI systems that work in low-resource environments.',
    image: 'https://picsum.photos/seed/team3/300/300',
  },
];

const stats: Stat[] = [
  { label: 'Students', value: '5,000+', icon: <Users className="w-6 h-6" /> },
  { label: 'Courses', value: '100+', icon: <BookOpen className="w-6 h-6" /> },
  { label: 'CBC Categories', value: '12', icon: <Layers className="w-6 h-6" /> },
  { label: 'AI Models', value: '6', icon: <Cpu className="w-6 h-6" /> },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const AboutPage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 sm:py-28 bg-gray-50 dark:bg-[#0F1112]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-[#FF0000]/10 text-[#FF0000] text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-[#FF0000]/20">
              About Us
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              About <span className="text-[#FF0000]">Urban Home School</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-white/80 max-w-3xl mx-auto leading-relaxed">
              We are on a mission to provide quality, personalized AI-powered education
              to every Kenyan child, no matter where they live or what resources they have.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#181C1F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-2xl sm:rounded-3xl p-8 sm:p-10"
            >
              <div className="w-12 h-12 bg-[#FF0000]/10 rounded-xl flex items-center justify-center text-[#FF0000] mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-white/70 leading-relaxed">
                Providing quality, personalized AI-powered education to every Kenyan child.
                We believe that every child deserves access to a patient, knowledgeable tutor
                who understands their unique strengths, challenges, and learning pace &mdash;
                regardless of their family&apos;s economic situation.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-2xl sm:rounded-3xl p-8 sm:p-10"
            >
              <div className="w-12 h-12 bg-[#FF0000]/10 rounded-xl flex items-center justify-center text-[#FF0000] mb-6">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-white/70 leading-relaxed">
                A Kenya where no child&apos;s potential goes unrealized due to lack of
                educational resources. We envision a future where AI-powered learning tools
                level the playing field, giving children in informal settlements the same
                quality of personalized education available anywhere in the world.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-[#0F1112]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">Our Story</h2>
            <div className="text-left space-y-6">
              <p className="text-base sm:text-lg text-gray-600 dark:text-white/70 leading-relaxed">
                Urban Home School was founded to address the education gaps that persist in
                Kenya&apos;s urban informal settlements. In neighborhoods like Mathare, Kibera,
                and Mukuru, bright children face overcrowded classrooms with teacher-to-student
                ratios exceeding 1:60, limited learning materials, and little individual attention.
              </p>
              <p className="text-base sm:text-lg text-gray-600 dark:text-white/70 leading-relaxed">
                Parents in these communities work incredibly hard. They want the best for their
                children but often cannot afford private tutors or supplementary learning programs.
                Meanwhile, the shift to Kenya&apos;s Competency-Based Curriculum (CBC) created
                new challenges, as many parents and even some teachers struggled to adapt to the
                new approach.
              </p>
              <p className="text-base sm:text-lg text-gray-600 dark:text-white/70 leading-relaxed">
                We saw an opportunity where advances in artificial intelligence could be harnessed
                to provide every child with their own patient, adaptive tutor. One that never gets
                tired, never loses patience, and truly understands each child&apos;s unique
                learning journey. The Bird AI was born from this vision &mdash; an AI tutoring
                system designed by Kenyans, for Kenyan children, aligned with the CBC from
                day one.
              </p>
              <p className="text-base sm:text-lg text-gray-600 dark:text-white/70 leading-relaxed">
                Today, Urban Home School serves thousands of families across Nairobi and beyond,
                with plans to expand to every county in Kenya. Our platform continues to evolve,
                driven by feedback from the parents, children, and educators who use it every day.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#181C1F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
              The principles that guide everything we build and every decision we make.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-[#FF0000]/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#FF0000]/10 rounded-xl flex items-center justify-center text-[#FF0000] mb-5">
                  {value.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-base text-gray-600 dark:text-white/70 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-[#0F1112]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Meet the Team</h2>
            <p className="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
              A dedicated group of educators, engineers, and changemakers building the
              future of education in Kenya.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center hover:border-[#FF0000]/30 transition-all duration-300"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-5 border-2 border-gray-200 dark:border-[#22272B]"
                  loading="lazy"
                />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                <p className="text-[#FF0000] font-medium text-sm mb-4">{member.role}</p>
                <p className="text-base text-gray-600 dark:text-white/70 leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#181C1F]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Impact in Numbers
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center"
              >
                <div className="w-12 h-12 bg-[#FF0000]/10 rounded-xl flex items-center justify-center text-[#FF0000] mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <p className="text-sm sm:text-base text-gray-500 dark:text-white/60">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-[#0F1112]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Join the Mission
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Whether you are a parent, educator, partner, or supporter, there is a
              place for you in the Urban Home School community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-3 bg-[#FF0000] hover:bg-[#E40000] text-gray-900 dark:text-white px-8 py-4 rounded-2xl sm:rounded-3xl font-semibold text-lg transition-all duration-200 hover:scale-[1.02]"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-3 border-2 border-white/30 hover:border-[#FF0000] hover:bg-[#FF0000]/20 text-gray-800 dark:text-white/90 hover:text-gray-900 dark:hover:text-white px-8 py-4 rounded-2xl sm:rounded-3xl font-semibold text-lg transition-all duration-200"
              >
                Partner With Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
