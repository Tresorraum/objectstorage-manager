import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  CloudArrowUpIcon,
  ServerIcon,
  ClockIcon,
  ArrowPathIcon,
  ChartBarIcon,
  LockClosedIcon,
  BoltIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  RocketLaunchIcon,
  SparklesIcon,
  CubeTransparentIcon,
  CommandLineIcon,
  CodeBracketIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: CloudArrowUpIcon,
      title: 'S3-Compatible Storage',
      description: 'Connect to any S3-compatible storage including RustFS, MinIO, and AWS S3 with seamless integration',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: ServerIcon,
      title: 'PostgreSQL Backups',
      description: 'Instant PostgreSQL backups with pg_dump, intelligent compression, and multiple destination support',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      icon: ArrowPathIcon,
      title: 'One-Click Restore',
      description: 'Effortless database restoration from S3, VPS, or local files with full configuration control',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      icon: ClockIcon,
      title: 'Automated Scheduling',
      description: 'Set up cron-based backup schedules and never worry about manual backups again',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      icon: ChartBarIcon,
      title: 'Real-Time Analytics',
      description: 'Monitor storage usage, backup history, and system health with comprehensive dashboards',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      icon: LockClosedIcon,
      title: 'Enterprise Security',
      description: 'Self-hosted solution with encrypted connections ensuring your data stays completely private',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
  ];

  const useCases = [
    {
      title: 'Development Teams',
      description: 'Manage staging and production database backups across multiple environments with ease',
      icon: UserGroupIcon,
      gradient: 'from-blue-600 to-cyan-600',
    },
    {
      title: 'SaaS Companies',
      description: 'Automated backup workflows for customer databases with built-in compliance tracking',
      icon: RocketLaunchIcon,
      gradient: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Digital Agencies',
      description: 'Centralized backup management for all client projects in one unified dashboard',
      icon: BuildingOfficeIcon,
      gradient: 'from-green-600 to-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 sm:p-2.5 rounded-lg sm:rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <CloudArrowUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Storage Manager
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-1 sm:gap-2"
                >
                  <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden xs:inline">Dashboard</span>
                  <span className="xs:hidden">Go</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-gray-900 font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm sm:text-base"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <span className="hidden xs:inline">Get Started</span>
                    <span className="xs:hidden">Start</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-blue-700 mb-6 sm:mb-8 shadow-sm">
              <BoltIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Self-Hosted • Open Source • Production Ready</span>
              <span className="sm:hidden">Self-Hosted • Open Source</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-tight tracking-tight px-2">
              Database Backups
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Simplified & Automated
              </span>
            </h1>
            
            <p className="text-base sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed font-light px-4">
              Enterprise-grade backup management for PostgreSQL databases and S3 storage.
              <br className="hidden sm:block" />
              Schedule, monitor, and restore with confidence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group"
              >
                Start Free
                <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://github.com/NesoHQ/storage-manager"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-gray-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-800 transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
              >
                <CodeBracketIcon className="h-5 w-5" />
                View on GitHub
              </a>
              <a
                href="#features"
                className="w-full sm:w-auto bg-white text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg"
              >
                Explore Features
              </a>
            </div>

            {/* GitHub Stats Badge */}
            <div className="flex items-center justify-center gap-4 mb-10 sm:mb-16 px-4">
              <a
                href="https://github.com/NesoHQ/storage-manager"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md group"
              >
                <StarIcon className="h-4 w-4 text-yellow-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">Star on GitHub</span>
              </a>
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
                <span className="text-xs font-semibold text-gray-500">MIT License</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto px-2">
              {[
                { value: '100%', label: 'Open Source', icon: CubeTransparentIcon },
                { value: '3+', label: 'Storage Types', icon: ServerIcon },
                { value: '∞', label: 'Databases', icon: CommandLineIcon },
                { value: '24/7', label: 'Automated', icon: ClockIcon },
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2 sm:mb-3" />
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-blue-700 mb-4 sm:mb-6">
              <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Powerful Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Protect Your Data
              </span>
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Enterprise-grade features designed for modern backup workflows
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`${feature.bgColor} w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-12 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-purple-700 mb-4 sm:mb-6">
              <UserGroupIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Trusted By Teams</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Built For Teams
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Like Yours
              </span>
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Trusted by development teams, agencies, and SaaS companies worldwide
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <div className={`relative bg-gradient-to-br ${useCase.gradient} w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg`}>
                  <useCase.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 relative">
                  {useCase.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed relative">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 px-4 py-2 rounded-full text-sm font-semibold text-green-700 mb-6">
              <CheckCircleIcon className="h-4 w-4" />
              <span>Simple Setup</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Get Started in
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Three Easy Steps
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple setup process, powerful results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Connect Your Storage',
                description: 'Add your S3, PostgreSQL, or VPS instances in seconds with our intuitive interface',
                icon: CloudArrowUpIcon,
                gradient: 'from-blue-600 to-cyan-600',
              },
              {
                step: '02',
                title: 'Create Backup Jobs',
                description: 'Schedule automated backups or run them instantly with customizable configurations',
                icon: ClockIcon,
                gradient: 'from-purple-600 to-pink-600',
              },
              {
                step: '03',
                title: 'Monitor & Restore',
                description: 'Track everything in real-time and restore with one click whenever you need',
                icon: ChartBarIcon,
                gradient: 'from-green-600 to-emerald-600',
              },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className={`relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${item.gradient} shadow-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="h-10 w-10 text-white" />
                  <div className="absolute -top-3 -right-3 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-gray-100">
                    <span className="text-sm font-bold text-gray-900">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-green-700 mb-4 sm:mb-6">
              <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Simple Setup</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Get Started in
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Three Easy Steps
              </span>
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Simple setup process, powerful results
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                step: '01',
                title: 'Connect Your Storage',
                description: 'Add your S3, PostgreSQL, or VPS instances in seconds with our intuitive interface',
                icon: CloudArrowUpIcon,
                gradient: 'from-blue-600 to-cyan-600',
              },
              {
                step: '02',
                title: 'Create Backup Jobs',
                description: 'Schedule automated backups or run them instantly with customizable configurations',
                icon: ClockIcon,
                gradient: 'from-purple-600 to-pink-600',
              },
              {
                step: '03',
                title: 'Monitor & Restore',
                description: 'Track everything in real-time and restore with one click whenever you need',
                icon: ChartBarIcon,
                gradient: 'from-green-600 to-emerald-600',
              },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className={`relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.gradient} shadow-xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg border-2 border-gray-100">
                    <span className="text-xs sm:text-sm font-bold text-gray-900">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-4">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 px-4">
            Ready to Secure Your Data?
          </h2>
          <p className="text-base sm:text-xl text-blue-100 mb-6 sm:mb-10 px-4">
            Join teams who trust Rückhalt for their backup needs. 100% open source.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-2xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <a
              href="https://github.com/NesoHQ/storage-manager"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-gray-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <CodeBracketIcon className="h-5 w-5" />
              View on GitHub
            </a>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg border-2 border-blue-500 hover:bg-blue-800 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 sm:p-2 rounded-lg">
                  <CloudArrowUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-white font-bold text-sm sm:text-base">Rückhalt</span>
              </div>
              <p className="text-xs sm:text-sm mb-3">
                Self-hosted backup solution for modern teams
              </p>
              <a
                href="https://github.com/NesoHQ/storage-manager"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <CodeBracketIcon className="h-4 w-4" />
                Open Source on GitHub
              </a>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="https://github.com/NesoHQ/storage-manager" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="https://github.com/NesoHQ/storage-manager#readme" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Community</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="https://github.com/NesoHQ/storage-manager/issues" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Issues</a></li>
                <li><a href="https://github.com/NesoHQ/storage-manager/discussions" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discussions</a></li>
                <li><a href="https://github.com/NesoHQ/storage-manager/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contributing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
            <p>
              Powered by{' '}
              <a href="https://zendevz.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                ZenDevz
              </a>
              {' '}• Built in{' '}
              <a href="https://nesohq.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                NesoHQ
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
