import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  Heart,
  Shield,
  Lock,
  Server,
  Globe,
  CheckCircle,
  Award
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { 
      name: 'Facebook', 
      icon: Facebook, 
      url: 'https://facebook.com/grams', 
      color: 'hover:text-blue-400' 
    },
    { 
      name: 'Twitter', 
      icon: Twitter, 
      url: 'https://twitter.com/grams', 
      color: 'hover:text-sky-400' 
    },
    { 
      name: 'Instagram', 
      icon: Instagram, 
      url: 'https://www.instagram.com/_jemu_15/', 
      color: 'hover:text-pink-400' 
    },
    { 
      name: 'LinkedIn', 
      icon: Linkedin, 
      url: 'https://www.linkedin.com/in/jamunesh-sheta/', 
      color: 'hover:text-blue-500' 
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-400 border-t border-slate-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-6 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-10">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-bold text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3 flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 px-2 py-1 rounded text-sm sm:text-base">GRAMS</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4 leading-relaxed">
              Grievance Redressal And Monitoring System - Making government transparent and accountable.
            </p>
            {/* Social Links */}
            <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className={`p-1.5 sm:p-2 rounded-full bg-slate-800 text-slate-400 transition-all duration-300 ${social.color} hover:bg-slate-700 hover:scale-110`}
                    title={social.name}
                  >
                    <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-1.5 sm:space-y-2 md:space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 sm:gap-2 transition-colors group text-xs sm:text-sm"
                >
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/track" 
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 sm:gap-2 transition-colors group text-xs sm:text-sm"
                >
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                  Track Grievance
                </Link>
              </li>
              <li>
                <Link 
                  to="/transparency" 
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 sm:gap-2 transition-colors group text-xs sm:text-sm"
                >
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                  Transparency
                </Link>
              </li>
              <li>
                <Link 
                  to="/community" 
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 sm:gap-2 transition-colors group text-xs sm:text-sm"
                >
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-bold mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-1.5 sm:space-y-2 md:space-y-3">
              <li>
                <a 
                  href="#" 
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 sm:gap-2 transition-colors group text-xs sm:text-sm"
                >
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                  Documentation
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 sm:gap-2 transition-colors group text-xs sm:text-sm"
                >
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                  FAQ
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 sm:gap-2 transition-colors group text-xs sm:text-sm"
                >
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                  Blog
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 sm:gap-2 transition-colors group text-xs sm:text-sm"
                >
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-1.5 sm:space-y-2 md:space-y-3">
              <li>
                <a 
                  href="#" 
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 sm:gap-2 transition-colors group text-xs sm:text-sm"
                >
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 sm:gap-2 transition-colors group text-xs sm:text-sm"
                >
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                  Terms of Use
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 sm:gap-2 transition-colors group text-xs sm:text-sm"
                >
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                  Cookie Policy
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 sm:gap-2 transition-colors group text-xs sm:text-sm"
                >
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                  Accessibility
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white font-bold mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm uppercase tracking-wider">Get In Touch</h4>
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <Mail size={16} className="text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                <div className="text-xs sm:text-sm">
                  <p className="text-slate-300 font-medium">Email</p>
                  <a 
                    href="mailto:pdkalsaria@gmail.com" 
                    className="text-slate-400 hover:text-white transition-colors break-all"
                  >
                    pdkalsaria@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Phone size={16} className="text-green-400 mt-0.5 sm:mt-1 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                <div className="text-xs sm:text-sm">
                  <p className="text-slate-300 font-medium">Phone</p>
                  <a 
                    href="tel:+919909246267" 
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    +91-9909246267
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <MapPin size={16} className="text-red-400 mt-0.5 sm:mt-1 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                <div className="text-xs sm:text-sm">
                  <p className="text-slate-300 font-medium">Address</p>
                  <p className="text-slate-400">New Delhi, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-slate-700 rounded-lg p-3 sm:p-4 md:p-6 mb-6 sm:mb-8 md:mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 items-center">
            <div>
              <h3 className="text-white font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2">Stay Updated</h3>
              <p className="text-slate-400 text-xs sm:text-sm">Subscribe to get updates on grievance statuses and policy changes.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all hover:shadow-lg whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logos & Partners Section */}
      <div className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-6 py-4 sm:py-6 md:py-8">
          <p className="text-slate-400 text-[10px] sm:text-xs md:text-sm font-semibold mb-3 sm:mb-4 md:mb-6 uppercase tracking-wider">Trusted by Governments & Certified</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {/* Government of India */}
            <a 
              href="#" 
              className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center hover:from-blue-900/30 hover:to-slate-900 transition-all hover:shadow-lg hover:shadow-blue-500/20"
              title="Government of India"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-blue-500/5 group-hover:to-blue-500/10 transition-all"></div>
              <Globe size={28} className="text-blue-400 mb-1 sm:mb-2 relative z-10 group-hover:scale-110 transition-transform sm:w-9 sm:h-9 md:w-10 md:h-10" />
              <span className="text-white font-bold text-xs sm:text-sm relative z-10">Government</span>
              <span className="text-[10px] sm:text-xs text-slate-400 relative z-10">Approved</span>
            </a>

            {/* ISO 27001 */}
            <a 
              href="#" 
              className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center hover:from-green-900/30 hover:to-slate-900 transition-all hover:shadow-lg hover:shadow-green-500/20"
              title="ISO 27001 Certified"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/0 to-green-500/0 group-hover:from-green-500/10 group-hover:via-green-500/5 group-hover:to-green-500/10 transition-all"></div>
              <Award size={28} className="text-green-400 mb-1 sm:mb-2 relative z-10 group-hover:scale-110 transition-transform sm:w-9 sm:h-9 md:w-10 md:h-10" />
              <span className="text-white font-bold text-xs sm:text-sm relative z-10">ISO 27001</span>
              <span className="text-[10px] sm:text-xs text-slate-400 relative z-10">Security</span>
            </a>

            {/* GDPR Compliant */}
            <a 
              href="#" 
              className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center hover:from-purple-900/30 hover:to-slate-900 transition-all hover:shadow-lg hover:shadow-purple-500/20"
              title="GDPR Compliant"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:via-purple-500/5 group-hover:to-purple-500/10 transition-all"></div>
              <Shield size={28} className="text-purple-400 mb-1 sm:mb-2 relative z-10 group-hover:scale-110 transition-transform sm:w-9 sm:h-9 md:w-10 md:h-10" />
              <span className="text-white font-bold text-xs sm:text-sm relative z-10">GDPR</span>
              <span className="text-[10px] sm:text-xs text-slate-400 relative z-10">Compliant</span>
            </a>

            {/* SSL Secured */}
            <a 
              href="#" 
              className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center hover:from-yellow-900/30 hover:to-slate-900 transition-all hover:shadow-lg hover:shadow-yellow-500/20"
              title="SSL Secured"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:via-yellow-500/5 group-hover:to-yellow-500/10 transition-all"></div>
              <Lock size={28} className="text-yellow-400 mb-1 sm:mb-2 relative z-10 group-hover:scale-110 transition-transform sm:w-9 sm:h-9 md:w-10 md:h-10" />
              <span className="text-white font-bold text-xs sm:text-sm relative z-10">SSL</span>
              <span className="text-[10px] sm:text-xs text-slate-400 relative z-10">256-bit</span>
            </a>

            {/* Digital India */}
            <a 
              href="#" 
              className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center hover:from-orange-900/30 hover:to-slate-900 transition-all hover:shadow-lg hover:shadow-orange-500/20"
              title="Digital India Initiative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:via-orange-500/5 group-hover:to-orange-500/10 transition-all"></div>
              <Server size={28} className="text-orange-400 mb-1 sm:mb-2 relative z-10 group-hover:scale-110 transition-transform sm:w-9 sm:h-9 md:w-10 md:h-10" />
              <span className="text-white font-bold text-xs sm:text-sm relative z-10">Digital</span>
              <span className="text-[10px] sm:text-xs text-slate-400 relative z-10">India</span>
            </a>

            {/* E-Governance */}
            <a 
              href="#" 
              className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center hover:from-indigo-900/30 hover:to-slate-900 transition-all hover:shadow-lg hover:shadow-indigo-500/20"
              title="E-Governance Certified"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/10 group-hover:via-indigo-500/5 group-hover:to-indigo-500/10 transition-all"></div>
              <CheckCircle size={28} className="text-indigo-400 mb-1 sm:mb-2 relative z-10 group-hover:scale-110 transition-transform sm:w-9 sm:h-9 md:w-10 md:h-10" />
              <span className="text-white font-bold text-xs sm:text-sm relative z-10">E-Gov</span>
              <span className="text-[10px] sm:text-xs text-slate-400 relative z-10">Certified</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-6 py-3 sm:py-4 md:py-6 flex flex-col md:flex-row justify-between items-center gap-1.5 sm:gap-2 md:gap-4 text-[10px] sm:text-xs">
          <p className="text-slate-500 text-center md:text-left">
            © {currentYear} GRAMS. All rights reserved.
          </p>
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-slate-500 text-center">
            <span>Made with</span>
            <Heart size={12} className="text-red-500 fill-red-500 sm:w-[14px] sm:h-[14px]" />
            <span>by GRAMS Team</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
