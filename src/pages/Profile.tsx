import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Code, Palette, Github, Figma, Zap, Users, CheckCircle2,
  Trophy, Rocket, Sparkles, Target, Music, Gamepad2, Heart,
} from 'lucide-react';
import { supabase, type Profile } from '../lib/supabase';

const PROGRAM_SKILLS = [
  { name: 'HTML', icon: Code },
  { name: 'CSS', icon: Palette },
  { name: 'GitHub', icon: Github },
  { name: 'Figma', icon: Figma },
  { name: 'Bolt.ai', icon: Zap },
  { name: 'Teamwork / Research', icon: Users },
];

const MILESTONES = [
  { title: 'Built SnapNutrition home page', icon: Code },
  { title: 'Created food scanner feature', icon: Zap },
  { title: 'Designed food detail page', icon: Palette },
  { title: 'Published live app', icon: Rocket },
];

const SHARED_TRAITS = [
  { text: 'Everyone enjoys listening to music', icon: Music },
  { text: 'Everyone likes playing video games', icon: Gamepad2 },
];

export default function ProfilePage() {
  const { name } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'progress'>('about');

  useEffect(() => {
    async function fetchProfile() {
      if (!name) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', name)
        .limit(1)
        .maybeSingle();
      setProfile(data);
      setLoading(false);
    }
    fetchProfile();
  }, [name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full border-4 border-primary-100 animate-pulse-ring" />
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 font-display">Profile Not Found</h1>
        <Link to="/" className="text-primary-500 hover:underline font-medium">Go Home</Link>
      </div>
    );
  }

  const isJosiah = profile.name === 'Josiah';
  const renderBiography = (bio: string) =>
    bio.split('\n\n').map((paragraph, idx) => (
      <p key={idx} className="text-gray-600 leading-relaxed mb-4 last:mb-0">{paragraph}</p>
    ));

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-cream to-white/50">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-300/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />

        <div className="relative max-w-2xl mx-auto px-6 py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <div className="flex flex-col items-center text-center pb-8 animate-fade-up">
            <div className="relative mb-6">
              {profile.image_url ? (
                <img
                  src={profile.image_url}
                  alt={profile.name}
                  className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-white/30"
                />
              ) : (
                <div className="w-36 h-36 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white shadow-xl ring-4 ring-white/30">
                  <span className="text-5xl font-bold text-white font-display">{profile.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-3 font-display tracking-tight">{profile.name}</h1>
            <div className="inline-flex items-center px-5 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
              <span className="font-medium">{profile.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-6 pt-6">
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-card border border-gray-100/80">
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'about'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            About
          </button>
          {isJosiah && (
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'progress'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Progress Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {activeTab === 'about' && (
          <>
            {/* About / Biography */}
            <div className="surface p-6 animate-fade-up">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 font-display">About</h2>
              {profile.biography ? (
                renderBiography(profile.biography)
              ) : (
                <p className="text-gray-400 italic">No biography available yet.</p>
              )}
            </div>

            {/* GitHub Badge */}
            {profile.github_username && (
              <div className="surface surface-hover p-6 animate-fade-up">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 font-display">GitHub</h2>
                <a
                  href={`https://github.com/${profile.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all hover:scale-105 font-medium text-sm"
                >
                  <Github className="w-5 h-5" />
                  @{profile.github_username}
                </a>
              </div>
            )}

            {/* About Me / Interests */}
            {profile.interests && (
              <div className="surface p-6 animate-fade-up">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 font-display">About Me</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.split(',').map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-3 py-1.5 bg-green-50/80 text-primary-600 rounded-full text-sm font-medium border border-green-100/80 hover:scale-105 transition-transform cursor-default"
                    >
                      {interest.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Fun Fact + Goal Callouts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up">
              {profile.fun_fact && (
                <div className="relative bg-gradient-to-br from-amber-50 to-amber-100/80 rounded-2xl p-6 shadow-card border border-amber-200/60 overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
                  <div className="relative flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-sm">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-amber-800 font-display">Fun Fact</h3>
                  </div>
                  <p className="relative text-amber-900 text-sm leading-relaxed">{profile.fun_fact}</p>
                </div>
              )}
              {profile.goal && (
                <div className="relative bg-gradient-to-br from-primary-50 to-green-100/80 rounded-2xl p-6 shadow-card border border-green-200/60 overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-200/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
                  <div className="relative flex items-center gradient-2 mb-2">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-sm">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-primary-700 font-display">Goal</h3>
                  </div>
                  <p className="relative text-primary-800 text-sm leading-relaxed">{profile.goal}</p>
                </div>
              )}
            </div>

            {/* What We Have in Common */}
            <div className="surface p-6 animate-fade-up">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-800 font-display">What We Have in Common</h2>
              </div>
              <ul className="space-y-3">
                {SHARED_TRAITS.map((trait) => {
                  const Icon = trait.icon;
                  return (
                    <li key={trait.text} className="flex items-center gap-3 p-3 bg-green-50/80 rounded-xl border border-green-100/80 hover:bg-green-50 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{trait.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}

        {activeTab === 'progress' && isJosiah && <ProgressDashboard />}
      </div>
    </div>
  );
}

function ProgressDashboard() {
  const currentWeek = 5;
  const totalWeeks = 6;
  const progressPercent = Math.round((currentWeek / totalWeeks) * 100);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-2 pt-2">
        <Trophy className="w-6 h-6 text-primary-500" />
        <h2 className="text-xl font-bold text-gray-800 font-display">My Progress Dashboard</h2>
      </div>
      <p className="text-sm text-gray-500 -mt-4">
        Tracking my journey through the Teen Tech Launchpad program.
      </p>

      <div className="surface p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800 font-display">Program Progress</h3>
          <span className="text-sm font-bold text-primary-500 tabular-nums">Week {currentWeek} of {totalWeeks}</span>
        </div>
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-700" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="text-right text-sm text-gray-500 mt-2 tabular-nums">{progressPercent}% complete</p>
      </div>

      <div className="surface p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 font-display">Skills Learned</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PROGRAM_SKILLS.map((skill) => {
            const Icon = skill.icon;
            return (
              <div key={skill.name} className="flex items-center gap-3 p-3 bg-green-50/80 rounded-xl border border-green-100/80 hover:bg-green-50 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{skill.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary-500" />
                    <span className="text-xs text-primary-500 font-medium">Learned</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="surface p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 font-display">Milestones</h3>
        <ul className="space-y-4">
          {MILESTONES.map((m, idx) => {
            const Icon = m.icon;
            return (
              <li key={m.title} className="flex items-center gap-4">
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 z-10">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {idx < MILESTONES.length - 1 && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-green-100" />
                  )}
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <CheckCircle2 className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{m.title}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="surface p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 font-display">Reflection</h3>
        <div className="p-4 bg-green-50/80 rounded-xl border border-green-100/80">
          <p className="text-gray-700 leading-relaxed text-sm">
            I'm proud of creating my own website with Team Awesome Sauce and turning my own idea into a working application. The experience showed me how to take a concept from a blank screen all the way to a published product. Next, I'd build a feature that lets users set personal nutrition goals and track their progress over time.
          </p>
        </div>
      </div>
    </div>
  );
}
