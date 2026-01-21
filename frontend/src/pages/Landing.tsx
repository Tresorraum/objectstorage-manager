import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  CloudArrowUpIcon,
  ServerIcon,
  ClockIcon,
  ArrowPathIcon,
  ChartBarIcon,
  LockClosedIcon,
  BoltIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function Landing() {
  const features = [
    {
      icon: CloudArrowUpIcon,
      title: 'S3-Compatible Storage',
      description: 'Connect to any S3-compatible storage including RustFS, MinIO, and AWS S3',
      color: 'blue',
    },
    {
      icon: ServerIcon,
      title: 'PostgreSQL Backups',
      description: 'Instant PostgreSQL backups with pg_dump, compression, and multiple destinations',
      color: 'purple',
    },
    {
      icon: ArrowPathIcon,
      title: 'Easy Restore',
      description: 'One-click restore from S3, VPS, or local files with full configuration control',
      color: 'green',
    },
    {
      icon: ClockIcon,
      title: 'Scheduled Backups',
      description: 'Automate your backup workflow with cron-based scheduling',
      color: 'orange',
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Monitoring',
      description: 'Track storage usage, backup history, and system health in real-time',
      color: 'indigo',
    },
    {
      icon: LockClosedIcon,
      title: 'Secure & Private',
      description: 'Your data stays yours. Self-hosted solution with encrypted connections',
      color: 'red',
    },
  ];

  const useCases = [
    {
      title: 'Development Teams',
      description: 'Manage staging and production database backups across multiple environments',
      icon: '👥',
    },
    {
      title: 'SaaS Companies',
      description: 'Automated backup workflows for customer databases with compliance tracking',
      icon: '🚀',
    },
    {
      title: 'Agencies',
      description: 'Centralized backup management for all client projects in one dashboard',
      icon: '🏢',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                <CloudArrowUpIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Storage Manager
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <BoltIcon className="h-4 w-4" />
            <span>Self-Hosted Backup Solution</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Backup & Restore
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Manage PostgreSQL backups, S3 storage, and VPS servers from one powerful dashboard.
            Automated scheduling, instant restores, and complete control over your data.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg"
            >
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-blue-600 mb-1">100%</div>
              <div className="text-sm text-gray-600">Open Source</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-indigo-600 mb-1">3+</div>
              <div className="text-sm text-gray-600">Storage Types</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-purple-600 mb-1">∞</div>
              <div className="text-sm text-gray-600">Databases</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-green-600 mb-1">24/7</div>
              <div className="text-sm text-gray-600">Automated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed for modern backup workflows
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`bg-${feature.color}-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6`}>
                <feature.icon className={`h-7 w-7 text-${feature.color}-600`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built For Teams Like Yours
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trusted by development teams, agencies, and SaaS companies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200"
              >
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Get Started in Minutes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple setup, powerful results
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Connect Your Storage
            </h3>
            <p className="text-gray-600">
              Add your S3, PostgreSQL, or VPS instances in seconds
            </p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Create Backup Jobs
            </h3>
            <p className="text-gray-600">
              Schedule automated backups or run them instantly
            </p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Monitor & Restore
            </h3>
            <p className="text-gray-600">
              Track everything and restore with one click when needed
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Secure Your Data?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join teams who trust Storage Manager for their backup needs
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg border-2 border-blue-500 hover:bg-blue-800 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <CloudArrowUpIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-bold">Storage Manager</span>
              </div>
              <p className="text-sm">
                Self-hosted backup solution for modern teams
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Storage Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
