import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import { resolveMediaUrl } from '../../utils/media';
import type { About, ApiResponse, Blog, Project, Resource, Skill } from '../../types/cms';
import { useDocumentTitle, DEFAULT_TITLE } from '../../utils/useDocumentTitle';
import AboutSection from '../../components/public/AboutSection';
import ProjectsSection from '../../components/public/ProjectsSection';
import SkillsSection from '../../components/public/SkillsSection';
import BlogsSection from '../../components/public/BlogsSection';
import ContactSection from '../../components/public/ContactSection';

const DEFAULT_HERO_PARAGRAPH =
  "I'm Wilson Rodrigues. I architect and engineer premium, high-performance web applications and scalable cloud infrastructure for forward-thinking brands.";

export default function HomePage() {
  useDocumentTitle(DEFAULT_TITLE);
  const [reloadKey, setReloadKey] = useState(0);
  const [about, setAbout] = useState<Resource<About | null>>({ status: 'loading' });
  const [projects, setProjects] = useState<Resource<Project[]>>({ status: 'loading' });
  const [skills, setSkills] = useState<Resource<Skill[]>>({ status: 'loading' });
  const [blogs, setBlogs] = useState<Resource<Blog[]>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    api
      .get<ApiResponse<About | null>>('/about')
      .then((res) => {
        if (cancelled) return;
        if (res.data.success) {
          setAbout({ status: 'ready', data: res.data.data ?? null });
        } else {
          setAbout({ status: 'error', message: res.data.message || 'Failed to load profile.' });
        }
      })
      .catch((err) => {
        if (!cancelled) setAbout({ status: 'error', message: getApiErrorMessage(err) });
      });

    api
      .get<ApiResponse<Project[]>>('/projects/public')
      .then((res) => {
        if (cancelled) return;
        if (res.data.success) {
          setProjects({ status: 'ready', data: res.data.data ?? [] });
        } else {
          setProjects({ status: 'error', message: res.data.message || 'Failed to load projects.' });
        }
      })
      .catch((err) => {
        if (!cancelled) setProjects({ status: 'error', message: getApiErrorMessage(err) });
      });

    api
      .get<ApiResponse<Skill[]>>('/skills/public', { params: { public: 'true' } })
      .then((res) => {
        if (cancelled) return;
        if (res.data.success) {
          setSkills({ status: 'ready', data: res.data.data ?? [] });
        } else {
          setSkills({ status: 'error', message: res.data.message || 'Failed to load skills.' });
        }
      })
      .catch((err) => {
        if (!cancelled) setSkills({ status: 'error', message: getApiErrorMessage(err) });
      });

    api
      .get<ApiResponse<Blog[]>>('/blogs/public')
      .then((res) => {
        if (cancelled) return;
        if (res.data.success) {
          setBlogs({ status: 'ready', data: res.data.data ?? [] });
        } else {
          setBlogs({ status: 'error', message: res.data.message || 'Failed to load articles.' });
        }
      })
      .catch((err) => {
        if (!cancelled) setBlogs({ status: 'error', message: getApiErrorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const handleRetry = () => {
    setAbout({ status: 'loading' });
    setProjects({ status: 'loading' });
    setSkills({ status: 'loading' });
    setBlogs({ status: 'loading' });
    setReloadKey((key) => key + 1);
  };

  const aboutData = about.status === 'ready' ? about.data : null;

  const heroBadge = aboutData?.headline ?? 'Full-Stack Engineer & Architect';
  const heroParagraph = aboutData
    ? `I'm ${aboutData.name}. ${aboutData.subheadline || aboutData.bio}`
    : DEFAULT_HERO_PARAGRAPH;
  const heroYears =
    aboutData?.yearsOfExperience != null ? `${aboutData.yearsOfExperience}+` : '5+';
  const heroAvatar = resolveMediaUrl(aboutData?.avatar) ?? '/images/portrait.png';
  const heroAvatarAlt = aboutData?.name ?? 'Wilson Rodrigues';

  let availabilityLabel = 'Open for Work';
  let availabilityAvailable = true;
  if (aboutData) {
    availabilityAvailable = aboutData.availableForWork;
    availabilityLabel = availabilityAvailable
      ? aboutData.availabilityNote?.trim() || 'Open for Work'
      : 'Currently Unavailable';
  }

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 overflow-hidden">
        {/* Background Decorative 3D Shape */}
        <motion.img
          src="/images/glass_shape.png"
          alt="3D Shape"
          className="absolute right-[-10%] top-[10%] w-[600px] h-auto object-cover opacity-40 mix-blend-screen pointer-events-none"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 py-12">
          {/* Left Column: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-left"
          >
            <div className="inline-block px-4 py-2 rounded-full glass-panel mb-6 border-accent-primary/30">
              <span className="text-sm font-medium text-gradient-accent tracking-wide uppercase">
                {heroBadge}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
              Building <br />
              <span className="text-gradient-accent">Digital Products</span>
              <br />
              With Precision.
            </h1>

            <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-lg leading-relaxed">
              {heroParagraph}
            </p>

            <div className="flex flex-wrap gap-5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToProjects}
                className="px-8 py-4 bg-text-primary text-bg-color font-bold rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                Explore My Work
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToContact}
                className="px-8 py-4 glass-panel font-medium rounded-full hover:bg-white/10 transition-colors border border-white/20"
              >
                Contact Me
              </motion.button>
            </div>

            <div className="mt-12 flex items-center gap-8 text-text-muted">
              <div className="flex flex-col">
                <span className="text-3xl font-display font-bold text-text-primary">
                  {heroYears}
                </span>
                <span className="text-xs uppercase tracking-wider">Years Exp.</span>
              </div>
              <div className="w-px h-10 bg-border-color"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-display font-bold text-text-primary">20+</span>
                <span className="text-xs uppercase tracking-wider">Projects</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Image & Glass Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            className="relative h-[600px] w-full flex items-center justify-center lg:justify-end"
          >
            {/* Main Portrait Image */}
            <div className="relative w-[380px] h-[520px] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl z-10 group">
              <div className="absolute inset-0 bg-gradient-to-t from-bg-color via-transparent to-transparent z-10"></div>
              <img
                src={heroAvatar}
                alt={heroAvatarAlt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Floating Glass Card 1 */}
            <motion.div
              className="absolute top-12 right-12 z-20 glass-panel p-4 rounded-xl flex items-center gap-4 shadow-xl border border-white/20 backdrop-blur-md"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-accent-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium">Core Stack</p>
                <p className="text-sm font-bold">React & Node.js</p>
              </div>
            </motion.div>

            {/* Floating Glass Card 2 */}
            <motion.div
              className="absolute bottom-24 -left-8 z-20 glass-panel p-4 rounded-xl flex items-center gap-4 shadow-xl border border-white/20 backdrop-blur-md"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <div className="w-10 h-10 rounded-full bg-accent-secondary/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-accent-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium">Availability</p>
                <p
                  className={`text-sm font-bold flex items-center gap-2 ${
                    availabilityAvailable ? 'text-green-400' : 'text-amber-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      availabilityAvailable ? 'bg-green-400' : 'bg-amber-400'
                    } ${availabilityAvailable ? 'animate-pulse' : ''}`}
                  ></span>
                  {availabilityLabel}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Background Lighting Elements */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-accent-primary rounded-full filter blur-[150px] opacity-20 -z-10"></div>
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-accent-secondary rounded-full filter blur-[150px] opacity-20 -z-10"></div>
      </div>

      <AboutSection state={about} onRetry={handleRetry} />
      <ProjectsSection state={projects} onRetry={handleRetry} />
      <SkillsSection state={skills} onRetry={handleRetry} />
      <BlogsSection state={blogs} onRetry={handleRetry} />
      <ContactSection about={aboutData} />
    </>
  );
}
