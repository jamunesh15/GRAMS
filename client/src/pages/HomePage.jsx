import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Reveal from '../components/Reveal';
import MotionImage from '../components/MotionImage';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen mt-10 sm:mt-12 md:mt-10 bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 overflow-x-hidden">
      {/* Hero Section */}
      <div className="bg-gradient-to-br mt-6 sm:mt-8 md:mt-10 from-green-600 via-emerald-600 to-teal-700 pt-8 sm:pt-12 md:pt-16 pb-6 sm:pb-8 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-300 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 grid lg:grid-cols-2 gap-6 sm:gap-8 items-center relative z-10">
          {/* Left Content */}
          <Reveal className="space-y-3 sm:space-y-4">
            {/* Badge */}
            <span className="inline-block bg-white/20 backdrop-blur-md text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide border border-white/40 shadow-lg animate-bounce">
              ● OFFICIAL PORTAL
            </span>
            
            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-2xl">
              Smarter<br />Governance,<br />
              <span className="text-yellow-300 animate-pulse">Faster Resolution.</span>
            </h1>
            
            {/* Description */}
            <p className="text-sm sm:text-base text-green-50 max-w-lg leading-relaxed">
              A unified platform for Citizens, Engineers, and Administrators to report, track, and resolve civic issues efficiently.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
              <Link to="/register" className="bg-white text-green-700 px-5 py-2.5 sm:px-7 sm:py-3 rounded-xl font-bold hover:bg-yellow-100 transition-all shadow-2xl hover:shadow-yellow-200 hover:scale-110 transform duration-300 flex items-center justify-center gap-2 animate-pulse text-sm sm:text-base">
                <span>→</span> Get Started
              </Link>
              <Link to="/transparency" className="bg-green-800 text-white border-2 border-white/30 px-5 py-2.5 sm:px-7 sm:py-3 rounded-xl font-bold hover:bg-green-900 transition-all shadow-xl hover:scale-110 transform duration-300 flex items-center justify-center gap-2 text-sm sm:text-base">
                📊 View Transparency
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Reveal delay={0.1}>
                <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-xl hover:scale-110 hover:bg-white/30 transition-all duration-300 transform">
                  <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg">12k+</p>
                  <p className="text-[8px] sm:text-[10px] font-bold text-green-100 uppercase tracking-wide">Issues Solved</p>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-xl hover:scale-110 hover:bg-white/30 transition-all duration-300 transform">
                  <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg">48h</p>
                  <p className="text-[8px] sm:text-[10px] font-bold text-green-100 uppercase tracking-wide">Avg Time</p>
                </div>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-xl hover:scale-110 hover:bg-white/30 transition-all duration-300 transform">
                  <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg">500+</p>
                  <p className="text-[8px] sm:text-[10px] font-bold text-green-100 uppercase tracking-wide">Villages</p>
                </div>
              </Reveal>
            </div>
          </Reveal>

          {/* Right Image */}
          <Reveal delay={0.2} className="hidden lg:block">
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/40 bg-white hover:scale-105 hover:rotate-1 transition-all duration-500 transform">
              <MotionImage 
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=500&fit=crop" 
                alt="Community Infrastructure & Civic Services" 
                className="w-full h-full object-cover"
                hoverScale={1.1}
              />
            </div>
          </Reveal>
        </div> 
      </div>

      {/* What is GRAMS Section */}
      <div className="bg-gradient-to-br from-white via-green-50 to-blue-50 py-6 sm:py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase shadow-lg">About GRAMS</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 drop-shadow-md px-4">Centralized Grievance Redressal System</h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-3xl mx-auto px-4">
                GRAMS is a transparent, accountable platform that connects citizens with local authorities to resolve civic issues efficiently.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <Reveal delay={0.1}>
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 sm:p-5 rounded-2xl shadow-2xl border-2 border-green-300 hover:scale-105 md:hover:scale-110 hover:shadow-green-400 transition-all duration-300 transform md:hover:-rotate-2 min-h-[280px] sm:min-h-80">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl flex items-center justify-center text-green-600 text-xl sm:text-2xl mb-2 sm:mb-3 shadow-lg animate-bounce">✓</div>
                <h3 className="font-extrabold text-lg sm:text-xl text-white mb-2 drop-shadow-md">File Complaint</h3>
                <p className="text-green-50 text-xs sm:text-sm leading-relaxed">
                  Citizens can report civic issues like water supply, road damage, streetlights, waste management with photo evidence.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 sm:p-5 rounded-2xl shadow-2xl border-2 border-blue-300 hover:scale-105 md:hover:scale-110 hover:shadow-blue-400 transition-all duration-300 transform md:hover:rotate-2 min-h-[280px] sm:min-h-80">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 text-xl sm:text-2xl mb-2 sm:mb-3 shadow-lg animate-bounce" style={{animationDelay: '0.2s'}}>⚡</div>
                <h3 className="font-extrabold text-lg sm:text-xl text-white mb-2 drop-shadow-md">Assign & Track</h3>
                <p className="text-blue-50 text-xs sm:text-sm leading-relaxed">
                  Administrators assign complaints to field engineers who work on-ground to resolve issues with real-time updates.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 sm:p-5 rounded-2xl shadow-2xl border-2 border-orange-300 hover:scale-105 md:hover:scale-110 hover:shadow-orange-400 transition-all duration-300 transform md:hover:-rotate-2 min-h-[280px] sm:min-h-80">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl flex items-center justify-center text-orange-600 text-xl sm:text-2xl mb-2 sm:mb-3 shadow-lg animate-bounce" style={{animationDelay: '0.4s'}}>👁️</div>
                <h3 className="font-extrabold text-lg sm:text-xl text-white mb-2 drop-shadow-md">Public Transparency</h3>
                <p className="text-orange-50 text-xs sm:text-sm leading-relaxed">
                  Unresolved issues escalate to public view after 7 days, creating accountability pressure on authorities.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* 7-Day Escalation */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 py-6 sm:py-8 md:py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <Reveal>
            <div className="text-center mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase shadow-2xl animate-pulse">Core Policy</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-3 drop-shadow-2xl px-4">7-Day Accountability Rule</h2>
              <p className="text-sm sm:text-base text-slate-200 mt-2 max-w-3xl mx-auto px-4">
                Every grievance must be resolved within 7 days. Automatic public escalation creates accountability.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Reveal delay={0.1}>
              <div className="bg-white/20 backdrop-blur-lg border-2 border-white/40 rounded-2xl p-3 sm:p-4 shadow-2xl hover:scale-105 md:hover:scale-110 hover:bg-white/30 transition-all duration-300 transform">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-extrabold text-base sm:text-lg mb-2 shadow-xl">1</div>
                <p className="text-[10px] sm:text-xs font-bold text-green-300 uppercase">Day 0-2</p>
                <h4 className="font-extrabold text-white mt-1 text-base sm:text-lg">Filing & Review</h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">Citizen files complaint. Admin assigns within 24 hours.</p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="bg-white/20 backdrop-blur-lg border-2 border-white/40 rounded-2xl p-3 sm:p-4 shadow-2xl hover:scale-105 md:hover:scale-110 hover:bg-white/30 transition-all duration-300 transform">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-extrabold text-base sm:text-lg mb-2 shadow-xl">2</div>
                <p className="text-[10px] sm:text-xs font-bold text-blue-300 uppercase">Day 3-5</p>
                <h4 className="font-extrabold text-white mt-1 text-base sm:text-lg">Active Work</h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">Engineer inspects and performs resolution work.</p>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="bg-white/20 backdrop-blur-lg border-2 border-white/40 rounded-2xl p-3 sm:p-4 shadow-2xl hover:scale-105 md:hover:scale-110 hover:bg-white/30 transition-all duration-300 transform">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-extrabold text-base sm:text-lg mb-2 shadow-xl">3</div>
                <p className="text-[10px] sm:text-xs font-bold text-yellow-300 uppercase">Day 6-7</p>
                <h4 className="font-extrabold text-white mt-1 text-base sm:text-lg">Final Deadline</h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">Must be resolved by day 7 or escalates publicly.</p>
              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <div className="bg-white/20 backdrop-blur-lg border-2 border-white/40 rounded-2xl p-3 sm:p-4 shadow-2xl hover:scale-105 md:hover:scale-110 hover:bg-white/30 transition-all duration-300 transform">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-extrabold text-base sm:text-lg mb-2 shadow-xl">4</div>
                <p className="text-[10px] sm:text-xs font-bold text-red-300 uppercase">Day 8+</p>
                <h4 className="font-extrabold text-white mt-1 text-base sm:text-lg">Escalation</h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">Ticket becomes public, creating public pressure.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-6 sm:py-8 md:py-10 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 right-1/3 w-80 h-80 bg-purple-300 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-300 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <Reveal>
            <div className="text-center mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase shadow-2xl animate-bounce">Process</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-900 to-pink-900 bg-clip-text text-transparent mt-3 drop-shadow-2xl px-4">How GRAMS Works</h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { num: 1, title: 'Report Issue', desc: 'Citizens file complaints via mobile or web with photos and location.', gradient: 'from-green-400 to-emerald-600' },
              { num: 2, title: 'Auto-Assignment', desc: 'System assigns ticket to ward engineer based on location.', gradient: 'from-blue-400 to-cyan-600' },
              { num: 3, title: 'Resolution Work', desc: 'Engineer visits site, performs work, uploads proof photos.', gradient: 'from-purple-400 to-violet-600' },
              { num: 4, title: 'Citizen Feedback', desc: 'Citizen verifies resolution and rates service.', gradient: 'from-pink-400 to-rose-600' }
            ].map((step, idx) => (
              <Reveal key={step.num} delay={idx * 0.15}>
                <div className={`bg-gradient-to-br ${step.gradient} p-4 sm:p-5 rounded-2xl shadow-2xl relative hover:scale-105 md:hover:scale-110 md:hover:rotate-2 transition-all duration-300 transform group`}>
                  <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center text-slate-900 font-black text-lg sm:text-xl shadow-2xl group-hover:scale-125 transition-transform border-4 border-white/50">{step.num}</div>
                  <div className="mt-4 sm:mt-6">
                    <h4 className="font-extrabold text-base sm:text-lg text-white mb-2 drop-shadow-lg">{step.title}</h4>
                    <p className="text-xs sm:text-sm text-white/90 font-medium">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-6 sm:py-8 md:py-10 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-300 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <Reveal>
              <div>
                <span className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase shadow-2xl">Benefits</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-orange-900 to-red-900 bg-clip-text text-transparent mt-3 mb-4 sm:mb-5 drop-shadow-xl">Why GRAMS is Different</h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <Reveal delay={0.1}>
                    <div className="flex gap-2 sm:gap-3 bg-white/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 border-2 border-green-200">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 mb-1 text-base sm:text-lg">Full Transparency</h4>
                        <p className="text-slate-700 text-xs sm:text-sm font-medium">Every complaint status is visible to citizens. No hidden processes or lost tickets.</p>
                      </div>
                    </div>
                  </Reveal>

                  <Reveal delay={0.2}>
                    <div className="flex gap-2 sm:gap-3 bg-white/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 border-2 border-blue-200">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 mb-1 text-base sm:text-lg">Time-Bound Action</h4>
                        <p className="text-slate-700 text-xs sm:text-sm font-medium">7-day deadline ensures issues don't linger. Automatic escalation creates urgency.</p>
                      </div>
                    </div>
                  </Reveal>

                  <Reveal delay={0.3}>
                    <div className="flex gap-2 sm:gap-3 bg-white/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 border-2 border-orange-200">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10h.01M11 10h.01M7 10h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 mb-1 text-base sm:text-lg">Community Pressure</h4>
                        <p className="text-slate-700 text-xs sm:text-sm font-medium">Delayed complaints become public. Citizens can upvote to prioritize critical issues.</p>
                      </div>
                    </div>
                  </Reveal>

                  <Reveal delay={0.4}>
                    <div className="flex gap-2 sm:gap-3 bg-white/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 border-2 border-purple-200">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 mb-1 text-base sm:text-lg">Proof-Based Resolution</h4>
                        <p className="text-slate-700 text-xs sm:text-sm font-medium">Engineers must upload photos of completed work. Citizens verify before closure.</p>
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.5}>
              <div className="relative">
                <div className="bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 rounded-3xl p-2 shadow-2xl hover:scale-105 transition-transform duration-500 border-4 border-white/50">
                  <MotionImage src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop&auto=format" alt="Citizens using GRAMS" className="rounded-2xl shadow-lg mb-4" />
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 px-2 sm:px-4 pb-3 sm:pb-4">
                  <div className="bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg hover:scale-110 transition-transform">
                    <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">92%</p>
                    <p className="text-[10px] sm:text-xs text-slate-700 font-extrabold">Resolution Rate</p>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg hover:scale-110 transition-transform">
                    <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">3.2d</p>
                    <p className="text-[10px] sm:text-xs text-slate-700 font-extrabold">Avg Resolution</p>
                  </div>
                </div>
              </div>
            </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 py-8 sm:py-10 md:py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.3),transparent_50%)]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-2xl animate-pulse px-4">Ready to Make Your Voice Heard?</h2>
            <p className="text-base sm:text-lg text-white/95 mb-5 sm:mb-6 font-semibold drop-shadow-lg px-4">Join thousands of citizens using GRAMS to improve their communities. Report issues, track progress, and hold authorities accountable.</p>
          </Reveal>
          
          <Reveal delay={0.2}>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
              <Link to="/login" className="bg-white text-green-700 px-6 py-3 sm:px-10 sm:py-4 rounded-2xl font-black text-base sm:text-lg hover:scale-110 hover:shadow-2xl transition-all duration-300 shadow-xl transform md:hover:-rotate-1">
                Sign Up Now
              </Link>
            <Link to="/login" className="bg-green-800 text-white px-6 py-3 sm:px-10 sm:py-4 rounded-2xl font-black text-base sm:text-lg hover:scale-110 hover:shadow-2xl transition-all duration-300 border-4 border-white/30 shadow-xl transform md:hover:rotate-1">
              Track Existing Complaint
            </Link>
          </div>
          </Reveal>
        </div>
      </div>

    </div>
  );
}
