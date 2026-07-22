import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ChevronDown } from 'lucide-react';
import type { Profile } from '../lib/supabase';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProfiles() {
      const { data } = await supabase.from('profiles').select('*').order('name');
      if (data) setProfiles(data);
    }
    fetchProfiles();
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 right-0 z-50">
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 mt-5 mr-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-card border border-gray-100/80 hover:shadow-card-hover hover:bg-white transition-all duration-300"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700">About</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-6 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100/80 overflow-hidden animate-scale-in origin-top-right">
            <div className="px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-white font-semibold text-sm relative">SnapNutrition Team</h3>
              <p className="text-white/80 text-xs mt-0.5 relative">Meet our creators</p>
            </div>
            <div className="py-2">
              {profiles.map((profile) => (
                <Link
                  key={profile.id}
                  to={`/profile/${profile.name.toLowerCase()}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/80 transition-colors border-b border-gray-50 last:border-0 group"
                >
                  {profile.image_url ? (
                    <img
                      src={profile.image_url}
                      alt={profile.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-100 transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center ring-2 ring-primary-100 transition-transform group-hover:scale-105">
                      <span className="text-white font-bold text-lg font-display">{profile.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w0">
                    <p className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">{profile.name}</p>
                    <p className="text-xs text-gray-500 truncate">{profile.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
