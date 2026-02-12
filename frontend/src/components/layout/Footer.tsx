import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#181C1F] text-slate-400 py-12 sm:py-16 border-t border-[#22272B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 text-white mb-6">
              <div className="w-12 h-10 sm:w-14 sm:h-12 bg-[#FF0000] rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold">UHS</div>
              <span className="text-xl sm:text-2xl font-semibold">The Bird AI</span>
            </Link>
            <p className="text-sm text-white/80 mb-6">Light for Every Child's Future. Personalized AI tutoring for Kenyan children.</p>
            <div className="flex gap-3">
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#22272B] rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-[#FF0000] transition-colors" aria-label="X (Twitter)">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#22272B] rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-[#FF0000] transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#22272B] rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-[#FF0000] transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="https://wa.me/254799075061" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#22272B] rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-[#FF0000] transition-colors" aria-label="WhatsApp">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <h4 className="text-white font-semibold mb-6">Quick Links</h4>
                <ul className="space-y-3">
                  <li><Link to="/about" className="text-sm text-white/80 hover:text-white transition-colors">About Us</Link></li>
                  <li><Link to="/contact" className="text-sm text-white/80 hover:text-white transition-colors">Contact</Link></li>
                  <li><Link to="/certificate-validation" className="text-sm text-white/80 hover:text-white transition-colors">Certificate Validation</Link></li>
                  <li><Link to="/become-instructor" className="text-sm text-white/80 hover:text-white transition-colors">Become an Instructor</Link></li>
                  <li><Link to="/pricing" className="text-sm text-white/80 hover:text-white transition-colors">Scholarship</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-6">Popular Categories</h4>
                <ul className="space-y-3">
                  <li><Link to="/categories/mathematics" className="text-sm text-white/80 hover:text-white transition-colors">Mathematics</Link></li>
                  <li><Link to="/categories/science-technology" className="text-sm text-white/80 hover:text-white transition-colors">Science & Technology</Link></li>
                  <li><Link to="/categories/languages" className="text-sm text-white/80 hover:text-white transition-colors">Languages</Link></li>
                  <li><Link to="/categories/social-studies" className="text-sm text-white/80 hover:text-white transition-colors">Social Studies</Link></li>
                  <li><Link to="/categories/creative-arts" className="text-sm text-white/80 hover:text-white transition-colors">Creative Arts</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-6">Platform</h4>
                <ul className="space-y-3">
                  <li><Link to="/courses" className="text-sm text-white/80 hover:text-white transition-colors">Courses</Link></li>
                  <li><Link to="/the-bird" className="text-sm text-white/80 hover:text-white transition-colors">The Bird AI</Link></li>
                  <li><Link to="/store" className="text-sm text-white/80 hover:text-white transition-colors">Store</Link></li>
                  <li><Link to="/forum" className="text-sm text-white/80 hover:text-white transition-colors">Forum</Link></li>
                  <li><Link to="/how-it-works" className="text-sm text-white/80 hover:text-white transition-colors">How It Works</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-6">Contact Us</h4>
                <div className="space-y-4">
                  <p className="text-sm text-white/80">Nairobi, Kenya</p>
                  <p className="text-sm text-white/80">+254 799 075 061</p>
                  <a href="mailto:info@urbanhomeschool.co.ke" className="text-sm text-white/80 hover:text-white transition-colors block">info@urbanhomeschool.co.ke</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#22272B] mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/60">&copy; 2026 Urban Home School. All rights reserved.</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-white/60 text-center sm:text-right">
            <span>Committed to Kenyan Data Protection Act 2019</span>
            <span>Powered by The Bot AI. Youth and Urbanism.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
