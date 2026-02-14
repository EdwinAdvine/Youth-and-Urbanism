import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store';
import AuthModal from '../auth/AuthModal';

const categories = [
  { title: "Core Competencies", slug: "core-competencies" },
  { title: "Core Values", slug: "core-values" },
  { title: "Languages", slug: "languages" },
  { title: "Mathematics", slug: "mathematics" },
  { title: "Science and Technology", slug: "science-technology" },
  { title: "Social Studies", slug: "social-studies" },
  { title: "Religious Education", slug: "religious-education" },
  { title: "Creative Arts", slug: "creative-arts" },
  { title: "Physical and Health Education", slug: "physical-health" },
  { title: "Agriculture and Nutrition", slug: "agriculture-nutrition" },
  { title: "Home Science", slug: "home-science" },
  { title: "Pre-Technical and Pre-Career Education", slug: "pre-technical-career" },
];

const PublicHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.categories-dropdown-container')) {
        setCategoriesDropdownOpen(false);
      }
      if (!target.closest('.profile-dropdown-container')) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuthSuccess = (authUser: any) => {
    setIsAuthModalOpen(false);
    const role = authUser?.role || user?.role || 'student';
    navigate(`/dashboard/${role}`, { replace: true });
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      <nav className={`bg-white dark:bg-[#181C1F] border-b border-gray-200 dark:border-[#22272B] sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md shadow-black/50' : 'shadow-sm'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-12 h-10 sm:w-14 sm:h-12 bg-[#FF0000] rounded-xl flex items-center justify-center text-gray-900 dark:text-white font-bold text-lg sm:text-xl">UHS</div>
              <span className="hidden lg:inline text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Urban Home School</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center justify-center space-x-4 lg:space-x-6 xl:space-x-8">
                <Link to="/" className="font-medium text-base text-gray-900 dark:text-white hover:text-[#FF0000] transition-colors">Home</Link>

                {/* Categories Dropdown */}
                <div className="relative categories-dropdown-container">
                  <button
                    onMouseEnter={() => setCategoriesDropdownOpen(true)}
                    className="font-medium text-base text-gray-900 dark:text-white hover:text-[#FF0000] transition-colors flex items-center gap-1"
                    aria-haspopup="true"
                    aria-expanded={categoriesDropdownOpen}
                  >
                    Categories
                    <svg className={`w-4 h-4 transition-transform duration-200 ${categoriesDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  <div
                    className={`absolute top-full left-0 mt-2 w-[48rem] bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl shadow-xl shadow-black/30 overflow-hidden transition-all duration-200 ease-in-out transform ${
                      categoriesDropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
                    }`}
                    onMouseLeave={() => setCategoriesDropdownOpen(false)}
                  >
                    <div className="p-3 grid grid-cols-2 gap-1">
                      {categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          to={`/categories/${cat.slug}`}
                          className="block px-4 py-2.5 text-sm text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors"
                          onClick={() => setCategoriesDropdownOpen(false)}
                        >
                          {cat.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <Link to="/courses" className="font-medium text-base text-gray-900 dark:text-white hover:text-[#FF0000] transition-colors">Courses</Link>
                <Link to="/pricing" className="font-medium text-base text-gray-900 dark:text-white hover:text-[#FF0000] transition-colors">Pricing</Link>
                <Link to="/the-bird" className="font-medium text-base text-gray-900 dark:text-white hover:text-[#FF0000] transition-colors">The Bird</Link>
                <Link to="/store" className="font-medium text-base text-gray-900 dark:text-white hover:text-[#FF0000] transition-colors">Store</Link>
                <Link to="/forum" className="font-medium text-base text-gray-900 dark:text-white hover:text-[#FF0000] transition-colors">Forum</Link>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                )}
              </button>

              {isAuthenticated && user ? (
                /* Authenticated Profile Dropdown */
                <div className="relative profile-dropdown-container">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="hidden md:flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-300 dark:border-white/20"
                  >
                    <div className="w-7 h-7 bg-[#FF0000] rounded-full flex items-center justify-center text-gray-900 dark:text-white text-xs font-bold">
                      {user.full_name?.[0] || user.email?.[0] || 'U'}
                    </div>
                    <span className="text-sm">{user.full_name?.split(' ')[0] || 'Profile'}</span>
                    <svg className={`w-4 h-4 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  <div className={`absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl shadow-xl shadow-black/30 overflow-hidden transition-all duration-200 ${
                    profileDropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
                  }`}>
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider">Signed in as {user.role}</div>
                      <Link to={`/dashboard/${user.role}`} className="block px-3 py-2 text-sm text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors" onClick={() => setProfileDropdownOpen(false)}>Dashboard</Link>
                      <Link to="/profile" className="block px-3 py-2 text-sm text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors" onClick={() => setProfileDropdownOpen(false)}>Profile</Link>
                      <Link to="/settings" className="block px-3 py-2 text-sm text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors" onClick={() => setProfileDropdownOpen(false)}>Settings</Link>
                      <Link to="/pricing" className="block px-3 py-2 text-sm text-[#FF0000] hover:bg-[#FF0000]/10 rounded-lg transition-colors font-medium" onClick={() => setProfileDropdownOpen(false)}>Upgrade Plan</Link>
                      <hr className="border-gray-200 dark:border-[#22272B] my-1" />
                      <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors">Logout</button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Login/Sign Up Button */
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden md:flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors text-base rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-300 dark:border-white/20"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span>Login / Sign Up</span>
                </button>
              )}

              <Link
                to={isAuthenticated ? `/dashboard/${user?.role || 'student'}` : '/how-it-works'}
                className="bg-[#FF0000] hover:bg-[#E40000] text-gray-900 dark:text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-colors text-center whitespace-nowrap"
              >
                {isAuthenticated ? 'Dashboard' : 'Get Started Free'}
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-white dark:bg-[#181C1F] border-b border-gray-200 dark:border-[#22272B] sticky top-16 z-40 transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[80vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 py-4 space-y-2">
          <Link to="/" className="block px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-[#FF0000] hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</Link>

          {/* Categories Accordion */}
          <div className="space-y-1">
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="w-full text-left px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-[#FF0000] hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors flex justify-between items-center"
            >
              <span>Categories</span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div className={`ml-4 space-y-1 border-l-2 border-gray-200 dark:border-[#22272B] pl-4 transition-all duration-300 ease-in-out overflow-hidden ${categoriesOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {categories.map((cat) => (
                <Link key={cat.slug} to={`/categories/${cat.slug}`} className="block px-3 py-2 text-sm text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-[#FF0000]/10 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  {cat.title}
                </Link>
              ))}
            </div>
          </div>

          <Link to="/courses" className="block px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-[#FF0000] hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Courses</Link>
          <Link to="/pricing" className="block px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-[#FF0000] hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
          <Link to="/the-bird" className="block px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-[#FF0000] hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>The Bird</Link>
          <Link to="/store" className="block px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-[#FF0000] hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Store</Link>
          <Link to="/forum" className="block px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-[#FF0000] hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Forum</Link>
          <Link to="/how-it-works" className="block px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-[#FF0000] hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>

          {isAuthenticated && user ? (
            <>
              <hr className="border-gray-200 dark:border-[#22272B]" />
              <Link to={`/dashboard/${user.role}`} className="block px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-[#FF0000] hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-[#FF0000] hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">Logout</button>
            </>
          ) : (
            <>
              <hr className="border-gray-200 dark:border-[#22272B]" />
              <button onClick={() => { setIsAuthModalOpen(true); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-[#FF0000] hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">Login / Sign Up</button>
            </>
          )}

          <Link to={isAuthenticated ? `/dashboard/${user?.role || 'student'}` : '/how-it-works'} className="block mx-4 mt-2 bg-[#FF0000] text-gray-900 dark:text-white py-3 rounded-lg text-center font-semibold text-base hover:bg-[#E40000] transition-colors" onClick={() => setMobileMenuOpen(false)}>
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
          </Link>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default PublicHeader;
