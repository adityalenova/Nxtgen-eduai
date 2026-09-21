import QuoteCard from './QuoteCard';
import Marketplace from './Marketplace';
import {BookOpen,CalendarDays,Layers,Headphones,ClipboardCheck,Compass,Award} from 'lucide-react';
import Account from './Account';
const Workspace = lazy(() => import('./Workspace'));
import ServiceLogo from './ServiceLogo';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';

const navItems = [
  { label: 'About us', to: '/about' },
  { label: 'Features', to: '/features' },
  { label: 'Use cases', to: '/use-cases' },
  { label: 'Solutions', to: '/solutions' },
  { label: 'Integrations', to: '/integrations' },
  { label: 'Blog', to: '/blog' },
];

const ease = [0.22, 1, 0.36, 1];

function Logo({ light = false }) {
  return (
    <Link to="/" className={`brand ${light ? 'brand-light' : ''}`} aria-label="NxtGen home">
      <span className="logo-mark"><span /></span>
      <span>nxtgen</span>
    </Link>
  );
}

function Arrow({ up = false }) {
  return <span className={`arrow ${up ? 'arrow-up' : ''}`} aria-hidden="true">↗</span>;
}

function Sparkle() {
  return <span className="sparkle" aria-hidden="true">✦</span>;
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="site-header">
      <Logo />
      <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="header-actions">
        <Link className="text-link" to="/auth">Log in</Link>
        <Link className="button button-dark header-cta" to="/auth">Start learning <Arrow /></Link>
      </div>
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
        <i /><i />
      </button>
      <span className="route-dot" key={location.pathname} />
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Logo />
          <p className="footer-intro">A calmer way to keep growing.</p>
        </div>
        <div className="footer-grid">
          <div>
            <p className="footer-label">Explore</p>
            {navItems.map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)}
          </div>
          <div>
            <p className="footer-label">Legal</p>
            <Link to="/privacy-policy">Privacy policy</Link>
            <Link to="/terms-of-service">Terms of service</Link>
            <Link to="/cookie-policy">Cookie policy</Link>
          </div>
          <div>
            <p className="footer-label">Get started</p>
            <Link to="/auth">Create your space <Arrow /></Link>
            <a href="mailto:hello@nxtgen.education">hello@nxtgen.education</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 NxtGen Learning, Inc.</span>
        <span>Made for curious minds <Sparkle /></span>
      </div>
    </footer>
  );
}

function PageWrap({ children, className = '' }) {
  return (
    <motion.main className={className} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45, ease }}>
      {children}
    </motion.main>
  );
}

function Eyebrow({ children }) {
  return <p className="eyebrow"><span />{children}</p>;
}

function LearningScene({ compact = false }) {
  const [rotate, setRotate] = useState({ x: -3, y: 4 });
  const handleMove = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    setRotate({
      x: ((event.clientY - box.top) / box.height - 0.5) * -9,
      y: ((event.clientX - box.left) / box.width - 0.5) * 12,
    });
  };

  return (
    <motion.div
      className={`learning-scene ${compact ? 'scene-compact' : ''}`}
      onPointerMove={handleMove}
      onPointerLeave={() => setRotate({ x: -3, y: 4 })}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: 'spring', stiffness: 100, damping: 16, mass: 0.6 }}
      style={{ transformPerspective: 1200 }}
      aria-label="Interactive NxtGen learning interface preview"
    >
      <div className="scene-glow glow-a" />
      <div className="scene-glow glow-b" />
      <div className="scene-grid" />
      <div className="scene-arch arch-one" />
      <div className="scene-arch arch-two" />
      <div className="scene-star star-one">✦</div>
      <div className="scene-star star-two">✦</div>
      <div className="scene-label scene-project"><span>LEARNING MODE</span><strong>FOCUS FLOW</strong></div>
      <div className="scene-label scene-service"><span>BUILT FOR</span><strong>CURIOUS MINDS</strong></div>
      <div className="scene-label scene-field"><span>STATE</span><strong>IN MOTION</strong></div>
      <motion.div className="scene-orb" animate={{ y: [0, -9, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
        <span className="orb-mark">N</span>
        <span className="orb-caption">NXTGEN</span>
      </motion.div>
      <motion.div className="scene-student" animate={{ y: [0, 5, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }} />
      <div className="scene-card scene-card-left">
        <div className="mini-visual mini-visual-forest"><i /><b /></div>
        <span>Now exploring</span>
        <strong>The shape of memory</strong>
        <em>08 min</em>
      </div>
      <div className="scene-card scene-card-right">
        <div className="wave-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
        <span>Ask NxtGen</span>
        <strong>Why does this idea matter?</strong>
        <div className="typing-pill"><b /> Thinking with you...</div>
      </div>
      <div className="scene-status">NxtGen is finding connections <b /></div>
      <div className="scene-url">nxtgen.education</div>
      <div className="scene-corner scene-corner-top" />
      <div className="scene-corner scene-corner-bottom" />
    </motion.div>
  );
}

function ImmersivePageVisual({ page }) {
  const scenes = {
    about: { kicker: 'THE QUIET LAYER', title: 'Your attention, returned.', items: ['Notice', 'Connect', 'Return'], tone: 'scene-about' },
    community: { kicker: 'OPEN STUDIO / 09', title: 'Questions get brighter together.', items: ['Mara', 'Jonah', 'Aditi'], tone: 'scene-community' },
    'use-cases': { kicker: 'A LIVING WORKFLOW', title: 'From scattered to clear.', items: ['Collect', 'Shape', 'Use'], tone: 'scene-usecases' },
    solutions: { kicker: 'LEARNING SYSTEMS', title: 'Insight you can share.', items: ['People', 'Practice', 'Progress'], tone: 'scene-solutions' },
  };
  const scene = scenes[page] || scenes.about;
  return <motion.div className={`immersive-page-visual ${scene.tone}`} initial={{ opacity: 0, scale: .97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .7, ease }}>
    <div className="immersive-haze haze-one" /><div className="immersive-haze haze-two" />
    <div className="immersive-visual-header"><span>{scene.kicker}</span><b>● LIVE THREAD</b></div>
    <div className="immersive-title">{scene.title}</div>
    <div className="immersive-orbit orbit-a" /><div className="immersive-orbit orbit-b" />
    <motion.div className="immersive-core" animate={{ y: [0, -7, 0], rotate: [0, 4, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}><span>{page === 'solutions' ? '↗' : page === 'community' ? '✦' : page === 'use-cases' ? 'N' : '◒'}</span></motion.div>
    <div className="immersive-pill pill-left">{scene.items[0]} <b>↗</b></div><div className="immersive-pill pill-mid">{scene.items[1]} <b>◌</b></div><div className="immersive-pill pill-right">{scene.items[2]} <b>✦</b></div>
    <div className="immersive-spark spark-a">✦</div><div className="immersive-spark spark-b">✦</div>
    <div className="immersive-footer"><span>nxtgen / field note</span><b>04:26</b></div>
  </motion.div>;
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <Eyebrow>YOUR PERSONAL LEARNING OS</Eyebrow>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05, ease }}>
          Learn the world<br />in <em>your</em> own way.
        </motion.h1>
        <motion.p className="hero-description" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15, ease }}>
          NxtGen turns every curious moment into a clear next step—bringing your questions, sources, notes, and progress into one thoughtful space.
        </motion.p>
        <motion.div className="hero-actions" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25, ease }}>
          <Link className="button button-dark button-large" to="/auth">Start your learning space <Arrow /></Link>
          <a className="video-link" href="#how-it-works"><span className="play-icon">▶</span> See how it flows</a>
        </motion.div>
        <motion.div className="hero-proof" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.45 }}>
          <div className="avatar-stack"><b>AS</b><b>MK</b><b>JP</b><b>+12</b></div>
          <span>Loved by learners who never stop asking.</span>
        </motion.div>
      </div>
      <motion.div className="hero-visual" initial={{ opacity: 0, scale: 0.94, x: 18 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.85, delay: 0.08, ease }}>
        <LearningScene />
        <div className="hero-orbit-text">EXPLORE · CONNECT · RETAIN · EXPLORE · CONNECT · RETAIN ·</div>
      </motion.div>
    </section>
  );
}

function FeatureFilm({ type = 'capture' }) {
  if (type === 'capture') {
    return <div className="feature-film film-capture">
      <div className="film-window"><span className="window-dot" /><span className="window-dot" /><span className="window-dot" /></div>
      <div className="film-note"><span className="note-chip">Article</span><strong>Can cities grow with nature?</strong><p>Capture an idea from anywhere.</p></div>
      <motion.div className="film-cursor" animate={{ x: [10, 100, 100, 40], y: [70, 55, 130, 80] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>✦</motion.div>
      <div className="film-saved"><span>✓</span> Saved to your garden</div>
    </div>;
  }
  if (type === 'connect') {
    return <div className="feature-film film-connect">
      <div className="constellation-line line-a" /><div className="constellation-line line-b" /><div className="constellation-line line-c" />
      <motion.div className="thought-node node-one" animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }}>feedback loops</motion.div>
      <motion.div className="thought-node node-two" animate={{ y: [0, 7, 0] }} transition={{ duration: 4.5, repeat: Infinity }}>ecosystems</motion.div>
      <motion.div className="thought-node node-three" animate={{ x: [0, 6, 0] }} transition={{ duration: 3.8, repeat: Infinity }}>systems thinking</motion.div>
      <div className="film-connect-caption">Three ideas. One bigger picture.</div>
    </div>;
  }
  return <div className="feature-film film-recall">
    <div className="recall-header"><span>RECALL</span><b>Tuesday, 10:42</b></div>
    <motion.div className="recall-card" animate={{ rotateY: [0, 6, 0], y: [0, -4, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
      <span>ONE MINUTE TO REMEMBER</span><strong>What makes an explanation stick?</strong><div><i /> <i /> <i /> <i /></div>
    </motion.div>
    <div className="recall-controls"><button>Not yet</button><button>I knew it</button></div>
  </div>;
}

function HomeFeature({ index, label, title, body, type }) {
  return <article className={`feature-row feature-${index}`}>
    <motion.div className="feature-copy" initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.55, ease }}>
      <p className="feature-number">0{index}</p>
      <Eyebrow>{label}</Eyebrow>
      <h2>{title}</h2>
      <p>{body}</p>
      <Link to="/use-cases" className="inline-link">Explore the workflow <Arrow /></Link>
    </motion.div>
    <motion.div className="feature-preview" initial={{ opacity: 0, y: 30, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, ease }}>
      <FeatureFilm type={type} />
    </motion.div>
  </article>;
}

function DataSources() {
  const sources = [
    ['Your notes', 'Ideas you choose to save, write, or import'],
    ['Trusted sources', 'Articles, research, and media you explicitly connect'],
    ['Your reflections', 'Answers, signals, and goals that shape your path'],
    ['Learning rhythm', 'Optional progress signals that improve recommendations'],
  ];
  return <section className="data-section section-shell">
    <div className="section-heading data-heading">
      <div><Eyebrow>BUILT AROUND WHAT YOU CHOOSE</Eyebrow><h2>Your learning data,<br /><em>kept in context.</em></h2></div>
      <p>NxtGen gathers only the information that makes your space more useful. You stay in control of what comes in, what gets connected, and what stays private.</p>
    </div>
    <div className="data-cards">
      {sources.map(([title, body], index) => <motion.article className="data-card" key={title} whileHover={{ y: -7 }} transition={{ type: 'spring', stiffness: 280, damping: 18 }}>
        <span className="data-index">0{index + 1}</span><span className="data-icon">{['◒', '◌', '✦', '↗'][index]}</span><h3>{title}</h3><p>{body}</p>
      </motion.article>)}
    </div>
    <p className="data-note">No data brokerage. No noisy attention economy. Just a clearer relationship with your own learning.</p>
  </section>;
}

const testimonials = [
  ['“It feels less like an app and more like a place I go to think.”', 'Maya K.', 'Design student'],
  ['“NxtGen pulls the thread between things I thought were unrelated.”', 'Jonah R.', 'Product researcher'],
  ['“My study plans finally leave room for curiosity.”', 'Aditi S.', 'Medical resident'],
  ['“The daily recall has made a bigger difference than another hour of cramming.”', 'Noah B.', 'Language learner'],
  ['“The gentlest way I have found to stay serious about learning.”', 'Zoe C.', 'Creative director'],
];

function Testimonials() {
  const cards = [...testimonials, ...testimonials];
  return <section className="testimonials-section">
    <div className="section-shell testimonial-heading"><Eyebrow>FROM THE NXTGEN CIRCLE</Eyebrow><h2>Made for the joy of<br /><em>figuring it out.</em></h2></div>
    <div className="marquee-shell" aria-label="Learner testimonials">
      <div className="marquee-track">
        {cards.map(([quote, name, role], index) => <article className="testimonial-card" key={`${name}-${index}`} aria-hidden={index >= testimonials.length}>
          <span className="quote-mark">“</span><blockquote>{quote}</blockquote><div><b>{name}</b><span>{role}</span></div>
        </article>)}
      </div>
    </div>
  </section>;
}

function HowItWorks() {
  const steps = [
    ['01', 'Bring a question', 'Start with the thing you cannot stop wondering about.'],
    ['02', 'Make it yours', 'Save a source, write a thought, or ask for a different angle.'],
    ['03', 'Keep the thread', 'NxtGen turns loose moments into a personal practice.'],
  ];
  return <section id="how-it-works" className="how-section section-shell">
    <div className="section-heading"><div><Eyebrow>HOW IT WORKS</Eyebrow><h2>A little structure<br />for your <em>big curiosity.</em></h2></div><Link to="/auth" className="button button-outline">Create your space <Arrow /></Link></div>
    <div className="how-grid">{steps.map(([number, title, description]) => <motion.article key={number} className="how-card" whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}><span>{number}</span><div className="how-graphic"><i /><b /><em /></div><h3>{title}</h3><p>{description}</p></motion.article>)}</div>
  </section>;
}

function HowItWorksCinema() {
  const scenes = [
    {
      tab: 'Collect',
      eyebrow: '01 · CAPTURE THE SPARK',
      title: 'Start with the question already on your mind.',
      copy: 'Drop a thought, a link, or a voice note into one calm place. NxtGen keeps the original context beside the next useful move.',
      prompt: 'Why does this pattern repeat in nature?',
      cards: [['Saved source', 'Biomimicry / 08:42'], ['Open thread', 'Patterns in ecosystems'], ['Tiny action', 'Add a reflection']],
      label: 'A question becomes a thread',
      tone: 'collect',
    },
    {
      tab: 'Connect',
      eyebrow: '02 · FIND THE THROUGH-LINE',
      title: 'Let your notes begin talking to each other.',
      copy: 'The workspace surfaces useful relationships across your saved ideas, not a noisy feed. You decide which connections matter.',
      prompt: 'Show the bridge between ecology and systems thinking',
      cards: [['Shared theme', 'Feedback loops'], ['New connection', 'Resilience → design'], ['NxtGen note', 'Three sources agree']],
      label: 'The map stays human-readable',
      tone: 'connect',
    },
    {
      tab: 'Practice',
      eyebrow: '03 · RETURN AT THE RIGHT TIME',
      title: 'Turn insight into something you can use.',
      copy: 'A flexible plan makes room for retrieval, reflection, and real life—so progress feels like momentum rather than pressure.',
      prompt: 'Build a 20-minute recall session for Friday',
      cards: [['Friday', 'Entropy / 20 min'], ['Ready now', '2 recall cards'], ['Earned today', '+35 focused XP']],
      label: 'Your next session is already shaped',
      tone: 'practice',
    },
  ];
  const [active, setActive] = useState(0);
  const scene = scenes[active];

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % scenes.length), 6800);
    return () => window.clearInterval(timer);
  }, []);

  return <section id="how-it-works" className="workflow-cinema section-shell">
    <div className="workflow-intro">
      <div><Eyebrow>HOW NXTGEN FLOWS</Eyebrow><h2>A learning space that<br /><em>moves with you.</em></h2></div>
      <p>Three quiet moves turn a passing thought into a practice you can return to. Choose a chapter, or let the scene move on its own.</p>
    </div>
    <div className="workflow-tabs" role="tablist" aria-label="NxtGen learning workflow">
      {scenes.map((item, index) => <button key={item.tab} role="tab" aria-selected={active === index} className={active === index ? 'active' : ''} onClick={() => setActive(index)}><span>0{index + 1}</span>{item.tab}</button>)}
    </div>
    <AnimatePresence mode="wait">
      <motion.article key={scene.tab} className={`workflow-stage ${scene.tone}`} role="tabpanel" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .42, ease }}>
        <div className="workflow-copy"><Eyebrow>{scene.eyebrow}</Eyebrow><h3>{scene.title}</h3><p>{scene.copy}</p><Link className="button button-dark" to="/auth">Build your space <Arrow /></Link></div>
        <motion.div className="workflow-window" initial={{ rotate: -1.8, scale: .97 }} animate={{ rotate: 0, scale: 1 }} transition={{ duration: .65, ease }}>
          <div className="workflow-window-top"><span><i /><i /><i /></span><b>nxtgen / learning space</b><em>LIVE</em></div>
          <div className="workflow-window-body">
            <aside><b>n</b><span className="active">⌂</span><span>◌</span><span>▤</span><span>◔</span><small>◉</small></aside>
            <main><div className="workflow-main-head"><span>YOUR WORKSPACE</span><button>+ New note</button></div><h4>{scene.label}</h4><div className="workflow-prompt"><span>✦</span><p>{scene.prompt}</p><b>↗</b></div><div className="workflow-mini-grid">{scene.cards.map(([label, value], index) => <motion.article key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .11 + index * .08 }}><span>{label}</span><b>{value}</b><i /></motion.article>)}</div><div className="workflow-timeline"><span>Today</span><i /><b>Thought captured</b><i /><b>Connection surfaced</b><i /><b>Practice ready</b></div></main>
          </div>
        </motion.div>
      </motion.article>
    </AnimatePresence>
  </section>;
}

function NxtGenToolRail() {
  const tools = ['AI Notebook', 'Study Planner', 'Recall Studio', 'Focus Companion', 'Assessment Engine', 'Skill Navigator', 'Badges & streaks'];
  const railIcons=[BookOpen,CalendarDays,Layers,Headphones,ClipboardCheck,Compass,Award];
  return <section className="nxtgen-tool-rail" aria-label="NxtGen tools">
    <div className="section-shell tool-rail-heading"><div><Eyebrow>ONE LEARNING OS</Eyebrow><h2>Every tool, pulling<br />in the same <em>direction.</em></h2></div><Link to="/dashboard" className="inline-link">Open your dashboard <Arrow /></Link></div>
    <div className="tool-rail-viewport"><div className="tool-rail-track">{[...tools, ...tools].map((tool, index) => <article key={`${tool}-${index}`} aria-hidden={index >= tools.length}><span className={'tool-rail-icon rail-icon-'+index%tools.length}>{(() => {const Icon=railIcons[index%tools.length];return <Icon size={28} strokeWidth={1.65}/>;})()}</span><b>{tool}</b><small>Ready when you are</small></article>)}</div></div>
  </section>;
}

function FAQ() {
  const [open, setOpen] = useState(0);
  const items = [
    ['What is NxtGen?', 'NxtGen is a personal learning environment that turns questions, sources, notes, and practice into a connected path you can return to.'],
    ['Do I need to be in school to use it?', 'Not at all. NxtGen is for students, professionals, creators, and anyone who wants their curiosity to have a home.'],
    ['Can I control what data is used?', 'Yes. Your connected sources and learning signals are opt-in, visible, and designed to be easy to remove.'],
    ['Is NxtGen an AI tutor?', 'It can help you reflect, organize, and explore, but it is designed as a thinking partner—never a replacement for your own judgement.'],
  ];
  return <section className="faq-section section-shell"><div className="faq-intro"><Eyebrow>QUESTIONS, ANSWERED</Eyebrow><h2>Before we begin.</h2><p>Everything you need to know about a more personal way to learn.</p><Link to="/community" className="inline-link">Ask the community <Arrow /></Link></div><div className="faq-list">{items.map(([question, answer], index) => <article key={question} className={`faq-item ${open === index ? 'open' : ''}`}><button onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}><span>{question}</span><b>+</b></button><AnimatePresence initial={false}>{open === index && <motion.div className="faq-answer" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.26 }}><p>{answer}</p></motion.div>}</AnimatePresence></article>)}</div></section>;
}

function Home() {
  return <PageWrap className="home-page"><Hero /><section className="signal-strip"><span>PERSONAL LEARNING, WITHOUT THE NOISE</span><span><i /> Capture</span><span><i /> Connect</span><span><i /> Recall</span><span><i /> Grow</span></section><section className="intro-section section-shell"><p className="intro-kicker">THE NXTGEN DIFFERENCE</p><h2>Less collecting.<br />More <em>becoming.</em></h2><p className="intro-copy">Your best learning does not happen in a feed. It happens when a small question has enough room to unfold. NxtGen gives you that room.</p></section><section className="features-section section-shell"><HomeFeature index={1} label="CATCH THE SPARK" title="A home for the things that pull at you." body="Drop in a thought, an article, a voice note, or a question. NxtGen keeps the original spark intact while giving it a place to grow." type="capture" /><HomeFeature index={2} label="SEE THE PATTERN" title="Your knowledge starts talking to itself." body="Gentle prompts surface the themes crossing your notes. The result is not another summary—it is a richer map of how you think." type="connect" /><HomeFeature index={3} label="MAKE IT LAST" title="Remember without forcing it." body="Short, well-timed recall sessions let important ideas return naturally, turning passing interest into knowledge you can use." type="recall" /></section><HowItWorksCinema /><NxtGenToolRail /><DataSources /><Testimonials /><FAQ /></PageWrap>;
}

const pageDetails = {
  about: {
    eyebrow: 'ABOUT NXTGEN', title: <>Learning is a practice<br />of <em>becoming.</em></>, intro: 'We are building a calmer layer between the internet and your attention—a place where ideas do not have to compete to be remembered.',
    miniTitle: 'We believe curiosity deserves better conditions.', miniText: 'NxtGen exists for the moment when a question catches. We make tools that preserve that momentum, invite reflection, and let people develop their own point of view.',
    cards: [['A generous pace', 'Learning is not a race against a feed.'], ['Agency by default', 'You decide what belongs in your space.'], ['Depth over noise', 'We protect the thread, not the metric.']],
    metrics: [['01', 'One calm workspace', 'Questions, sources, notes, and practice live together instead of being scattered across tabs.'], ['02', 'Three learning movements', 'Capture the spark, see the pattern, then return with enough distance to remember it.'], ['03', 'Your pace, visible', 'Progress is a signal for you—not a performance to broadcast.']],
  },
  community: {
    eyebrow: 'THE NXTGEN COMMUNITY', title: <>A good question<br />travels <em>further together.</em></>, intro: 'Meet people who are learning out loud—sharing resources, swapping lenses, and making a practice of sustained curiosity.',
    miniTitle: 'Find your people around the thing you care about.', miniText: 'Small circles, generous hosts, and conversations that leave you with more than a list of links. Our community is built for people who want to keep the question open a little longer.',
    cards: [['Learning circles', 'Small, recurring spaces for shared inquiry.'], ['Field notes', 'Fresh thinking and useful artifacts from the community.'], ['Open studios', 'Drop in sessions to make progress together.']],
    metrics: [['01', '10,000+ curious people', 'A growing network of learners, educators, and makers sharing the questions behind the work.'], ['02', 'Weekly rituals', 'Open studios, field notes, and small circles make it easier to keep showing up.'], ['03', 'Generous by design', 'Every contribution is an invitation to look again, not a race to be right.']],
  },
  'use-cases': {
    eyebrow: 'WAYS TO USE NXTGEN', title: <>One thinking space.<br />A thousand <em>ways in.</em></>, intro: 'Whether you are studying for an exam, changing careers, or following a fascination, NxtGen adapts to the shape of your work.',
    miniTitle: 'Learning is never one-size-fits-all.', miniText: 'Use it as a study companion, a creative research desk, a team learning room, or the quiet corner where you reconnect with the things that matter.',
    cards: [['For students', 'Turn a syllabus into a personal understanding.'], ['For teams', 'Make shared learning more visible and reusable.'], ['For self-directed minds', 'Follow a subject without losing the thread.']],
    metrics: [['01', 'Study companions', 'Grounded answers, flashcards, quizzes, and recall loops turn a source into something you can use.'], ['02', 'Project desks', 'Keep research, decisions, and reflection together while the work is still changing.'], ['03', 'Personal paths', 'Start with a question and let NxtGen shape the next useful step around you.']],
  },
  solutions: {
    eyebrow: 'NXTGEN SOLUTIONS', title: <>Thoughtful systems<br />for <em>deeper learning.</em></>, intro: 'Designed to meet people where learning actually happens: between classes, in projects, across teams, and in the quiet minutes that change direction.',
    miniTitle: 'A flexible foundation for a culture of learning.', miniText: 'NxtGen can support an individual habit or help an entire organization make its shared knowledge more alive. Start small, then let the system grow with you.',
    cards: [['NxtGen for education', 'Keep active learning connected beyond the classroom.'], ['NxtGen for teams', 'Turn research and reflection into collective momentum.'], ['NxtGen for communities', 'Give shared inquiry a lasting home.']],
    metrics: [['01', 'For institutions', 'Give every learner a consistent place to build context, practice retrieval, and see momentum.'], ['02', 'For teams', 'Turn shared research into reusable knowledge without flattening individual points of view.'], ['03', 'For communities', 'Create a living layer for events, resources, and the questions people keep returning to.']],
  },
};

function InfoPage({ page }) {
  const details = pageDetails[page];
  const isCommunity = page === 'community';
  const detailRows = [['01', 'Start with a real question', 'Begin with the thing you actually want to understand, not a generic lesson plan.'], ['02', 'Build a living thread', 'Collect context, reflect in place, and let useful connections become visible over time.'], ['03', 'Return with intention', 'NxtGen nudges you back to the ideas that deserve another look, at the right pace.']];
  return <PageWrap className="info-page"><section className="info-hero section-shell"><div className="info-copy"><Eyebrow>{details.eyebrow}</Eyebrow><h1>{details.title}</h1><p>{details.intro}</p><Link className="button button-dark" to="/auth">{isCommunity ? 'Join the circle' : 'Start with NxtGen'} <Arrow /></Link></div><div className="info-scene-wrap"><ImmersivePageVisual page={page} /><div className="scene-tag"><Sparkle /> {isCommunity ? '10,000 curious people' : 'NXTGEN, IN MOTION'}</div></div></section><section className="info-statement section-shell"><p className="statement-label">OUR POINT OF VIEW</p><div><h2>{details.miniTitle}</h2><p>{details.miniText}</p></div></section><section className="info-cards section-shell">{details.cards.map(([title, text], i) => <motion.article key={title} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}><span>0{i + 1}</span><div className="info-card-symbol">{['◒', '✦', '↗'][i]}</div><h3>{title}</h3><p>{text}</p><Link to="/auth">Learn more <Arrow /></Link></motion.article>)}</section><section className="info-detail-band section-shell"><div><Eyebrow>THE NXTGEN METHOD</Eyebrow><h2>A clearer path from<br /><em>interest to insight.</em></h2><p>Every page in NxtGen follows the same underlying rhythm: notice what matters, make sense of it, then create a reason to return.</p></div><div className="info-detail-rows">{detailRows.map(([number, title, body]) => <article key={title}><span>{number}</span><div><h3>{title}</h3><p>{body}</p></div><b>{['↗', '◒', '✦'][Number(number) - 1]}</b></article>)}</div></section><section className="info-metrics section-shell"><div className="info-metrics-heading"><Eyebrow>IN PRACTICE</Eyebrow><h2>Designed for the moments<br /><em>between the milestones.</em></h2><p>Small, repeatable choices are what turn a tool into a learning habit. These are the signals we design around on every page.</p></div><div className="info-metrics-list">{details.metrics.map(([number, title, text]) => <article key={title}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div><b>↗</b></article>)}</div></section>{page === 'community' && <section className="community-callout section-shell"><div><Eyebrow>UP NEXT</Eyebrow><h2>Make a practice<br />of <em>showing up.</em></h2><p>Every week, a quieter way to learn together.</p></div><div className="event-card"><span>THU</span><strong>17</strong><p>Open Studio: map a question</p><Link to="/auth" className="inline-link">Save your seat <Arrow /></Link></div></section>}{page === 'use-cases' && <section className="usecase-band"><div className="section-shell"><p>“The tool fades into the background, and the work gets more interesting.”</p><span>— NxtGen learner</span></div></section>}{page === 'solutions' && <section className="solution-cta section-shell"><div className="solution-window"><div className="solution-lines"><i /><i /><i /><i /></div><span>YOUR KNOWLEDGE, IN CONTEXT</span></div><div><Eyebrow>LET'S BUILD SOMETHING USEFUL</Eyebrow><h2>Start a learning<br /><em>ecosystem.</em></h2><p>Give every learner a clearer place to begin.</p><Link to="/auth" className="button button-dark">Explore NxtGen <Arrow /></Link></div></section>}</PageWrap>;
}

function AboutCollage() {
  const tiles = [
    ['about-tile-map', 'A question takes shape', '◌'],
    ['about-tile-study', 'Study circle', '✦'],
    ['about-tile-focus', '25:00', '◷'],
    ['about-tile-notes', 'Notes, in motion', '↗'],
    ['about-tile-source', 'Source grounded', '◒'],
  ];
  return <motion.div className="about-collage" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease }} aria-label="NxtGen learning scenes">
    {tiles.map(([klass, label, icon], index) => <motion.article key={klass} className={`about-tile ${klass}`} initial={{ opacity: 0, y: 22, rotate: index % 2 ? 3 : -3 }} animate={{ opacity: 1, y: 0, rotate: index % 2 ? 2 : -2 }} transition={{ duration: .6, delay: .12 + index * .08, ease }} whileHover={{ y: -7, rotate: 0 }}><span>{icon}</span><b>{label}</b><i /></motion.article>)}
    <div className="about-collage-orbit orbit-one" /><div className="about-collage-orbit orbit-two" />
  </motion.div>;
}

function AboutPage() {
  const principles = [
    ['01', 'Attention is part of the curriculum', 'When attention is protected, learning has enough room to become personal, playful, and durable.', '◌'],
    ['02', 'Context before answers', 'Every useful answer should show where it came from and leave you closer to your own source material.', '↗'],
    ['03', 'Agency by default', 'Your notes, pace, and goals belong to you. NxtGen is a collaborator, never the driver.', '✦'],
    ['04', 'Progress without performance', 'A learning rhythm should feel encouraging in private before it is ever visible anywhere else.', '◒'],
  ];
  const rhythm = [['01', 'Notice', 'Capture a question before it disappears.'], ['02', 'Connect', 'Let sources, ideas, and people meet in context.'], ['03', 'Practice', 'Use recall, feedback, and small sessions to make it stick.'], ['04', 'Carry forward', 'Return with a clearer next step and a stronger point of view.']];
  const momentum = [['Grounded by your sources', 'Answers, flashcards, and quizzes are built around the materials you choose.'], ['Built for real schedules', 'Small sessions, exam countdowns, and gentle reminders make progress feel possible.'], ['Useful alone, better together', 'Private thinking and shared circles can live side by side without either becoming noisy.'], ['Designed to leave you with more agency', 'The goal is not more screen time. It is a more capable relationship with what you learn.']];
  return <PageWrap className="about-page"><section className="about-hero section-shell"><div className="about-hero-copy"><Eyebrow>ABOUT NXTGEN</Eyebrow><h1>Make room for the way people <em>learn.</em></h1><p>NxtGen is a personal learning system for people who care more about understanding than keeping up. It gives questions, sources, practice, and reflection a shared place to grow.</p><div className="about-hero-actions"><Link className="button button-dark button-large" to="/auth">Explore your learning space <Arrow /></Link><Link className="inline-link" to="/features">Explore the features <Arrow /></Link></div></div><AboutCollage /></section><section className="about-manifesto section-shell"><p className="about-manifesto-label">A QUIETER KIND OF PROGRESS</p><h2>A calmer internet can make for <em>braver learning.</em></h2><div><p>There is no shortage of information. What is rare is enough continuity to let an idea change you. NxtGen is designed to protect that continuity—from the first question to the moment you can explain it in your own words.</p><p>We make a learning space that rewards return visits, meaningful practice, and a point of view you can call your own.</p></div></section><section className="about-principles section-shell"><div className="about-section-heading"><Eyebrow>WHAT WE DESIGN FOR</Eyebrow><h2>Small choices that make<br /><em>depth feel natural.</em></h2></div><div className="about-principles-grid">{principles.map(([number, title, body, icon]) => <motion.article key={title} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 250, damping: 19 }}><span>{number}</span><b>{icon}</b><h3>{title}</h3><p>{body}</p></motion.article>)}</div></section><section className="about-rhythm"><div className="section-shell"><div className="about-rhythm-top"><Eyebrow>THE NXTGEN RHYTHM</Eyebrow><p>Tools should fade into the background. A good learning practice should be the thing you remember.</p></div><div className="about-rhythm-grid">{rhythm.map(([number, title, body], index) => <motion.article key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08, duration: .45 }}><span>{number}</span><i>{['◒', '↗', '✦', '◌'][index]}</i><h3>{title}</h3><p>{body}</p></motion.article>)}</div></div></section><section className="about-momentum section-shell"><div className="about-momentum-intro"><Eyebrow>WHY IT IS WORTH RETURNING</Eyebrow><h2>Learning works better when the system <em>keeps its promises.</em></h2><p>Not more features for their own sake—just helpful support at the exact moment an idea asks for another look.</p></div><div className="about-momentum-rows">{momentum.map(([title, body], index) => <article key={title}><span>{['◌', '◷', '✦', '↗'][index]}</span><div><h3>{title}</h3><p>{body}</p></div><b>0{index + 1}</b></article>)}</div></section><section className="about-voices section-shell"><div><Eyebrow>BUILT IN CONVERSATION</Eyebrow><h2>For people who want<br />to stay <em>curious.</em></h2></div><div className="about-voices-grid">{testimonials.slice(0, 3).map(([quote, name, role], index) => <article key={name}><span>{['✦', '◌', '↗'][index]}</span><blockquote>{quote}</blockquote><p><b>{name}</b> · {role}</p></article>)}</div></section></PageWrap>;
}

const blogPosts = [
  { category: 'Learning practice', icon: '◒', title: 'The overlooked skill: returning to a question', author: 'NxtGen Editorial', date: 'September 8', time: '6 min', excerpt: 'Why revisiting an idea at the right moment can matter more than finding one more resource.' },
  { category: 'Product notes', icon: '↗', title: 'How a source becomes a learning thread', author: 'Product Studio', date: 'August 26', time: '4 min', excerpt: 'A closer look at the small details that make citations, notes, and practice feel connected.' },
  { category: 'Community', icon: '✦', title: 'What we heard in the open studio', author: 'Community Studio', date: 'August 12', time: '5 min', excerpt: 'A field note on the questions learners brought to a recent NxtGen circle.' },
  { category: 'Learning practice', icon: '◷', title: 'The myth of the perfect study routine', author: 'Learning Research Desk', date: 'July 30', time: '7 min', excerpt: 'A more forgiving approach to planning around energy, time, and the work in front of you.' },
  { category: 'Research', icon: '◌', title: 'Designing AI feedback people can trust', author: 'Learning Research Desk', date: 'July 16', time: '8 min', excerpt: 'What source grounding, uncertainty, and transparent feedback can do for a learner’s confidence.' },
  { category: 'Product notes', icon: '↗', title: 'Why progress should feel private first', author: 'Product Studio', date: 'June 24', time: '4 min', excerpt: 'Building motivation systems that encourage learners without turning their attention into a score.' },
  { category: 'Community', icon: '✦', title: 'The small ritual that makes a learning circle work', author: 'Community Studio', date: 'June 5', time: '5 min', excerpt: 'One shared practice that helps a group keep curiosity open, even in a busy week.' },
];

function BlogPage() {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const categories = ['All', 'Learning practice', 'Product notes', 'Research', 'Community'];
  const posts = filter === 'All' ? blogPosts : blogPosts.filter((post) => post.category === filter);
  const featured = blogPosts[0];
  return <PageWrap className="blog-page"><section className="blog-hero section-shell"><Eyebrow>NXTGEN FIELD NOTES</Eyebrow><h1>Notes for people who<br />want to keep <em>learning.</em></h1><p>Ideas, product notes, and research-informed practices for building a more personal relationship with knowledge.</p><div className="blog-filter-row" aria-label="Filter articles">{categories.map((category) => <button key={category} className={filter === category ? 'active' : ''} onClick={() => setFilter(category)}>{category === 'All' ? '◫' : category === 'Learning practice' ? '◒' : category === 'Product notes' ? '↗' : category === 'Research' ? '◌' : '✦'} <span>{category}</span></button>)}</div></section>{filter === 'All' && <section className="blog-featured section-shell"><div className="blog-featured-art"><div className="blog-art-orbit orbit-1" /><div className="blog-art-orbit orbit-2" /><div className="blog-art-note note-a">A question worth returning to</div><div className="blog-art-note note-b">6 min read</div><div className="blog-art-core">◒</div><span>FIELD NOTE / 01</span></div><article><span>{featured.category}</span><h2>{featured.title}</h2><p>{featured.excerpt}</p><button onClick={() => setSelected(featured)}>Read field note <Arrow /></button></article></section>}<section className="blog-timeline section-shell"><div className="blog-timeline-heading"><Eyebrow>{filter === 'All' ? 'ALL FIELD NOTES' : filter.toUpperCase()}</Eyebrow><p>{posts.length} thoughtful {posts.length === 1 ? 'note' : 'notes'} to explore.</p></div><div className="blog-post-list">{posts.map((post, index) => <motion.article key={post.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .35, delay: index * .04 }}><div className="blog-post-marker"><b>{post.icon}</b><i /></div><button onClick={() => setSelected(post)}><span>{post.category}</span><h2>{post.title}</h2><p>{post.excerpt}</p><footer><b>{post.author}</b><em>{post.date}</em><em>{post.time} read</em><strong>Read <Arrow /></strong></footer></button></motion.article>)}</div></section><section className="blog-newsletter section-shell"><div><Eyebrow>STAY IN THE THREAD</Eyebrow><h2>One thoughtful note,<br /><em>every few weeks.</em></h2><p>New field notes, product reflections, and learning practices—sent when there is something worth sharing.</p></div><form onSubmit={(event) => { event.preventDefault(); event.currentTarget.reset(); }}><label>Email address<input type="email" required placeholder="you@example.com" /></label><button className="button button-dark" type="submit">Subscribe <Arrow /></button><small>No noise. Unsubscribe whenever you want.</small></form></section>{selected && <div className="blog-reader-backdrop" role="presentation" onClick={() => setSelected(null)}><motion.article className="blog-reader" role="dialog" aria-modal="true" aria-label={selected.title} initial={{ opacity: 0, y: 24, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} onClick={(event) => event.stopPropagation()}><button className="blog-reader-close" onClick={() => setSelected(null)} aria-label="Close article">×</button><span>{selected.category} · {selected.time} read</span><h2>{selected.title}</h2><p className="blog-reader-deck">{selected.excerpt}</p><div className="blog-reader-visual"><b>{selected.icon}</b><i /><i /><i /></div><p>Learning becomes more useful when a good question has a place to stay. This field note is an invitation to notice what is already working, make one small practice easier, and return when the idea has had time to grow.</p><p>That is the kind of system NxtGen is building: one that keeps context close enough for curiosity to become capability.</p><footer>{selected.author} · {selected.date}</footer></motion.article></div>}</PageWrap>;
}

const integrations = [
  { name: 'ChatGPT', group: 'AI study', logo: 'openai', copy: 'Turn a quick question into a grounded NxtGen learning thread.', accent: 'mint' },
  { name: 'Claude', group: 'AI study', logo: 'anthropic', copy: 'Bring a careful second perspective into your source-led notes.', accent: 'peach' },
  { name: 'Gemini', group: 'AI study', logo: 'googlegemini', copy: 'Explore an idea, then keep the useful parts with your sources.', accent: 'violet' },
  { name: 'Perplexity', group: 'AI study', logo: 'perplexity', copy: 'Save research trails and convert them into a readable study path.', accent: 'sky' },
  { name: 'Notion', group: 'Notes & sources', logo: 'notion', copy: 'Import selected pages as source material for a focused notebook.', accent: 'paper' },
  { name: 'Google Drive', group: 'Notes & sources', logo: 'googledrive', copy: 'Bring in course files and keep citations connected to the original.', accent: 'blue' },
  { name: 'Dropbox', group: 'Notes & sources', logo: 'dropbox', copy: 'Collect reading packs without breaking your existing filing system.', accent: 'blue' },
  { name: 'Obsidian', group: 'Notes & sources', logo: 'obsidian', copy: 'Link your private knowledge garden with active recall sessions.', accent: 'violet' },
  { name: 'Google Calendar', group: 'Planning', logo: 'googlecalendar', copy: 'Place realistic study blocks beside the commitments you already keep.', accent: 'blue' },
  { name: 'Zoom', group: 'Planning', logo: 'zoom', copy: 'Turn study group meetings into next steps, questions, and reflections.', accent: 'sky' },
  { name: 'Slack', group: 'Planning', logo: 'slack', copy: 'Share a study checkpoint with the people learning alongside you.', accent: 'peach' },
  { name: 'Zapier', group: 'Automation', logo: 'zapier', copy: 'Create simple routines when a new note, task, or goal needs attention.', accent: 'sun' },
  { name: 'ElevenLabs', group: 'Automation', logo: 'elevenlabs', copy: 'Listen to source-grounded audio overviews when reading is not possible.', accent: 'paper' },
];

const integrationGroups = ['All', 'AI study', 'Notes & sources', 'Planning', 'Automation'];
const logoSrc = (name) => `https://cdn.simpleicons.org/${name}`;

function IntegrationLogo(props) { return <ServiceLogo {...props}/>; }

function IntegrationsPage() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('All');
  const [connected, setConnected] = useState([]);
  const shown = integrations.filter((tool) => (group === 'All' || tool.group === group) && tool.name.toLowerCase().includes(query.toLowerCase()));
  const marquee = [...integrations.slice(0, 10), ...integrations.slice(0, 10)];
  return <PageWrap className="integrations-page"><section className="integrations-hero section-shell"><Eyebrow>INTEGRATIONS</Eyebrow><h1>Your learning<br />can <em>travel well.</em></h1><p>Bring the tools you already trust into one calm study system. NxtGen keeps the context, then moves the useful next step where it belongs.</p><a href="#integration-directory" className="button button-dark button-large">See all integrations <Arrow /></a></section><section className="integration-marquee" aria-label="Explore tools"><div className="integration-marquee-track">{marquee.map((tool, index) => <div className="integration-marquee-item" key={`${tool.name}-${index}`} aria-label={tool.name}><IntegrationLogo tool={tool} compact /></div>)}</div></section><section className="integration-flow section-shell"><div className="integration-flow-copy"><Eyebrow>ONE QUIET HANDOFF</Eyebrow><h2>From a spark<br />to a <em>practice.</em></h2><p>Connect a source, shape a question, and send the next useful moment back to your calendar, notes, or study group.</p></div><div className="integration-flow-window"><div className="flow-window-top"><span /><span /><span /><b>NXTGEN · STUDY FLOW</b></div><div className="flow-lanes"><article><small>01 · CAPTURE</small><b>Lecture notes arrive</b><div><IntegrationLogo tool={integrations[4]} /><IntegrationLogo tool={integrations[5]} /></div></article><i>→</i><article><small>02 · MAKE SENSE</small><b>A clear recall plan</b><div><IntegrationLogo tool={integrations[0]} /><IntegrationLogo tool={integrations[3]} /></div></article><i>→</i><article><small>03 · RETURN</small><b>A session lands on time</b><div><IntegrationLogo tool={integrations[8]} /><IntegrationLogo tool={integrations[9]} /></div></article></div></div></section><section id="integration-directory" className="integration-directory section-shell"><div className="integration-directory-head"><div><Eyebrow>THE DIRECTORY</Eyebrow><h2>Explore your<br /><em>learning stack.</em></h2></div><label className="integration-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search integrations" aria-label="Search integrations" /></label></div><div className="integration-directory-body"><aside className="integration-filter-list">{integrationGroups.map((item) => <button key={item} onClick={() => setGroup(item)} className={group === item ? 'active' : ''}>{item}<span>{item === 'All' ? integrations.length : integrations.filter((tool) => tool.group === item).length}</span></button>)}</aside><div><p className="directory-disclosure">Explore compatible tools and save a shortlist. Account connections require each provider’s authorization; saving a tool does not connect an account.</p><div className="integration-result-header"><p>{group === 'All' ? 'All integrations' : group}</p><span>{shown.length} tools</span></div><div className="integration-grid">{shown.map((tool, index) => <motion.article key={tool.name} className={`integration-card ${connected.includes(tool.name) ? 'is-connected' : ''}`} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(index * .025, .18) }} whileHover={{ y: -5 }}><div className="integration-card-top"><IntegrationLogo tool={tool} /><span>{tool.group}</span></div><h3>{tool.name}</h3><p>{tool.copy}</p><button onClick={() => setConnected((current) => current.includes(tool.name) ? current.filter((name) => name !== tool.name) : [...current, tool.name])}>{connected.includes(tool.name) ? 'Saved ✓' : 'Save to shortlist'} <Arrow /></button></motion.article>)}</div></div></div></section></PageWrap>;
}

function FeatureDashboard() {
  const panels = [
    ['Source-grounded chat', 'Ask from the materials you choose.', 'What does the second law describe?'],
    ['Memory that returns', 'Revisit the idea at the right time.', '5 cards ready for recall'],
    ['A plan with room to move', 'Balance goals with the week you actually have.', 'Physics · 25 min · 16:30'],
  ];
  const [active, setActive] = useState(0);
  useEffect(() => { const id = window.setInterval(() => setActive((current) => (current + 1) % panels.length), 3300); return () => window.clearInterval(id); }, []);
  return <div className="feature-dashboard-demo"><div className="feature-dashboard-top"><span /><span /><span /><b>NXTGEN / YOUR LEARNING SPACE</b><small>● synced</small></div><aside><div className="feature-demo-brand"><span>✦</span> nxtgen</div>{['Overview', 'AI notebooks', 'Study planner', 'Assessments', 'Focus mode'].map((item, index) => <button key={item} className={active === index % 3 ? 'active' : ''} onClick={() => setActive(index % 3)}><i>{['◒', '◌', '▦', '✓', '◷'][index]}</i>{item}</button>)}<div className="feature-demo-profile"><b>AJ</b><span>Avery’s space</span></div></aside><main><div className="feature-demo-main-head"><div><small>WEDNESDAY · 09:42</small><strong>Good morning, Avery <em>✦</em></strong></div><button>+ New</button></div><AnimatePresence mode="wait"><motion.div key={active} className="feature-demo-panel" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .38 }}><small>0{active + 1} / {panels[active][0].toUpperCase()}</small><h3>{panels[active][0]}</h3><p>{panels[active][1]}</p><div className={`feature-demo-response response-${active}`}><span>{active === 0 ? '✦' : active === 1 ? '↻' : '◷'}</span><b>{panels[active][2]}</b><i /></div><button className="feature-demo-action">Open tool <Arrow /></button></motion.div></AnimatePresence><div className="feature-demo-minis"><article><small>FOCUS</small><b>6.4h</b><i /><i /><i /><i /><i /></article><article><small>MASTERY</small><b>64%</b><span>64</span></article><article><small>STREAK</small><b>12 days</b><p>● ● ● ○ ○ ○ ○</p></article></div></main></div>;
}

function FeaturesPage() {
  const points = [['01', 'Ask with context', 'Chat, explain, and make sense of your own sources—not a generic internet answer.'], ['02', 'Practice without pressure', 'Recall loops and flexible quizzes help you notice what is becoming familiar.'], ['03', 'Plan for real life', 'Turn goals into focused sessions while leaving room for the rest of your week.'], ['04', 'See your momentum', 'Streaks, badges, and progress signals stay encouraging, private, and useful.']];
  return <PageWrap className="features-page"><section className="features-hero section-shell"><div className="features-copy"><Eyebrow>THE NXTGEN TOOLKIT</Eyebrow><h1>An AI learning space that understands <em>your work.</em></h1><p>Everything you need to turn curiosity into a lasting practice: grounded study help, gentle structure, and a dashboard that makes growth feel visible.</p><Link className="button button-dark button-large" to="/auth">Start your learning space <Arrow /></Link></div><FeatureDashboard /></section><section className="feature-marquee"><div><span>GROUND YOUR QUESTIONS</span><i>✦</i><span>MAKE A PLAN</span><i>✦</i><span>REMEMBER MORE</span><i>✦</i><span>KEEP GOING</span><i>✦</i><span>GROUND YOUR QUESTIONS</span><i>✦</i><span>MAKE A PLAN</span><i>✦</i></div></section><section className="feature-points section-shell"><div><Eyebrow>A SYSTEM THAT RESPONDS</Eyebrow><h2>Less switching.<br />More <em>thinking.</em></h2><p>Every feature works as part of a single loop: capture what matters, understand it in context, practise it, and return when the timing is right.</p></div><div>{points.map(([number, title, body], index) => <motion.article key={number} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }}><span>{number}</span><div><h3>{title}</h3><p>{body}</p></div><b>↗</b></motion.article>)}</div></section><section className="feature-canvas section-shell"><div className="feature-canvas-copy"><Eyebrow>THE THREAD STAYS INTACT</Eyebrow><h2>One place for<br />the question,<br />the source, and <em>you.</em></h2><p>NxtGen turns learning into a living system rather than a list of disconnected tools.</p><Link to="/use-cases" className="inline-link">See how people use NxtGen <Arrow /></Link></div><div className="feature-canvas-art"><i className="canvas-orbit a" /><i className="canvas-orbit b" /><i className="canvas-orbit c" /><motion.div animate={{ y: [0, -11, 0], rotate: [0, 4, 0] }} transition={{ duration: 5, repeat: Infinity }} className="canvas-core">N</motion.div><span className="canvas-pill pill-a">SOURCE GROUNDED</span><span className="canvas-pill pill-b">RECALL READY</span><span className="canvas-pill pill-c">12 CONNECTED IDEAS</span></div></section></PageWrap>;
}

function UseCasesPage() {
  const cases = [['STUDENTS', 'Make the syllabus make sense.', 'Grounded answers, active recall, and a plan that moves around exams—not against your life.', 'Physics revision · 12 source pages'], ['CAREER SWITCHERS', 'Turn research into a direction.', 'Keep articles, projects, and skill gaps in one space while a clearer next step begins to emerge.', 'Product design path · Week 4'], ['INDEPENDENT LEARNERS', 'Follow a fascination for longer.', 'Capture the loose ends, make connections, and return to the ideas that stay interesting.', 'Urban ecology · 36 connected notes']];
  return <PageWrap className="usecases-page"><section className="usecases-hero section-shell"><div><Eyebrow>WAYS TO USE NXTGEN</Eyebrow><h1>One thinking space.<br />A thousand <em>ways in.</em></h1><p>Whether you are preparing for a test, building a new capability, or following a question for its own sake, NxtGen adapts to the shape of your work.</p><Link className="button button-dark button-large" to="/auth">Find your way in <Arrow /></Link></div><div className="usecases-stack" aria-hidden="true"><article className="case-stack-a"><small>YOUR QUESTION</small><b>Why does this idea matter?</b><span>Ask NxtGen ↗</span></article><article className="case-stack-b"><small>YOUR PLAN</small><b>3 sessions this week</b><i /><i /><i /></article><article className="case-stack-c"><small>YOUR MOMENTUM</small><b>12-day streak</b><span>✦</span></article></div></section><section className="usecase-rows section-shell">{cases.map(([tag, title, body, detail], index) => <article key={tag}><div><span>0{index + 1}</span><small>{tag}</small></div><h2>{title}</h2><p>{body}</p><div className={`usecase-window usecase-window-${index}`}><small>{detail}</small><b>{['68% mastered', '4 skills growing', '12 ideas returned'][index]}</b><i /></div><Link to="/auth" className="inline-link">Explore this path <Arrow /></Link></article>)}</section><section className="usecase-proof"><div className="section-shell"><div><Eyebrow>BUILT FOR THE MIDDLE OF THINGS</Eyebrow><h2>For every person<br />who wants to go <em>deeper.</em></h2></div><div className="usecase-proof-grid"><article><b>01</b><h3>Bring your own material</h3><p>Start with a PDF, a link, a lecture, or a question you want to keep close.</p></article><article><b>02</b><h3>Choose your level of support</h3><p>Use a single feature or let NxtGen bring notes, recall, planning, and reflection together.</p></article><article><b>03</b><h3>Keep the learning yours</h3><p>Build evidence of your own thinking—not just another collection of generated answers.</p></article></div></div></section></PageWrap>;
}

function SolutionsPage() {
  const solutions = [
    { tab: 'Learners', icon: '◌', title: 'Make the next session easier to begin.', body: 'One home for sources, reflections, practice, and tiny commitments that make a learning habit feel possible.', rows: [['Capture', 'Save the thread, not just the link'], ['Practice', 'Return when memory needs a nudge'], ['Reflect', 'Keep evidence of how you think']], tone: 'learner' },
    { tab: 'Educators', icon: '✦', title: 'See learning between the assignments.', body: 'Give learners a place to build context, ask better questions, and bring stronger thinking back into the room.', rows: [['Grounded help', 'Start from course material'], ['Signals', 'Notice where confidence changes'], ['Feedback', 'Invite reflection without extra admin']], tone: 'educator' },
    { tab: 'Teams', icon: '↗', title: 'Turn shared research into a living advantage.', body: 'Keep decisions, sources, and repeatable learning loops in a shared rhythm without flattening individual insight.', rows: [['Research desk', 'Connect source packs and decisions'], ['Shared briefs', 'Move useful insight into the work'], ['Skill maps', 'Make capability growth visible']], tone: 'team' },
    { tab: 'Communities', icon: '◒', title: 'Give a good question somewhere to travel.', body: 'Bring circles, resources, and open studios into one durable home that people can return to after the event ends.', rows: [['Circles', 'A lightweight space for inquiry'], ['Field notes', 'Keep the artifacts of conversation'], ['Rituals', 'Create a reason to return']], tone: 'community' },
  ];
  const [active, setActive] = useState(0);
  const solution = solutions[active];
  return <PageWrap className="solutions-page">
    <section className="solutions-hero section-shell"><div><Eyebrow>NXTGEN SOLUTIONS</Eyebrow><h1>Build momentum<br />for every kind of <em>learner.</em></h1><p>Designed for the real places learning happens: inside a study session, across a curriculum, in a team project, or around one shared question.</p><Link className="button button-dark button-large" to="/auth">Explore your space <Arrow /></Link></div><div className="solutions-signal-map" aria-hidden="true"><i className="solution-line line-one" /><i className="solution-line line-two" /><i className="solution-line line-three" /><span className="solution-node node-a">Source pack</span><span className="solution-node node-b">NxtGen</span><span className="solution-node node-c">Practice ready</span><span className="solution-node node-d">Progress</span><b>✦</b></div></section>
    <section className="solutions-studio"><div className="section-shell"><div className="solutions-studio-heading"><div><Eyebrow>FLEXIBLE BY DESIGN</Eyebrow><h2>One system.<br /><em>Many ways forward.</em></h2></div><p>Choose a view to see how NxtGen’s core loop adapts without changing what matters: ownership, context, and a clear next step.</p></div><div className="solutions-tabs" role="tablist" aria-label="NxtGen solutions">{solutions.map((item, index) => <button key={item.tab} className={index === active ? 'active' : ''} aria-selected={index === active} onClick={() => setActive(index)}><span>{item.icon}</span>{item.tab}</button>)}</div><AnimatePresence mode="wait"><motion.div key={solution.tab} className={`solutions-stage ${solution.tone}`} role="tabpanel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .42, ease }}><div className="solutions-stage-copy"><span>{solution.tab.toUpperCase()} / NXTGEN</span><h3>{solution.title}</h3><p>{solution.body}</p><Link to="/auth" className="button button-light">See the path <Arrow /></Link></div><div className="solutions-stage-window"><div className="solutions-window-top"><i /><i /><i /><b>nxtgen · living workspace</b></div><div className="solutions-window-body"><aside><b>n</b><span>⌂</span><span className="active">{solution.icon}</span><span>◔</span></aside><main><small>STARTING FROM WHAT MATTERS</small><h4>{solution.rows[0][1]}</h4><div className="solution-stage-route"><span>{solution.icon}</span><i /><span>✦</span><i /><span>↗</span></div>{solution.rows.map(([label, value], index) => <motion.article key={label} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .12 + index * .08 }}><span>{label}</span><b>{value}</b><em>↗</em></motion.article>)}</main></div></div></motion.div></AnimatePresence></div></section>
    <section className="solutions-proof section-shell"><div><Eyebrow>BUILT TO GROW WITH YOU</Eyebrow><h2>Start small.<br />Keep the <em>context.</em></h2></div><div className="solutions-proof-rows"><article><span>01</span><div><h3>A learner can begin with a single source.</h3><p>No sprawling setup required—just a useful place to capture and return.</p></div><b>◌</b></article><article><span>02</span><div><h3>A group can share what is worth remembering.</h3><p>Bring grounded insight into a classroom, team, or circle without losing the original thread.</p></div><b>✦</b></article><article><span>03</span><div><h3>A system can make progress visible without making it performative.</h3><p>Private rhythms, badges, and next steps stay meaningful because the learner remains in control.</p></div><b>↗</b></article></div></section>

  </PageWrap>;
}

const policies = {
  privacy: { eyebrow: 'PRIVACY POLICY', title: 'Your learning belongs to you.', lead: 'This policy explains the information NxtGen collects to provide your learning space and the choices you have about it.', sections: [['What we collect', 'We collect the account information you provide, the materials you choose to add to NxtGen, and limited usage information needed to operate and improve the service.'], ['How we use it', 'We use your information to provide requested features, organize your learning space, maintain security, and communicate important service updates. We do not sell personal information.'], ['Your controls', 'You can review, export, or delete the content you add to your learning space. You may also change optional personalization settings at any time.'], ['Keeping information safe', 'We use reasonable organizational and technical safeguards designed to protect information under our control. No system is perfectly secure, so please protect your login credentials.'], ['Contact', 'Questions about privacy can be sent to hello@nxtgen.education.']], },
  terms: { eyebrow: 'TERMS OF SERVICE', title: 'Clear expectations make better spaces.', lead: 'These terms govern your use of NxtGen. By using the service, you agree to use it thoughtfully and in accordance with these terms.', sections: [['Using NxtGen', 'You may use NxtGen for lawful personal, educational, and professional learning. You are responsible for the content you add and for keeping your account credentials secure.'], ['Your content', 'You retain ownership of your content. You give NxtGen the limited permission needed to host, process, and display it so the service can work for you.'], ['Respecting others', 'Do not use NxtGen to harm others, violate rights, upload unlawful content, or interfere with the service. Community spaces require generosity, curiosity, and respect.'], ['Service changes', 'We may improve, modify, or discontinue features over time. When a material change affects your account, we will provide appropriate notice.'], ['Contact', 'For questions about these terms, contact hello@nxtgen.education.']], },
  cookies: { eyebrow: 'COOKIE POLICY', title: 'Small signals. Clear choices.', lead: 'This policy explains how NxtGen uses cookies and similar technologies to make the website and learning space work reliably.', sections: [['Essential cookies', 'These cookies are necessary for core features such as secure sign-in, preferences, and page functionality. You cannot opt out of essential cookies while using the service.'], ['Performance cookies', 'With your permission, we may use limited analytics to understand which parts of NxtGen are useful and where the experience needs work.'], ['Your choices', 'Most browsers let you control or delete cookies through browser settings. Blocking some cookies may affect how certain parts of NxtGen function.'], ['Updates', 'We may update this policy as our service evolves. The latest version will always appear on this page.']], },
};

function PolicyPage({ policy }) {
  const content = policies[policy];
  return <PageWrap className="policy-page"><section className="policy-hero section-shell"><Eyebrow>{content.eyebrow}</Eyebrow><h1>{content.title}</h1><p>{content.lead}</p><span>Last updated: September 9, 2026</span></section><section className="policy-content section-shell">{content.sections.map(([heading, body], index) => <article key={heading}><span>0{index + 1}</span><div><h2>{heading}</h2><p>{body}</p></div></article>)}</section><section className="policy-closer section-shell"><p>We want the legal layer to be as human as the product.</p><Link to="/auth" className="button button-dark">Begin your learning space <Arrow /></Link></section></PageWrap>;
}

function NotFound() { return <PageWrap className="not-found"><Eyebrow>LOST IN THOUGHT</Eyebrow><h1>This page is still<br /><em>becoming.</em></h1><Link to="/" className="button button-dark">Return home <Arrow /></Link></PageWrap>; }

function PublicLayout({ children }) { return <><Header />{children}<QuoteCard /><Footer /></>; }

function App() {
  const location = useLocation();
  const isSpecial = location.pathname === '/auth' || location.pathname === '/dashboard';
  return <AnimatePresence mode="wait" initial={false}>
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/community" element={<PublicLayout><InfoPage page="community" /></PublicLayout>} />
      <Route path="/features" element={<PublicLayout><FeaturesPage /></PublicLayout>} />
      <Route path="/use-cases" element={<PublicLayout><UseCasesPage /></PublicLayout>} />
      <Route path="/solutions" element={<PublicLayout><SolutionsPage /></PublicLayout>} />
      <Route path="/integrations" element={<PublicLayout><Marketplace /></PublicLayout>} />
      <Route path="/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />
      <Route path="/privacy-policy" element={<PublicLayout><PolicyPage policy="privacy" /></PublicLayout>} />
      <Route path="/terms-of-service" element={<PublicLayout><PolicyPage policy="terms" /></PublicLayout>} />
      <Route path="/cookie-policy" element={<PublicLayout><PolicyPage policy="cookies" /></PublicLayout>} />
      <Route path="/auth" element={<Account />} />
      <Route path="/dashboard/*" element={<Suspense fallback={<main className="workspace-loading">Opening your learning space…</main>}><Workspace /></Suspense>} />
      <Route path="*" element={isSpecial ? <NotFound /> : <PublicLayout><NotFound /></PublicLayout>} />
    </Routes>
  </AnimatePresence>;
}

export default App;
