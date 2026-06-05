import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ShieldAlert, 
  Coffee, 
  Clock, 
  MapPin, 
  Award,
  HelpCircle,
  HelpCircleIcon,
  ChevronsRight,
  TrendingUp
} from 'lucide-react';

export default function FreshersPack() {
  const glossary = [
    { 
      term: 'Muffins', 
      definition: 'The highly popular canteen bakery located in the mechanical lab yard. Best known for hot Paneer Puffs, Samosas, and frozen cold coffee. Perfect for standard tea breaks if you can beat the crowd.' 
    },
    { 
      term: 'CAT (Continuous Assessment Test)', 
      definition: 'Internal exams held three times per semester. They form 50% of your internal grade marks. NEVER skip these - repairing low CAT grades is twice as difficult as scoring average in final university exams.' 
    },
    { 
      term: 'OD (On Duty)', 
      definition: 'The golden ticket of college life. It grants official attendance while you represent the college in sports, symposiums, or hackathons. Ensure you turn in your OD slip within 3 days of returning to campus.' 
    },
    { 
      term: 'ML (Medical Leave)', 
      definition: 'Only accepted for prolonged hospitalizations. Must carry signed certificates from accredited general practitioners and submit to your HOD immediately before semester portals wrap up.' 
    },
    { 
      term: 'T&P Cell (Training & Placement)', 
      definition: 'The department in charge of your future career. They coordinate Zoho, TCS, and external drives. They are extremely strict about grooming (clean shaven, formals) during placement weeks.' 
    }
  ];

  const survivalFaqs = [
    {
      q: 'How strict is the dress code at Rajalakshmi Engineering College?',
      a: 'Very strict on paper and during internal audits. Boys must wear formal trousers and leather shoes; sneakers are strictly banned during regular laboratory reviews. Collared shirts are mandatory. Girls must wear conventional salwar kameez with pinned shawls. ID cards on neck lanyard are checked at the gates daily!'
    },
    {
      q: 'What is the absolute golden advice for maintaining a great CGPA?',
      a: 'Keep your CGPA above 8.2 in the first three semesters. Why? First-semester subjects are math and physics, which are easier to score "O" grades compared to heavier third-year systems/compiler subjects. Most high-paying companies like Amazon or Zoho restrict interview entry to students with cgpa > 8.0 without active backlogs.'
    },
    {
      q: 'I forgot my college bus pass. Can I still commute on the route buses?',
      a: 'Yes, but don\'t try to sneak onto the bus and panic. Go straight to the Transport Desk behind the Administrative Block before 2:45 PM and ask for a temporary single-trip slip. They will check your details and issue it immediately. Keep this slip ready for the route checker!'
    },
    {
      q: 'Where do seniors study without distraction?',
      a: 'The Central Library is decent, but the absolute premium silent zone with power laptops plug is on the 2nd Floor back desks (behind IEEE archives). It is air-conditioned, mostly silent, and researchers rarely head there. Perfect for core practice sessions!'
    }
  ];

  return (
    <div className="space-y-6" id="freshers-pack-layout text-xs select-none">
      {/* Hero Welcome Pack */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border-b-4 border-yellow-400">
        <div className="absolute top-0 right-0 p-3 opacity-15">
          <Sparkles className="w-48 h-48 text-yellow-300 animate-pulse" />
        </div>
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="bg-yellow-400 text-violet-950 font-black tracking-widest text-[10px] uppercase px-2 py-1 rounded inline-block">
            REC Chennai Survival Guide
          </span>
          <h2 className="font-sans font-black text-2xl tracking-tight leading-none">
            Everything I Wish I Knew Before Joining <span className="text-yellow-300">REC</span>
          </h2>
          <p className="text-slate-300 text-xs leading-relaxed max-w-lg font-light">
            Welcome to Rajalakshmi Engineering College! This unofficial starter packet compiled by seniors helps you navigate from day one without losing your attendance margins or internal CGPA grades.
          </p>
        </div>
      </div>

      {/* Grid of Roadmap and Starter Secrets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Glossary Terms Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
            <h3 className="font-sans font-extrabold text-slate-900 text-base mb-1.5 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-violet-750" />
              <span>Campus Glossary (The Lingo)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-normal">
              Words you will hear daily on campus corridors. Understand what they actually mean before getting confused!
            </p>

            <div className="divide-y divide-slate-100">
              {glossary.map((g) => (
                <div key={g.term} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black px-2 py-0.5 bg-violet-50/70 text-violet-800 rounded-md border border-violet-100 font-mono">
                      {g.term}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed font-normal">{g.definition}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
            <h3 className="font-sans font-extrabold text-slate-900 text-base mb-1 flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-violet-750" />
              <span>Seniors Answers Book (F.A.Qs)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-normal">
              Direct, unvarnished guidance on standard freshmen problems. No corporate marketing fluff.
            </p>

            <div className="space-y-4">
              {survivalFaqs.map((faq, idx) => (
                <div key={idx} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/70 space-y-2">
                  <h4 className="font-sans font-bold text-slate-900 text-xs flex items-start space-x-1.5">
                    <span className="text-violet-750 font-mono">Q.</span>
                    <span>{faq.q}</span>
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed font-normal pl-4 border-l border-violet-200">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Roadmap Sidebar Column */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-sans font-extrabold text-slate-900 text-base flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <span>CGPA & Placement Guide</span>
            </h3>
            
            <div className="space-y-4">
              <div className="border-l-2 border-yellow-400 pl-3.5 space-y-1 relative">
                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block">First Year (Sem 1 & 2)</span>
                <h4 className="font-bold text-slate-800 text-xs">Build the Foundation</h4>
                <p className="text-slate-500 text-xs leading-relaxed font-normal">
                  Maximize score in Engineering Mathematics-1, 2 and Basic Electronics. Highly scoring subjects. Target a minimum GPA of 8.5 to shield yourself from harder CSE/IT core labs.
                </p>
              </div>

              <div className="border-l-2 border-violet-500 pl-3.5 space-y-1 relative">
                <span className="text-[10px] text-violet-700 font-bold uppercase tracking-wider block">Second Year (Sem 3 & 4)</span>
                <h4 className="font-bold text-slate-800 text-xs">DSA & Core Algorithms</h4>
                <p className="text-slate-500 text-xs leading-relaxed font-normal">
                  Data Structures and Discrete Math are taught here. Solve standard LeetCode patterns now. Do not delay DSA until the final placement week, or you will struggle during OAs.
                </p>
              </div>

              <div className="border-l-2 border-slate-200 pl-3.5 space-y-1 relative">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Third Year (Sem 5 & 6)</span>
                <h4 className="font-bold text-slate-800 text-xs">Resume, Projects & Internships</h4>
                <p className="text-slate-500 text-xs leading-relaxed font-normal">
                  Attend campus hackathons, pick responsive electives like Cloud Computing, and apply for startups. Connect with product company alumni on LinkedIn for referrals.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-violet-750 text-white p-5 rounded-2xl space-y-3 relative border-b-4 border-violet-950 shadow-md">
            <h3 className="font-sans font-extrabold text-sm text-yellow-300 flex items-center space-x-1.5 uppercase tracking-wide">
              <span>★ Golden Advice Sheet</span>
            </h3>
            <p className="text-[11.5px] leading-relaxed text-slate-100 font-light">
              "NEVER fight with the laboratory staff or physical education trainers. In autonomous colleges, local internal marks hold 50% margins. Stay polite, turn in records printed on time, and have a beautiful, clean-shaven session."
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
