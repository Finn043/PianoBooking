export function PianoHeader() {
  return (
    <header className="bg-piano-black text-piano-white py-12 relative overflow-hidden">
      {/* Piano keyboard pattern decoration */}
      <div className="absolute inset-0 piano-keys opacity-5"></div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 text-center relative z-10">
        {/* Logo/brand */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-3">
            {/* Piano icon */}
            <svg
              className="w-12 h-12 text-piano-accent"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="2" y="4" width="20" height="16" rx="1" fill="#f8f6f3"/>
              <rect x="4" y="4" width="2" height="12" fill="#1a1a1a"/>
              <rect x="7" y="4" width="2" height="12" fill="#1a1a1a"/>
              <rect x="13" y="4" width="2" height="12" fill="#1a1a1a"/>
              <rect x="16" y="4" width="2" height="12" fill="#1a1a1a"/>
            </svg>
            <h1 className="text-4xl md:text-5xl font-display font-semibold text-piano-white">
              Hannah&apos;s Piano Class
            </h1>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-piano-white/90 font-light mb-8">
          Book your piano lesson online
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          <div className="inline-flex items-center gap-2 bg-piano-accent/20 backdrop-blur-sm px-4 py-2 rounded-full border border-piano-accent/30">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
            <span className="text-sm font-medium">Online & Offline Lessons</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-piano-accent/20 backdrop-blur-sm px-4 py-2 rounded-full border border-piano-accent/30">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-sm font-medium">All Skill Levels Welcome</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-piano-accent/20 backdrop-blur-sm px-4 py-2 rounded-full border border-piano-accent/30">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 00-2.812 2.812c-.051.643-.304 1.254-.723 1.745a3.066 3.066 0 000 3.976 3.066 3.066 0 00-1.745.723 3.066 3.066 0 00-2.812 2.812c-.051.643-.304 1.254-.723 1.745a3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 00-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 002.812-2.812c.051-.643.304-1.254.723-1.745z"/>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/>
            </svg>
            <span className="text-sm font-medium">Flexible Scheduling</span>
          </div>
        </div>
      </div>
    </header>
  );
}
