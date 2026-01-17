import React from 'react';
import PhoneAuthComponent from '../components/PhoneAuthComponent';
import Reveal from '../components/Reveal';

export default function PhoneLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="w-full max-w-md">
        <Reveal delay={0.05}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">GRAMS</h1>
            <p className="text-gray-600">Grievance Redressal And Management System</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <PhoneAuthComponent />
        </Reveal>

        <Reveal delay={0.14}>
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              By using this service, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
