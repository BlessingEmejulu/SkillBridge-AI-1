import React from 'react';
import { Briefcase, TrendingUp, DollarSign, MapPin, Building2, ExternalLink } from 'lucide-react';

export default function JobMarket() {
  const jobs = [
    { title: 'Senior Frontend Developer', company: 'TechCorp', location: 'Remote', salary: '$120k - $150k', match: 92 },
    { title: 'React Engineer', company: 'Innovate.io', location: 'New York, NY', salary: '$110k - $140k', match: 88 },
    { title: 'UI/UX Developer', company: 'DesignStudio', location: 'San Francisco, CA', salary: '$130k - $160k', match: 85 }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Job Market Insights</h1>
        <p className="text-slate-500 mt-2">AI-matched opportunities and market trends for your skillset.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Market Trend</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-600 mb-1">+14%</p>
          <p className="text-sm text-slate-500">Demand for React developers in the last 6 months.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Avg. Salary</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">$135,000</p>
          <p className="text-sm text-slate-500">For Senior Frontend roles in your region.</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 pt-4">AI Job Matches</h2>
      <div className="space-y-4">
        {jobs.map((job, i) => (
          <div 
            key={i}
            
            
            
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between"
          >
            <div className="space-y-2 mb-4 sm:mb-0">
              <div className="flex items-center space-x-3">
                <h3 className="font-bold text-lg text-slate-900">{job.title}</h3>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">{job.match}% Match</span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                <div className="flex items-center space-x-1">
                  <Building2 className="w-4 h-4" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{job.salary}</span>
                </div>
              </div>
            </div>
            
            <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg font-medium transition-colors border border-slate-200">
              <span>View Role</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
