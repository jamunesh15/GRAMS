import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';

export default function HelpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromDashboard = location.state?.fromDashboard;
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      category: 'Getting Started',
      icon: '🚀',
      questions: [
        {
          q: 'How do I file a grievance?',
          a: 'Click on the "New Complaint" button in the navigation bar. Fill out the form with details about your issue, upload supporting photos if available, and submit. You\'ll receive a unique tracking ID to monitor your complaint status.'
        },
        {
          q: 'Do I need to create an account?',
          a: 'Yes, you need to register with your phone number or email to file and track grievances. This helps us maintain accountability and keep you updated on your complaint status.'
        },
        {
          q: 'What information do I need to provide?',
          a: 'You\'ll need to provide your contact details, a description of the issue, location (address or map pin), category of the grievance, and optionally, photos or documents as evidence.'
        }
      ]
    },
    {
      category: 'Tracking & Status',
      icon: '📍',
      questions: [
        {
          q: 'How can I track my grievance?',
          a: 'Use your unique Tracking ID on the "Track" page. You can also view all your submitted grievances in your Dashboard after logging in.'
        },
        {
          q: 'What do the different statuses mean?',
          a: 'Pending: Your complaint is awaiting review. In Progress: Authorities are working on resolving it. Resolved: The issue has been addressed. Rejected: The complaint doesn\'t meet criteria or is duplicate.'
        },
        {
          q: 'How long does it take to resolve a grievance?',
          a: 'Resolution time varies by issue complexity and category. On average, most grievances are resolved within 7-10 days. You can check the Performance page to see category-wise resolution times.'
        }
      ]
    },
    {
      category: 'Community Features',
      icon: '👥',
      questions: [
        {
          q: 'What is the Community page?',
          a: 'The Community page shows public grievances from your neighborhood. You can upvote issues that affect you too, helping authorities prioritize urgent matters.'
        },
        {
          q: 'How does upvoting work?',
          a: 'Click the upvote button on any community issue. More upvotes indicate higher community concern, helping authorities prioritize which issues to address first.'
        },
        {
          q: 'Can I see others\' grievances?',
          a: 'You can see public grievances in the Community section. Your own grievances are private and visible only in your Dashboard unless you choose to make them public.'
        }
      ]
    },
    {
      category: 'Account & Privacy',
      icon: '🔒',
      questions: [
        {
          q: 'Is my information secure?',
          a: 'Yes, we use industry-standard encryption to protect your data. Your personal information is never shared with third parties without your consent.'
        },
        {
          q: 'Can I update my grievance after submission?',
          a: 'You can add comments and additional photos to your grievance, but you cannot edit the original details. This maintains transparency and prevents misuse.'
        },
        {
          q: 'How do I delete my account?',
          a: 'Contact support through the contact form below or email us. We\'ll process your request within 48 hours while ensuring any active grievances are properly handled.'
        }
      ]
    },
    {
      category: 'Technical Support',
      icon: '⚙️',
      questions: [
        {
          q: 'Why can\'t I upload photos?',
          a: 'Ensure your photos are under 5MB and in JPG, PNG, or WebP format. Check your internet connection and browser permissions for file uploads.'
        },
        {
          q: 'The website is not loading properly',
          a: 'Try clearing your browser cache, using a different browser, or checking your internet connection. We support Chrome, Firefox, Safari, and Edge (latest versions).'
        },
        {
          q: 'I forgot my password',
          a: 'Click "Forgot Password" on the login page. Enter your registered email or phone number to receive a password reset link.'
        }
      ]
    }
  ];

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email Support',
      value: 'support@grams.gov.in',
      description: 'Get response within 24 hours',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '📞',
      title: 'Phone Support',
      value: '1800-XXX-XXXX',
      description: 'Mon-Fri, 9 AM to 6 PM',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      value: 'Chat with us',
      description: 'Available 24/7',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🏢',
      title: 'Visit Office',
      value: 'Municipal Corporation',
      description: 'Main Road, City - 110001',
      color: 'from-orange-500 to-amber-500'
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
        />
      </div>

      <Navbar />

      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 relative z-20 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Back Button for Dashboard Navigation */}
          {fromDashboard && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 sm:mb-6"
            >
              <motion.button
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <span>←</span> Back to Dashboard
              </motion.button>
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block mb-3 sm:mb-4"
            >
              <span className="text-4xl sm:text-5xl md:text-6xl">❓</span>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4 drop-shadow-lg px-4">
              How Can We Help?
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-700 font-medium max-w-2xl mx-auto px-4">
              Find answers to common questions or reach out to our support team
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-12"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 sm:px-6 sm:py-4 sm:pl-14 rounded-xl sm:rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all duration-300 text-sm sm:text-base md:text-lg shadow-lg"
              />
              <svg
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </motion.div>

          {/* FAQ Sections */}
          <div className="space-y-6 sm:space-y-8 mb-12 sm:mb-14 md:mb-16">
            {filteredFaqs.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border-2 border-white/50"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                  <span className="text-2xl sm:text-3xl md:text-4xl">{category.icon}</span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {category.category}
                  </h2>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {category.questions.map((faq, index) => {
                    const faqId = `${categoryIndex}-${index}`;
                    const isOpen = openFaq === faqId;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-2 border-slate-200 rounded-lg sm:rounded-xl overflow-hidden hover:border-purple-300 transition-all duration-300"
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : faqId)}
                          className="w-full px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white hover:from-purple-50 hover:to-pink-50 transition-all duration-300"
                        >
                          <span className="font-bold text-slate-900 text-left text-sm sm:text-base md:text-lg">
                            {faq.q}
                          </span>
                          <motion.svg
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0 ml-2 sm:ml-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </motion.svg>
                        </button>
                        <motion.div
                          initial={false}
                          animate={{
                            height: isOpen ? 'auto' : 0,
                            opacity: isOpen ? 1 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-50 text-slate-700 text-sm sm:text-base leading-relaxed">
                            {faq.a}
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Methods */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border-2 border-white/50"
          >
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Still Need Help?
              </h2>
              <p className="text-sm sm:text-base text-slate-600">Choose your preferred way to reach us</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-slate-100 hover:border-purple-300 cursor-pointer"
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-3 sm:mb-4 mx-auto`}>
                    <span className="text-2xl sm:text-3xl md:text-4xl">{method.icon}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-center mb-2 text-sm sm:text-base">
                    {method.title}
                  </h3>
                  <p className={`text-xs sm:text-sm font-semibold bg-gradient-to-r ${method.color} bg-clip-text text-transparent text-center mb-2`}>
                    {method.value}
                  </p>
                  <p className="text-xs text-slate-500 text-center">
                    {method.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 sm:mt-10 md:mt-12 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-white/50"
          >
            <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 mb-4 sm:mb-5 md:mb-6 text-center">
              💡 Quick Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/70 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md"
              >
                <div className="text-2xl sm:text-3xl mb-2">📸</div>
                <h4 className="font-bold text-slate-900 mb-2 text-sm sm:text-base">Add Photos</h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  Include clear photos to help authorities understand the issue better
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/70 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md"
              >
                <div className="text-2xl sm:text-3xl mb-2">📍</div>
                <h4 className="font-bold text-slate-900 mb-2 text-sm sm:text-base">Precise Location</h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  Provide exact location or use map pin for faster resolution
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/70 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md"
              >
                <div className="text-2xl sm:text-3xl mb-2">🔔</div>
                <h4 className="font-bold text-slate-900 mb-2 text-sm sm:text-base">Stay Updated</h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  Check your tracking ID regularly for status updates
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
