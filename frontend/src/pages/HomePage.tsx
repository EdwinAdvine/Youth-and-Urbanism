import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Calculator,
  FlaskConical,
  MessageCircle,
  Globe,
  Palette,
  Activity,
  BookOpen,
  Sprout,
  Home,
  Brain,
  Heart,
  Wrench,
  Star,
  Users,
  ArrowRight,
} from 'lucide-react';
import heroBackground from '../assets/images/background001.png';

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  image: string;
}

interface Category {
  name: string;
  slug: string;
  description: string;
  icon: React.ElementType;
}

interface CourseCard {
  id: number;
  title: string;
  instructor: string;
  rating: number;
  reviews: number;
  price: string;
  enrolled: number;
  image: string;
}

interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted: boolean;
}

const features: Feature[] = [
  { id: 1, title: 'Truly Personalized', description: 'Remembers past performance and focuses on strengths and weaknesses.', icon: '\uD83C\uDFAF' },
  { id: 2, title: 'CBC-Aligned Content', description: 'Lessons, stories, and activities match exactly what your child learns in school.', icon: '\uD83D\uDCDA' },
  { id: 3, title: 'Works Offline & Low-Data', description: 'Perfect for unreliable internet. Download lessons and continue learning.', icon: '\uD83D\uDCF1' },
  { id: 4, title: 'Voice & Chat in English & Kiswahili', description: 'Simple, encouraging conversations your child will love.', icon: '\uD83D\uDCAC' },
  { id: 5, title: 'Safe & Protected', description: "Strict child protection, verifiable parental consent, and full compliance with Kenya's Data Protection Act.", icon: '\uD83D\uDD12' },
  { id: 6, title: 'Named Personal Tutor', description: 'Your child can name their AI tutor \u2014 making learning personal and fun!', icon: '\uD83D\uDC64' },
];

const testimonials: Testimonial[] = [
  { id: 1, name: 'Mary W.', role: 'Mother, Mathare', quote: 'My daughter now loves learning. She talks to her tutor every day and her confidence has grown so much!', image: 'https://picsum.photos/id/1016/100/100' },
  { id: 2, name: 'James K.', role: 'Father, Kibera', quote: "The offline mode is a game changer. My son can learn even when we don't have internet at home.", image: 'https://picsum.photos/id/1018/100/100' },
  { id: 3, name: 'Aisha M.', role: 'Teacher, Nairobi', quote: "I've seen remarkable improvement in my students who use The Bird AI. It complements classroom learning perfectly.", image: 'https://picsum.photos/id/1019/100/100' },
];

const categories: Category[] = [
  { name: 'Mathematics', slug: 'mathematics', description: 'Numbers, algebra, geometry and data handling', icon: Calculator },
  { name: 'Science & Technology', slug: 'science-technology', description: 'Exploring the natural world and innovations', icon: FlaskConical },
  { name: 'Languages', slug: 'languages', description: 'English, Kiswahili and indigenous languages', icon: MessageCircle },
  { name: 'Social Studies', slug: 'social-studies', description: 'History, civics, geography and citizenship', icon: Globe },
  { name: 'Creative Arts', slug: 'creative-arts', description: 'Music, art, craft and performing arts', icon: Palette },
  { name: 'Physical & Health Ed', slug: 'physical-health-education', description: 'Sports, fitness and healthy living', icon: Activity },
  { name: 'Religious Education', slug: 'religious-education', description: 'CRE, IRE and Hindu RE pathways', icon: BookOpen },
  { name: 'Agriculture & Nutrition', slug: 'agriculture-nutrition', description: 'Farming, food science and sustainability', icon: Sprout },
  { name: 'Home Science', slug: 'home-science', description: 'Life skills, nutrition and household management', icon: Home },
  { name: 'Core Competencies', slug: 'core-competencies', description: 'Critical thinking, creativity and problem solving', icon: Brain },
  { name: 'Core Values', slug: 'core-values', description: 'Integrity, responsibility, respect and patriotism', icon: Heart },
  { name: 'Pre-Technical Ed', slug: 'pre-technical-education', description: 'Hands-on technical and vocational skills', icon: Wrench },
];

const coursesData: CourseCard[] = [
  { id: 1, title: 'CBC Mathematics Grade 4', instructor: 'Mr. Kamau Njoroge', rating: 4.8, reviews: 142, price: 'Free', enrolled: 2340, image: 'https://picsum.photos/seed/math4/400/240' },
  { id: 2, title: 'English Language Arts Grade 5', instructor: 'Ms. Achieng Odhiambo', rating: 4.9, reviews: 98, price: 'KES 1,500', enrolled: 1820, image: 'https://picsum.photos/seed/eng5/400/240' },
  { id: 3, title: 'Science & Technology Grade 3', instructor: 'Dr. Wanjiku Mwangi', rating: 4.7, reviews: 76, price: 'Free', enrolled: 3105, image: 'https://picsum.photos/seed/sci3/400/240' },
  { id: 4, title: 'Kiswahili Sanifu Grade 6', instructor: 'Mwl. Hassan Omar', rating: 4.6, reviews: 64, price: 'KES 1,500', enrolled: 1456, image: 'https://picsum.photos/seed/kisw6/400/240' },
  { id: 5, title: 'Creative Arts Grade 2', instructor: 'Ms. Nyambura Karanja', rating: 4.9, reviews: 53, price: 'Free', enrolled: 987, image: 'https://picsum.photos/seed/art2/400/240' },
  { id: 6, title: 'Social Studies Grade 7', instructor: 'Mr. Otieno Ouma', rating: 4.5, reviews: 112, price: 'KES 1,500', enrolled: 2678, image: 'https://picsum.photos/seed/soc7/400/240' },
];

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: 'Free',
    period: 'forever',
    features: ['Basic AI tutoring', '3 subjects', 'Community forum access', 'Limited offline content'],
    highlighted: false,
  },
  {
    name: 'Basic',
    price: '1,000 KES',
    period: '/mo',
    features: ['Unlimited AI tutoring', 'All CBC subjects', 'Full offline mode', 'Progress reports', 'Priority support'],
    highlighted: true,
  },
  {
    name: 'Parents',
    price: '800 KES',
    period: '/mo',
    features: ['Everything in Basic', 'Up to 3 children', 'Parent dashboard', 'Teacher communication', 'Family analytics'],
    highlighted: false,
  },
  {
    name: 'Sponsor',
    price: '500 KES',
    period: '/child/mo',
    features: ['Sponsor a child', 'Full platform access', 'Impact reports', 'NGO dashboard', 'Tax receipt'],
    highlighted: false,
  },
];

const chatBubbles = [
  { role: 'user' as const, text: 'Help me with fractions \u2014 I don\'t understand how to add them.' },
  { role: 'bot' as const, text: 'Great question! To add fractions like 1/4 + 2/4, keep the bottom number (denominator) the same and add the top numbers: 1 + 2 = 3. So the answer is 3/4.' },
  { role: 'bot' as const, text: 'Want more practice? Try our CBC Mathematics course \u2014 it has interactive fraction exercises!' },
];

// ---------------------------------------------------------------------------
// Helper Components
// ---------------------------------------------------------------------------

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < full
              ? 'fill-yellow-400 text-yellow-400'
              : i === full && hasHalf
              ? 'fill-yellow-400/50 text-yellow-400'
              : 'text-gray-400 dark:text-gray-300 dark:text-white/20'
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-gray-600 dark:text-white/70">{rating}</span>
    </span>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const HomePage: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="overflow-x-hidden">
      {/* ================================================================
          HERO SECTION - Parallax background
      ================================================================ */}
      <header ref={heroRef} className="relative h-screen flex items-center overflow-hidden">
        {/* Parallax background layer */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            y: heroY,
            backgroundImage: `url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 z-[1] bg-gray-50 dark:bg-[#0F1112]/80" />

        {/* Content */}
        <motion.div
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-900 dark:text-white"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-gray-100 dark:bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-xs sm:text-sm mb-4 sm:mb-6 border border-gray-300 dark:border-white/20"
          >
            <span className="bg-[#FF0000] text-gray-900 dark:text-white text-xs font-bold px-2 py-1 rounded-xl">NEW</span>
            AI Tutoring Platform for Kenyan Children
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-4 sm:mb-6"
          >
            The Bird AI: Your Child's Personal AI Tutor,
            <br />
            <span className="text-[#FF0000]">Built for Kenya</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-gray-800 dark:text-white/90 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed"
          >
            Personalized learning aligned with the Competency-Based Curriculum (CBC). Works offline. Safe for children. In
            English and Kiswahili. Designed by Students for Students.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col gap-3 sm:gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/how-it-works"
                className="bg-[#FF0000] hover:bg-[#E40000] text-gray-900 dark:text-white px-8 py-3 sm:px-10 sm:py-4 rounded-2xl sm:rounded-3xl font-semibold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-colors duration-200 min-h-[44px]"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <a
              href="#how-it-works"
              className="border-2 border-white/30 hover:border-[#FF0000] hover:bg-[#FF0000]/20 px-8 py-3 sm:px-10 sm:py-4 rounded-2xl sm:rounded-3xl font-semibold text-base sm:text-lg transition-all duration-200 min-h-[44px] flex items-center justify-center text-gray-800 dark:text-white/90 hover:text-gray-900 dark:hover:text-white"
            >
              How It Works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-8 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-gray-700 dark:text-white/80"
          >
            {['Compliant with Kenya\'s Data Protection Act', 'Parental consent required', 'Offline mode available'].map(
              (text, i) => (
                <div key={i} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#FF0000]" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{text}</span>
                </div>
              ),
            )}
          </motion.div>
        </motion.div>
      </header>

      {/* ================================================================
          THE CHALLENGE SECTION
      ================================================================ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        transition={{ duration: 0.6 }}
        className="py-16 sm:py-20 bg-white dark:bg-[#181C1F]"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12 text-gray-900 dark:text-white">
            Every Child Deserves a Chance to Shine
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-800 dark:text-white/90 max-w-3xl mx-auto leading-relaxed">
            In Kenya's urban informal settlements, bright children face overcrowded classrooms, teacher shortages, and
            limited resources. Parents work hard but worry their child is falling behind. Traditional schooling alone isn't
            enough to unlock every child's full potential.
          </p>
        </div>
      </motion.section>

      {/* ================================================================
          POPULAR CATEGORIES GRID (NEW)
      ================================================================ */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-[#0F1112]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              CBC Learning Areas
            </h2>
            <p className="text-base sm:text-lg text-gray-700 dark:text-white/80 max-w-2xl mx-auto">
              Explore all subjects aligned with Kenya's Competency-Based Curriculum
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div key={cat.slug} variants={staggerItem}>
                  <Link
                    to={`/categories/${cat.slug}`}
                    className="group flex items-start gap-4 bg-white dark:bg-[#181C1F] rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-[#22272B] hover:border-[#FF0000]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF0000]/5"
                  >
                    <div className="shrink-0 w-11 h-11 rounded-xl bg-[#FF0000]/10 flex items-center justify-center group-hover:bg-[#FF0000]/20 transition-colors duration-300">
                      <Icon className="w-5 h-5 text-[#FF0000]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1 group-hover:text-[#FF0000] transition-colors duration-300">
                        {cat.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-white/60 leading-relaxed">{cat.description}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          OUR SOLUTION / FEATURES SECTION
      ================================================================ */}
      <section id="features" className="py-16 sm:py-20 bg-white dark:bg-[#181C1F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Meet The Bird AI &ndash; The Dedicated Tutor in Your Pocket
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-800 dark:text-white/90 max-w-4xl mx-auto leading-relaxed">
              The Bird AI gives your child a patient, personalized tutor available anytime. Using advanced AI, it delivers
              one-on-one lessons, conversations, and quizzes that follow Kenya's official CBC. It learns your child's
              unique needs and adapts in real time &mdash; all while keeping data private and secure.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                variants={staggerItem}
                className="bg-gray-50 dark:bg-[#0F1112] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-[#22272B] hover:border-[#FF0000]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF0000]/10 hover:-translate-y-1"
              >
                <div className="text-4xl sm:text-5xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-xl sm:text-2xl text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-white/80 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          FEATURED COURSES CAROUSEL (NEW)
      ================================================================ */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-[#0F1112]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="flex items-end justify-between mb-10 sm:mb-12"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">Featured Courses</h2>
              <p className="text-base sm:text-lg text-gray-700 dark:text-white/80">Handpicked by our educators for every grade</p>
            </div>
            <Link
              to="/courses"
              className="hidden sm:inline-flex items-center gap-2 text-[#FF0000] hover:text-[#FF4444] font-semibold transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
              className="flex gap-5 sm:gap-6 w-max"
            >
              {coursesData.map((course) => (
                <motion.div
                  key={course.id}
                  variants={staggerItem}
                  className="snap-start shrink-0 w-[280px] sm:w-[320px] bg-white dark:bg-[#181C1F] rounded-2xl border border-gray-200 dark:border-[#22272B] overflow-hidden hover:border-[#FF0000]/30 transition-all duration-300 group"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span
                      className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${
                        course.price === 'Free'
                          ? 'bg-green-500/90 text-gray-900 dark:text-white'
                          : 'bg-[#FF0000]/90 text-gray-900 dark:text-white'
                      }`}
                    >
                      {course.price}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-white/60 mb-3">{course.instructor}</p>
                    <div className="flex items-center justify-between">
                      <StarRating rating={course.rating} />
                      <span className="text-xs text-gray-500 dark:text-white/50 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {course.enrolled.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-[#FF0000] hover:text-[#FF4444] font-semibold transition-colors"
            >
              View All Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================
          HOW IT WORKS SECTION
      ================================================================ */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white dark:bg-[#181C1F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Simple. Safe. Effective.</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-800 dark:text-white/90 max-w-3xl mx-auto">
              Everything your child needs to succeed
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            {[
              { step: 1, title: 'Sign Up with Consent', desc: 'Quick registration. Parent/guardian verifies and gives permission.' },
              { step: 2, title: 'Baseline Assessment', desc: 'Your child does a short, fun activity so the AI understands their current level.' },
              { step: 3, title: 'Start Learning', desc: 'Meet their personal AI tutor and begin chatting, learning, and growing.' },
              { step: 4, title: 'Track Progress', desc: 'View reports anytime and celebrate achievements together.' },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={staggerItem}
                className="bg-gray-50 dark:bg-[#0F1112] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-[#22272B] text-center hover:border-[#FF0000]/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center text-gray-900 dark:text-white font-bold text-xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-white/80 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          AI BOT TEASER (NEW)
      ================================================================ */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-[#0F1112]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              See The Bird AI in Action
            </h2>
            <p className="text-base sm:text-lg text-gray-700 dark:text-white/80 max-w-2xl mx-auto">
              A patient, encouraging tutor that explains concepts step by step
            </p>
          </motion.div>

          <div className="max-w-xl mx-auto">
            {/* Chat window */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
              className="bg-white dark:bg-[#181C1F] rounded-2xl border border-gray-200 dark:border-[#22272B] overflow-hidden"
            >
              {/* Title bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-200 dark:border-[#22272B]">
                <div className="w-3 h-3 rounded-full bg-[#FF0000]" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-sm text-gray-500 dark:text-white/60 font-medium">The Bird AI</span>
              </div>

              {/* Messages */}
              <div className="p-5 sm:p-6 space-y-4">
                {chatBubbles.map((bubble, idx) => (
                  <motion.div
                    key={idx}
                    variants={{
                      hidden: { opacity: 0, x: bubble.role === 'user' ? 20 : -20 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.5, delay: idx * 0.25 },
                      },
                    }}
                    className={`flex ${bubble.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        bubble.role === 'user'
                          ? 'bg-[#FF0000] text-gray-900 dark:text-white rounded-br-md'
                          : 'bg-gray-100 dark:bg-[#22272B] text-gray-800 dark:text-white/90 rounded-bl-md'
                      }`}
                    >
                      {bubble.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input bar mock */}
              <div className="px-5 pb-5">
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#0F1112] rounded-xl px-4 py-3 border border-gray-200 dark:border-[#22272B]">
                  <span className="text-gray-400 dark:text-white/40 text-sm flex-1">Ask The Bird AI anything...</span>
                  <div className="w-8 h-8 rounded-lg bg-[#FF0000] flex items-center justify-center shrink-0">
                    <ArrowRight className="w-4 h-4 text-gray-900 dark:text-white" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center mt-8"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/the-bird"
                  className="inline-flex items-center gap-2 bg-[#FF0000] hover:bg-[#E40000] text-gray-900 dark:text-white px-8 py-3 rounded-2xl font-semibold transition-colors duration-200"
                >
                  Try The Bird AI
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================
          IMPACT SECTION
      ================================================================ */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#181C1F]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12 text-gray-900 dark:text-white">
              Real Learning Gains for Kenyan Children
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-800 dark:text-white/90 max-w-3xl mx-auto mb-10 sm:mb-12 leading-relaxed">
              Early pilots and similar AI tutoring programs show up to 30% improvement in learning outcomes. Our vision:
              80%+ retention and measurable gains in CBC competencies.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16"
          >
            {[
              { icon: '\uD83D\uDCF1', label: 'Works Offline' },
              { icon: '\uD83D\uDDE3\uFE0F', label: 'Multilingual Support' },
              { icon: '\uD83D\uDEE1\uFE0F', label: 'Child-Safe by Design' },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="bg-gray-50 dark:bg-[#0F1112] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-[#22272B] text-center"
              >
                <div className="text-4xl sm:text-5xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">{item.label}</h3>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-base sm:text-lg md:text-xl text-gray-800 dark:text-white/90"
          >
            Children feel confident. Parents feel supported. Communities grow stronger.
          </motion.p>
        </div>
      </section>

      {/* ================================================================
          PRICING TEASER (NEW)
      ================================================================ */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-[#0F1112]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Affordable Plans for Every Family
            </h2>
            <p className="text-base sm:text-lg text-gray-700 dark:text-white/80 max-w-2xl mx-auto">
              Quality education shouldn't be a luxury. Choose the plan that fits your needs.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
          >
            {pricingTiers.map((tier) => (
              <motion.div
                key={tier.name}
                variants={staggerItem}
                className={`relative rounded-2xl p-6 sm:p-7 border transition-all duration-300 ${
                  tier.highlighted
                    ? 'bg-white dark:bg-[#181C1F] border-[#FF0000]/60 shadow-lg shadow-[#FF0000]/10'
                    : 'bg-white dark:bg-[#181C1F] border-gray-200 dark:border-[#22272B] hover:border-[#FF0000]/30'
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF0000] text-gray-900 dark:text-white text-xs font-bold px-3 py-1 rounded-full">
                    POPULAR
                  </span>
                )}
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{tier.name}</h3>
                <div className="mb-5">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{tier.price}</span>
                  {tier.period !== 'forever' && (
                    <span className="text-sm text-gray-500 dark:text-white/60">{tier.period}</span>
                  )}
                </div>
                <ul className="space-y-2.5 mb-6">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-white/80">
                      <svg className="w-4 h-4 text-[#FF0000] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/pricing"
                    className={`block w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-colors duration-200 ${
                      tier.highlighted
                        ? 'bg-[#FF0000] hover:bg-[#E40000] text-gray-900 dark:text-white'
                        : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-[#22272B]'
                    }`}
                  >
                    Get Started
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mt-8"
          >
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 text-[#FF0000] hover:text-[#FF4444] font-semibold transition-colors"
            >
              See Full Pricing Details <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          TESTIMONIALS SECTION
      ================================================================ */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#181C1F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              What Kenyan Parents Are Saying
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                variants={staggerItem}
                className="bg-gray-50 dark:bg-[#0F1112] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-[#22272B] hover:border-[#FF0000]/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-700 dark:text-white/80">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-800 dark:text-white/90 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          FINAL CTA SECTION
      ================================================================ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        transition={{ duration: 0.6 }}
        className="py-16 sm:py-20 bg-gray-50 dark:bg-[#0F1112]"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Give Your Child the Light of Quality Education Today
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-800 dark:text-white/90 max-w-3xl mx-auto mb-10 sm:mb-12 leading-relaxed">
            Join the The Bird AI pilot in Nairobi. Limited spots for families in informal settlements.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/how-it-works"
                className="bg-[#FF0000] hover:bg-[#E40000] text-gray-900 dark:text-white px-8 py-3 sm:px-10 sm:py-4 rounded-2xl sm:rounded-3xl font-semibold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-colors duration-200 min-h-[44px]"
              >
                Enroll Your Child Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/about"
                className="border-2 border-white/30 hover:border-[#FF0000] hover:bg-[#FF0000]/20 px-8 py-3 sm:px-10 sm:py-4 rounded-2xl sm:rounded-3xl font-semibold text-base sm:text-lg transition-all duration-200 min-h-[44px] flex items-center justify-center text-gray-800 dark:text-white/90 hover:text-gray-900 dark:hover:text-white"
              >
                Learn More for Schools & NGOs
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/contact"
                className="border-2 border-white/30 hover:border-[#FF0000] hover:bg-[#FF0000]/20 px-8 py-3 sm:px-10 sm:py-4 rounded-2xl sm:rounded-3xl font-semibold text-base sm:text-lg transition-all duration-200 min-h-[44px] flex items-center justify-center text-gray-800 dark:text-white/90 hover:text-gray-900 dark:hover:text-white"
              >
                Join Waitlist
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
