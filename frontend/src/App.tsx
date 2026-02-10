import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import BirdChatPage from './components/bird-chat/BirdChatPage';
import DashboardStudent from './pages/DashboardStudent';
import DashboardParent from './pages/DashboardParent';
import DashboardInstructor from './pages/DashboardInstructor';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardPartner from './pages/DashboardPartner';
import AuthModal from './components/auth/AuthModal';
import './App.css';
// Import hero background image from assets folder
import heroBackground from './assets/images/background001.png';

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

const AppContent: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.categories-dropdown-container')) {
        setCategoriesDropdownOpen(false);
      }
    };

    if (categoriesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoriesDropdownOpen]);

  const features: Feature[] = [
    {
      id: 1,
      title: "Truly Personalized",
      description: "Remembers past performance and focuses on strengths and weaknesses.",
      icon: "🎯"
    },
    {
      id: 2,
      title: "CBC-Aligned Content",
      description: "Lessons, stories, and activities match exactly what your child learns in school.",
      icon: "📚"
    },
    {
      id: 3,
      title: "Works Offline & Low-Data",
      description: "Perfect for unreliable internet. Download lessons and continue learning.",
      icon: "📱"
    },
    {
      id: 4,
      title: "Voice & Chat in English & Kiswahili",
      description: "Simple, encouraging conversations your child will love.",
      icon: "💬"
    },
    {
      id: 5,
      title: "Safe & Protected",
      description: "Strict child protection, verifiable parental consent, and full compliance with Kenya's Data Protection Act.",
      icon: "🔒"
    },
    {
      id: 6,
      title: "Named Personal Tutor",
      description: "Your child can name their AI tutor - making learning personal and fun!",
      icon: "👤"
    }
  ];

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Mary W.",
      role: "Mother, Mathare",
      quote: "My daughter now loves learning. She talks to her tutor every day and her confidence has grown so much!",
      image: "https://picsum.photos/id/1016/100/100"
    },
    {
      id: 2,
      name: "James K.",
      role: "Father, Kibera",
      quote: "The offline mode is a game changer. My son can learn even when we don't have internet at home.",
      image: "https://picsum.photos/id/1018/100/100"
    },
    {
      id: 3,
      name: "Aisha M.",
      role: "Teacher, Nairobi",
      quote: "I've seen remarkable improvement in my students who use The Bird AI. It complements classroom learning perfectly.",
      image: "https://picsum.photos/id/1019/100/100"
    }
  ];

  // Dropdown data structure for Categories
  const categories = [
    {
      id: 1,
      title: "Subjects",
      subOptions: [
        { id: 1, title: "Core Competencies", href: "/subjects/core-competencies" },
        { id: 2, title: "Core Values", href: "/subjects/core-values" },
        { id: 3, title: "Languages", href: "/subjects/languages" },
        { id: 4, title: "Mathematics", href: "/subjects/mathematics" },
        { id: 5, title: "Science and Technology", href: "/subjects/science-technology" },
        { id: 6, title: "Social Studies", href: "/subjects/social-studies" },
        { id: 7, title: "Religious Education", href: "/subjects/religious-education" },
        { id: 8, title: "Creative Arts", href: "/subjects/creative-arts" },
        { id: 9, title: "Physical and Health Education", href: "/subjects/physical-health" },
        { id: 10, title: "Agriculture and Nutrition", href: "/subjects/agriculture-nutrition" },
        { id: 11, title: "Home Science", href: "/subjects/home-science" },
        { id: 12, title: "Pre-Technical and Pre-Career Education", href: "/subjects/pre-technical-career" }
      ]
    }
  ];

  return (
    <div className="App">
      <Routes>
        <Route path="/the-bird" element={<BirdChatPage />} />
        <Route path="/" element={
          <div>
      {/* Navbar */}
      <nav className={`bg-[#181C1F] border-b border-[#22272B] sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md shadow-black/50' : 'shadow-sm'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-2">
              <div className="w-12 h-10 sm:w-14 sm:h-12 bg-[#FF0000] rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl">UHS</div>
              <span className="hidden md:inline text-2xl sm:text-3xl font-bold text-white tracking-tight">Urban Home School</span>
            </div>

            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center justify-center space-x-6 lg:space-x-8">
                <a href="#" className="nav-link font-medium text-base text-white hover:text-[#FF0000] transition-colors">Home</a>
                
                {/* Categories Dropdown */}
                <div className="relative categories-dropdown-container">
                  <button 
                    onMouseEnter={() => setCategoriesDropdownOpen(true)}
                    className="nav-link font-medium text-base text-white hover:text-[#FF0000] transition-colors flex items-center gap-1 group"
                    aria-haspopup="true"
                    aria-expanded={categoriesDropdownOpen}
                  >
                    Categories
                    <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${categoriesDropdownOpen ? 'rotate-180' : 'rotate-0'}`}></i>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div 
                    className={`absolute top-full left-0 mt-2 w-[48rem] bg-[#181C1F] border border-[#22272B] rounded-xl shadow-xl shadow-black/30 overflow-hidden transition-all duration-200 ease-in-out transform ${
                      categoriesDropdownOpen 
                        ? 'opacity-100 scale-100 translate-y-0' 
                        : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
                    }`}
                    onMouseLeave={() => setCategoriesDropdownOpen(false)}
                  >
                    <div className="p-2">
                      {categories.map((category) => (
                        <div key={category.id} className="grid grid-cols-2 gap-1">
                          {category.subOptions.map((subOption) => (
                            <a
                              key={subOption.id}
                              href={subOption.href}
                              className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors"
                              onClick={() => setCategoriesDropdownOpen(false)}
                            >
                              {subOption.title}
                            </a>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <a href="/courses" className="nav-link font-medium text-base text-white hover:text-[#FF0000] transition-colors">Courses</a>
                <a href="/pricing" className="nav-link font-medium text-base text-white hover:text-[#FF0000] transition-colors">Pricing</a>
                <a href="/the-bird" className="nav-link font-medium text-base text-white hover:text-[#FF0000] transition-colors">The Bird</a>
                <a href="/store" className="nav-link font-medium text-base text-white hover:text-[#FF0000] transition-colors">Store</a>
                <a href="/forum" className="nav-link font-medium text-base text-white hover:text-[#FF0000] transition-colors">Forum</a>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <a href="#" className="hidden md:flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white transition-colors text-base rounded-lg hover:bg-white/5">
                <i className="fas fa-search"></i>
              </a>
              
              {/* Login/Sign Up Button */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white transition-colors text-base rounded-lg hover:bg-white/5 border border-white/20"
              >
                <i className="fas fa-user"></i>
                <span>Login/Sign Up</span>
              </button>
              
              <a href="#" 
                 className="bg-[#FF0000] hover:bg-[#E40000] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors min-w-[140px] text-center">
                Start Learning
              </a>
              {/* Mobile menu button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                <i className={`fas ${mobileMenuOpen ? "fa-times" : "fa-bars"} text-xl`}></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-[#181C1F] border-b border-[#22272B] transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[80vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-4 py-4 space-y-2">
            <a href="#" className="block px-4 py-3 text-base font-medium text-white hover:text-[#FF0000] hover:bg-white/5 rounded-lg transition-colors">Home</a>
            
            {/* Categories Section */}
            <div className="space-y-1">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="w-full text-left px-4 py-3 text-base font-medium text-white hover:text-[#FF0000] hover:bg-white/5 rounded-lg transition-colors flex justify-between items-center"
              >
                <span>Categories</span>
                <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : 'rotate-0'}`}></i>
              </button>
              <div className={`ml-4 space-y-1 border-l-2 border-[#22272B] pl-4 transition-all duration-300 ease-in-out overflow-hidden ${categoriesOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <a href="/subjects/core-competencies" className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors">Core Competencies</a>
                <a href="/subjects/core-values" className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors">Core Values</a>
                <a href="/subjects/languages" className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors">Languages</a>
                <a href="/subjects/mathematics" className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors">Mathematics</a>
                <a href="/subjects/science-technology" className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors">Science and Technology</a>
                <a href="/subjects/social-studies" className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors">Social Studies</a>
                <a href="/subjects/religious-education" className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors">Religious Education</a>
                <a href="/subjects/creative-arts" className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors">Creative Arts</a>
                <a href="/subjects/physical-health" className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors">Physical and Health Education</a>
                <a href="/subjects/agriculture-nutrition" className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors">Agriculture and Nutrition</a>
                <a href="/subjects/home-science" className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors">Home Science</a>
                <a href="/subjects/pre-technical-career" className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors">Pre-Technical and Pre-Career Education</a>
              </div>
            </div>

            <a href="/courses" className="block px-4 py-3 text-base font-medium text-white hover:text-[#FF0000] hover:bg-white/5 rounded-lg transition-colors">Courses</a>
            <a href="/pricing" className="block px-4 py-3 text-base font-medium text-white hover:text-[#FF0000] hover:bg-white/5 rounded-lg transition-colors">Pricing</a>
            <a href="/the-bird" className="block px-4 py-3 text-base font-medium text-white hover:text-[#FF0000] hover:bg-white/5 rounded-lg transition-colors">The Bird</a>
            <a href="/store" className="block px-4 py-3 text-base font-medium text-white hover:text-[#FF0000] hover:bg-white/5 rounded-lg transition-colors">Store</a>
            <a href="/forum" className="block px-4 py-3 text-base font-medium text-white hover:text-[#FF0000] hover:bg-white/5 rounded-lg transition-colors">Forum</a>
            

            {/* Start Learning Button */}
            <a href="#" className="block mx-4 mt-2 bg-[#FF0000] text-white py-3 rounded-lg text-center font-semibold text-base hover:bg-[#E40000] transition-colors">
              Start Learning
            </a>
          </div>
      </div>

      {/* Hero Section */}
      <header className="hero-bg bg-[#0F1112] h-screen flex items-center text-white" style={{ backgroundImage: `linear-gradient(rgba(15, 17, 18, 0.8), rgba(15, 17, 18, 0.8)), url(${heroBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-xs sm:text-sm mb-4 sm:mb-6 border border-white/20">
            <span className="bg-[#FF0000] text-white text-xs font-bold px-2 py-1 rounded-xl">NEW</span>
            AI Tutoring Platform for Kenyan Children
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-4 sm:mb-6">
            The Bird AI: Your Child's Personal AI Tutor,<br /><span className="text-[#FF0000]">Built for Kenya</span>
          </h1>
          
          <p className="text-16px sm:text-20px md:text-24px text-white/90 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed">
            Personalized learning aligned with the Competency-Based Curriculum (CBC). 
            Works offline. Safe for children. In English and Kiswahili. 
            Designed by Students for Students.
          </p>

          <div className="flex flex-col gap-3 sm:gap-4 justify-center">
            <a href="#features" className="bg-[#FF0000] hover:bg-[#E40000] text-white px-8 py-3 sm:px-10 sm:py-4 rounded-2xl sm:rounded-3xl font-semibold text-16px sm:text-18px flex items-center justify-center gap-2 sm:gap-3 transition-colors min-h-[44px]">
              Get Started Free
              <i className="fas fa-arrow-right"></i>
            </a>
            <a href="#how-it-works" className="border-2 border-white/30 hover:border-[#FF0000] hover:bg-[#FF0000]/20 px-8 py-3 sm:px-10 sm:py-4 rounded-2xl sm:rounded-3xl font-semibold text-16px sm:text-18px transition-colors min-h-[44px] flex items-center justify-center text-white/90 hover:text-white">
              How It Works
            </a>
          </div>

          <div className="mt-8 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-12px sm:text-14px text-white/80">
            <div className="flex items-center gap-2">
              <i className="fas fa-check text-[#FF0000]"></i>
              <span>Compliant with Kenya's Data Protection Act</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-check text-[#FF0000]"></i>
              <span>Parental consent required</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-check text-[#FF0000]"></i>
              <span>Offline mode available</span>
            </div>
          </div>
        </div>
      </header>

      {/* The Challenge Section */}
      <section className="py-16 sm:py-20 bg-[#181C1F]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-36px sm:text-48px font-bold mb-8 sm:mb-12 text-white">Every Child Deserves a Chance to Shine</h2>
          <p className="text-16px sm:text-20px text-white/90 max-w-3xl mx-auto leading-relaxed">
            In Kenya's urban informal settlements, bright children face overcrowded classrooms, 
            teacher shortages, and limited resources. Parents work hard but worry their child 
            is falling behind. Traditional schooling alone isn't enough to unlock every child's 
            full potential.
          </p>
        </div>
      </section>

      {/* Our Solution Section */}
      <section className="py-16 sm:py-20 bg-[#0F1112]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-36px sm:text-48px font-bold text-white mb-6">Meet The Bird AI – The Dedicated Tutor in Your Pocket</h2>
            <p className="text-16px sm:text-20px text-white/90 max-w-4xl mx-auto leading-relaxed">
              The Bird AI gives your child a patient, personalized tutor available anytime. 
              Using advanced AI (powered by xAI's Grok), it delivers one-on-one lessons, 
              conversations, and quizzes that follow Kenya's official CBC. It learns your 
              child's unique needs and adapts in real time — all while keeping data private and secure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature) => (
              <div key={feature.id} className="bg-[#181C1F] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#22272B] hover:border-[#FF0000]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF0000]/20">
                <div className="text-4xl sm:text-5xl mb-4 text-[#FF0000]">{feature.icon}</div>
                <h3 className="font-bold text-20px sm:text-24px text-white mb-3">{feature.title}</h3>
                <p className="text-14px sm:text-16px text-white/80 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-[#181C1F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-36px sm:text-48px font-bold text-white mb-6">Simple. Safe. Effective.</h2>
            <p className="text-16px sm:text-20px text-white/90 max-w-3xl mx-auto">Everything your child needs to succeed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-[#181C1F] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#22272B] text-center">
              <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">1</div>
              <h3 className="font-bold text-18px sm:text-20px text-white mb-3">Sign Up with Consent</h3>
              <p className="text-14px sm:text-16px text-white/80 leading-relaxed">Quick registration. Parent/guardian verifies and gives permission.</p>
            </div>
            
            <div className="bg-[#181C1F] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#22272B] text-center">
              <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">2</div>
              <h3 className="font-bold text-18px sm:text-20px text-white mb-3">Baseline Assessment</h3>
              <p className="text-14px sm:text-16px text-white/80 leading-relaxed">Your child does a short, fun activity so the AI understands their current level.</p>
            </div>
            
            <div className="bg-[#181C1F] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#22272B] text-center">
              <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">3</div>
              <h3 className="font-bold text-18px sm:text-20px text-white mb-3">Start Learning</h3>
              <p className="text-14px sm:text-16px text-white/80 leading-relaxed">Meet their personal AI tutor and begin chatting, learning, and growing.</p>
            </div>
            
            <div className="bg-[#181C1F] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#22272B] text-center">
              <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">4</div>
              <h3 className="font-bold text-18px sm:text-20px text-white mb-3">Track Progress</h3>
              <p className="text-14px sm:text-16px text-white/80 leading-relaxed">View reports anytime and celebrate achievements together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 sm:py-20 bg-[#0F1112]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-36px sm:text-48px font-bold mb-8 sm:mb-12 text-white">Real Learning Gains for Kenyan Children</h2>
          <p className="text-16px sm:text-20px text-white/90 max-w-3xl mx-auto mb-10 sm:mb-12 leading-relaxed">
            Early pilots and similar AI tutoring programs show up to 30% improvement in learning outcomes. 
            Our vision: 80%+ retention and measurable gains in CBC competencies.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="bg-[#181C1F] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#22272B] text-center">
              <div className="text-4xl sm:text-5xl mb-4 text-[#FF0000]">📱</div>
              <h3 className="font-bold text-18px sm:text-20px text-white mb-3">Works Offline</h3>
            </div>
            <div className="bg-[#181C1F] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#22272B] text-center">
              <div className="text-4xl sm:text-5xl mb-4 text-[#FF0000]">🗣️</div>
              <h3 className="font-bold text-18px sm:text-20px text-white mb-3">Multilingual Support</h3>
            </div>
            <div className="bg-[#181C1F] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#22272B] text-center">
              <div className="text-4xl sm:text-5xl mb-4 text-[#FF0000]">🛡️</div>
              <h3 className="font-bold text-18px sm:text-20px text-white mb-3">Child-Safe by Design</h3>
            </div>
          </div>

          <div className="text-16px sm:text-20px text-white/90">
            Children feel confident. Parents feel supported. Communities grow stronger.
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-20 bg-[#181C1F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-36px sm:text-48px font-bold text-white mb-6">What Kenyan Parents Are Saying</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-[#181C1F] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#22272B]">
                <div className="flex items-center gap-4 mb-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-white/80">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-14px sm:text-16px text-white/90 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-20 bg-[#0F1112]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-36px sm:text-48px font-bold text-white mb-6">Give Your Child the Light of Quality Education Today</h2>
          <p className="text-16px sm:text-20px text-white/90 max-w-3xl mx-auto mb-10 sm:mb-12 leading-relaxed">
            Join the The Bird AI pilot in Nairobi. Limited spots for families in informal settlements.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#" className="bg-[#FF0000] hover:bg-[#E40000] text-white px-8 py-3 sm:px-10 sm:py-4 rounded-2xl sm:rounded-3xl font-semibold text-16px sm:text-18px flex items-center justify-center gap-2 sm:gap-3 transition-colors min-h-[44px]">
              Enroll Your Child Now
              <i className="fas fa-arrow-right"></i>
            </a>
            <a href="#" className="border-2 border-white/30 hover:border-[#FF0000] hover:bg-[#FF0000]/20 px-8 py-3 sm:px-10 sm:py-4 rounded-2xl sm:rounded-3xl font-semibold text-16px sm:text-18px transition-colors min-h-[44px] flex items-center justify-center text-white/90 hover:text-white">
              Learn More for Schools & NGOs
            </a>
            <a href="#" className="border-2 border-white/30 hover:border-[#FF0000] hover:bg-[#FF0000]/20 px-8 py-3 sm:px-10 sm:py-4 rounded-2xl sm:rounded-3xl font-semibold text-16px sm:text-18px transition-colors min-h-[44px] flex items-center justify-center text-white/90 hover:text-white">
              Join Waitlist
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#181C1F] text-slate-400 py-12 sm:py-16 border-t border-[#22272B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 text-white mb-6">
                <div className="w-12 h-10 sm:w-14 sm:h-12 bg-[#FF0000] rounded-xl flex items-center justify-center text-lg sm:text-xl">UHS</div>
                <span className="text-xl sm:text-2xl font-semibold">The Bird AI</span>
              </div>
              <p className="text-sm text-white/80 mb-6">Light for Every Child's Future. Personalized AI tutoring for Kenyan children.</p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-[#22272B] rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-[#FF0000] transition-colors">
                  <i className="fab fa-x-twitter"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-[#22272B] rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-[#FF0000] transition-colors">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-[#22272B] rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-[#FF0000] transition-colors">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-[#22272B] rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-[#FF0000] transition-colors">
                  <i className="fab fa-whatsapp"></i>
                </a>
              </div>
            </div>
            
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div>
                  <h4 className="text-white font-semibold mb-6">Additional Links</h4>
                  <ul className="space-y-3">
                    <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Login</a></li>
                    <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Register</a></li>
                    <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Contact</a></li>
                    <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Certificate Validation</a></li>
                    <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Become Instructor</a></li>
                    <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">About</a></li>
                    <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Terms and Policies</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-6">Popular Categories</h4>
                  <ul className="space-y-3">
                    <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Development</a></li>
                    <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Business</a></li>
                    <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Marketing</a></li>
                    <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Lifestyle</a></li>
                    <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Health</a></li>
                    <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Academics</a></li>
                    <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Design</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-6">Platform</h4>
                  <ul className="space-y-3">
                    <li><a href="#features" className="text-sm text-white/80 hover:text-white transition-colors">Features</a></li>
                    <li><a href="#how-it-works" className="text-sm text-white/80 hover:text-white transition-colors">How It Works</a></li>
                    <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">For Schools</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-6">Contact Us</h4>
                  <div className="space-y-4">
                    <div className="text-sm text-white/80">
                      <p>Nairobi, Kenya</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-white/80">+254 799075061</p>
                      <p className="text-sm text-white/80">+254 799075061</p>
                    </div>
                    <div>
                      <a href="mailto:info@yurihub.ke" className="text-sm text-white/80 hover:text-white transition-colors">info@yurihub.ke</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-[#22272B] mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/60">© 2026 The Bird AI. All rights reserved.</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-white/60">
              <span>Committed to Kenya's Data Protection Act 2019</span>
              <span>Powered by xAI's Grok</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

    </div>
          } />
          
          {/* Direct Dashboard Routes */}
          <Route path="/dashboard/student" element={<DashboardStudent />} />
          <Route path="/dashboard/parent" element={<DashboardParent />} />
          <Route path="/dashboard/instructor" element={<DashboardInstructor />} />
          <Route path="/dashboard/admin" element={<DashboardAdmin />} />
          <Route path="/dashboard/partner" element={<DashboardPartner />} />
        </Routes>
      </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;