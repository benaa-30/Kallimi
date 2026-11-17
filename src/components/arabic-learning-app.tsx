"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  BookOpen,
  ClipboardCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Flame,
  GraduationCap,
  Home,
  Lightbulb,
  Menu,
  MessageCircle,
  Mic,
  Search,
  Send,
  Sparkles,
  Target,
  Theater,
  Volume2,
  X,
  Zap,
  RotateCcw,
  Bot,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode, RefObject } from "react";
import { lessons, quizQuestions, roleplays, vocabulary, type Lesson } from "@/lib/curriculum";

type NavKey = "dashboard" | "lessons" | "tutor" | "roleplay" | "quiz" | "dictionary";
type ChatMessage = { role: "user" | "assistant"; content: string };
type Progress = { xp: number; streak: number; completedLessons: string[]; quizCompleted: number; lastVisit: string; dailyChallengeCompleted: boolean };

const navItems: { id: NavKey; label: string; icon: typeof Home }[] = [
  { id: "dashboard", label: "Beranda", icon: Home },
  { id: "lessons", label: "Materi Belajar", icon: BookOpen },
  { id: "tutor", label: "AI Conversation", icon: MessageCircle },
  { id: "roleplay", label: "Simulasi Roleplay", icon: Theater },
  { id: "quiz", label: "Kuis Interaktif", icon: ClipboardCheck },
  { id: "dictionary", label: "Kamus Mini", icon: BookMarked },
];


const defaultProgress: Progress = { xp: 0, streak: 0, completedLessons: [], quizCompleted: 0, lastVisit: "", dailyChallengeCompleted: false };
const initialChat: ChatMessage[] = [
  {
    role: "assistant",
    content: "السَّلَامُ عَلَيْكُمْ! أَهْلًا وَسَهْلًا بِكَ. أَنَا أُسْتَاذُ عَرَبِيّ، صَدِيقُكَ فِي تَعَلُّمِ اللُّغَةِ الْعَرَبِيَّةِ. كَيْفَ حَالُكَ الْيَوْمَ؟\n\nAssalamu'alaikum! Selamat datang. Saya Ustadz Arabi, teman belajarmu. Bagaimana kabarmu hari ini?",
  },
];

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

function speakArabic(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ar-SA";
  utterance.rate = 0.86;
  const arabicVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("ar"));
  if (arabicVoice) utterance.voice = arabicVoice;
  window.speechSynthesis.speak(utterance);
}

function arabicOnly(text: string) {
  return text.split("\n").filter((line) => /[\u0600-\u06FF]/.test(line)).join(" ").slice(0, 600);
}

export default function ArabicLearningApp() {
  const [activeTab, setActiveTab] = useState<NavKey>("dashboard");
  const [grade, setGrade] = useState("VII");
  const [level, setLevel] = useState("Pemula");
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [hydrated, setHydrated] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialChat);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState("");
  const [listening, setListening] = useState(false);
  const [speechNotice, setSpeechNotice] = useState("");
  const [dictionarySearch, setDictionarySearch] = useState("");
  const [dictionaryCategory, setDictionaryCategory] = useState("Semua");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lughati-progress-v1");
      const parsed = stored ? (JSON.parse(stored) as Progress) : defaultProgress;
      const today = new Date().toDateString();
      let nextStreak = parsed.streak || 0;
      if (parsed.lastVisit !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        nextStreak = parsed.lastVisit === yesterday ? nextStreak + 1 : 1;
      }
      setProgress({ ...defaultProgress, ...parsed, streak: nextStreak, lastVisit: today, dailyChallengeCompleted: parsed.lastVisit === today ? Boolean(parsed.dailyChallengeCompleted) : false });
    } catch {
      setProgress({ ...defaultProgress, streak: 1, lastVisit: new Date().toDateString(), dailyChallengeCompleted: false });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("lughati-progress-v1", JSON.stringify(progress));
  }, [progress, hydrated]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, chatLoading]);

  const completedCount = progress.completedLessons.length;
  const overallProgress = Math.round((completedCount / lessons.length) * 100);
  const categories: string[] = ["Semua", ...Array.from(new Set<string>(vocabulary.map((item) => item.category)))];
  const filteredVocabulary = useMemo(() => {
    const term = dictionarySearch.toLowerCase().trim();
    return vocabulary.filter((item) => {
      const matchesCategory = dictionaryCategory === "Semua" || item.category === dictionaryCategory;
      const matchesTerm = !term || item.arabic.includes(term) || item.latin.toLowerCase().includes(term) || item.meaning.toLowerCase().includes(term);
      return matchesCategory && matchesTerm;
    });
  }, [dictionarySearch, dictionaryCategory]);

  function changeTab(tab: NavKey) {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (tab !== "tutor") setSpeechNotice("");
  }

  function completeLesson(lesson: Lesson) {
    setProgress((current) => {
      if (current.completedLessons.includes(lesson.id)) return current;
      return { ...current, xp: current.xp + 25, completedLessons: [...current.completedLessons, lesson.id] };
    });
    setSelectedLesson(null);
  }

  function startRoleplay(scenario: (typeof roleplays)[number]) {
    setActiveScenario(scenario.prompt);
    setMessages([
      {
        role: "assistant",
        content: `مَرْحَبًا! هَيَّا نَبْدَأُ الْحِوَارَ.\n\n${scenario.title}: ${scenario.subtitle}.\n\nMari kita mulai percakapannya. Jawab menggunakan bahasa Arab sederhana, ya!`,
      },
    ]);
    setActiveTab("tutor");
  }

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    if (text.length > 1200) {
      setSpeechNotice("Pesan maksimal 1.200 karakter.");
      return;
    }
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setChatInput("");
    setChatLoading(true);
    setSpeechNotice("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-10), grade, level, scenario: activeScenario }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Terjadi kesalahan saat menghubungi tutor AI.");
      setMessages((current) => [...current, { role: "assistant", content: data.reply || "مُمْتَازٌ! هَيَّا نُوَاصِلُ التَّدَرُّبَ." }]);
      setProgress((current) => ({ ...current, xp: current.xp + (current.dailyChallengeCompleted ? 2 : 17), dailyChallengeCompleted: true }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Koneksi bermasalah. Silakan coba lagi.";
      setMessages((current) => [...current, { role: "assistant", content: `⚠️ ${message}` }]);
    } finally {
      setChatLoading(false);
    }
  }

  function startListening() {
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setSpeechNotice("Browser ini belum mendukung pengenalan suara. Coba gunakan Google Chrome versi terbaru.");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "ar-SA";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) setChatInput((current) => (current ? `${current} ${transcript}` : transcript));
    };
    recognition.onerror = () => {
      setSpeechNotice("Suara belum tertangkap. Pastikan izin mikrofon sudah diberikan.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    setListening(true);
    setSpeechNotice("Silakan berbicara dalam bahasa Arab...");
    recognition.start();
  }

  function resetChat() {
    setMessages(initialChat);
    setActiveScenario("");
    setSpeechNotice("");
  }

  function answerQuiz() {
    if (quizAnswer === null) return;
    if (quizAnswer === quizQuestions[quizIndex].answer) setQuizScore((score) => score + 1);
    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex((index) => index + 1);
      setQuizAnswer(null);
    } else {
      const finalScore = quizScore + (quizAnswer === quizQuestions[quizIndex].answer ? 1 : 0);
      setQuizScore(finalScore);
      setQuizFinished(true);
      setProgress((current) => ({ ...current, xp: current.xp + 30, quizCompleted: current.quizCompleted + 1 }));
    }
  }

  function restartQuiz() {
    setQuizIndex(0);
    setQuizAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
  }

  const currentNav = navItems.find((item) => item.id === activeTab)?.label || "Beranda";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><span>ل</span><Sparkles size={14} /></div>
          <div><div className="brand-name">lughati<span>.</span></div><div className="brand-caption">ARABIC LEARNING SPACE</div></div>
          <button className="icon-button sidebar-close" onClick={() => setMobileMenuOpen(false)} aria-label="Tutup menu"><X size={19} /></button>
        </div>

        <div className="sidebar-section-label">MENU UTAMA</div>
        <nav className="main-nav" aria-label="Navigasi utama">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={`nav-item ${activeTab === item.id ? "active" : ""}`} onClick={() => changeTab(item.id)}>
                <Icon size={19} strokeWidth={2.1} /><span>{item.label}</span>
                {item.id === "tutor" && <span className="nav-live-dot" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-tip">
          <div className="tip-spark"><Sparkles size={17} /></div>
          <div className="tip-title">Sedikit demi sedikit</div>
          <p>Latihan 10 menit setiap hari membuat bahasa Arabmu semakin lancar.</p>
          <div className="tip-arabic" dir="rtl">خَيْرُ الْأُمُورِ أَدْوَمُهَا</div>
        </div>
        <div className="sidebar-footer"><div className="avatar-small">ط</div><div><strong>Teman Belajar</strong><span>Pelajar Lughati</span></div><span className="footer-chevron"><ChevronDown size={15} /></span></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu-button" onClick={() => setMobileMenuOpen(true)} aria-label="Buka menu"><Menu size={21} /></button>
            <div className="breadcrumb"><span>Ruang Belajar</span><ChevronRight size={14} /><strong>{currentNav}</strong></div>
          </div>
          <div className="topbar-actions">
            <div className="grade-picker"><GraduationCap size={16} /><select value={grade} onChange={(event) => setGrade(event.target.value)} aria-label="Pilih kelas"><option value="VII">Kelas VII</option><option value="VIII">Kelas VIII</option><option value="IX">Kelas IX</option><option value="Semua">Semua kelas</option></select><ChevronDown size={14} /></div>
            <div className="topbar-divider" />
            <div className="top-xp"><Zap size={16} fill="currentColor" /><strong>{progress.xp}</strong><span>XP</span></div>
            <div className="top-avatar">ط</div>
          </div>
        </header>

        <div className="page-content">
          {activeTab === "dashboard" && (
            <DashboardView
              progress={progress}
              overallProgress={overallProgress}
              completedCount={completedCount}
              dailyChallengeCompleted={progress.dailyChallengeCompleted}
              onNavigate={changeTab}
              onOpenLesson={setSelectedLesson}
              grade={grade}
            />
          )}

          {activeTab === "lessons" && (
            <LessonsView grade={grade} completedLessons={progress.completedLessons} onOpenLesson={setSelectedLesson} />
          )}

          {activeTab === "tutor" && (
            <TutorView
              messages={messages}
              input={chatInput}
              setInput={setChatInput}
              loading={chatLoading}
              listening={listening}
              notice={speechNotice}
              scenario={activeScenario}
              grade={grade}
              level={level}
              setLevel={setLevel}
              onSend={sendMessage}
              onListen={startListening}
              onReset={resetChat}
              onSpeak={(text) => speakArabic(arabicOnly(text) || text)}
              chatEndRef={chatEndRef}
            />
          )}

          {activeTab === "roleplay" && <RoleplayView onStart={startRoleplay} />}

          {activeTab === "quiz" && (
            <QuizView
              index={quizIndex}
              answer={quizAnswer}
              score={quizScore}
              finished={quizFinished}
              onAnswer={setQuizAnswer}
              onNext={answerQuiz}
              onRestart={restartQuiz}
            />
          )}

          {activeTab === "dictionary" && (
            <DictionaryView
              search={dictionarySearch}
              setSearch={setDictionarySearch}
              category={dictionaryCategory}
              setCategory={setDictionaryCategory}
              categories={categories}
              words={filteredVocabulary}
              onSpeak={speakArabic}
            />
          )}
        </div>
        <footer className="page-footer"><span>© 2026 Lughati Learning Space</span><span>صَدِيقُكَ فِي تَعَلُّمِ الْعَرَبِيَّةِ <i>•</i> Teman belajarmu dalam bahasa Arab</span></footer>
      </main>

      <nav className="mobile-bottom-nav" aria-label="Navigasi mobile">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return <button key={item.id} className={activeTab === item.id ? "active" : ""} onClick={() => changeTab(item.id)}><Icon size={19} /><span>{item.id === "dashboard" ? "Home" : item.id === "lessons" ? "Materi" : item.id === "tutor" ? "AI Tutor" : item.id === "roleplay" ? "Roleplay" : "Kuis"}</span></button>;
        })}
      </nav>

      {selectedLesson && <LessonModal lesson={selectedLesson} completed={progress.completedLessons.includes(selectedLesson.id)} onClose={() => setSelectedLesson(null)} onComplete={() => completeLesson(selectedLesson)} />}
    </div>
  );
}

function DashboardView({
  progress,
  overallProgress,
  completedCount,
  onNavigate,
  onOpenLesson,
  grade,
  dailyChallengeCompleted,
}: {
  progress: Progress;
  overallProgress: number;
  completedCount: number;
  dailyChallengeCompleted: boolean;
  onNavigate: (tab: NavKey) => void;
  onOpenLesson: (lesson: Lesson) => void;
  grade: string;
}) {
  const nextLesson = lessons.find((lesson) => (grade === "Semua" || lesson.grade === grade) && !progress.completedLessons.includes(lesson.id)) || lessons.find((lesson) => !progress.completedLessons.includes(lesson.id)) || lessons[0];
  return (
    <div className="dashboard-page page-enter">
      <div className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> RUANG BELAJAR BAHASA ARAB</div><h1>Marhaban, Sahabat! <span className="wave">✦</span></h1><p className="page-subtitle">Siap meningkatkan kemampuan berbicara bahasa Arab hari ini?</p></div><div className="date-chip"><span className="date-icon">☀</span><span>Semangat belajar hari ini!</span></div></div>

      <section className="hero-banner">
        <div className="hero-copy"><div className="hero-kicker"><Sparkles size={14} /> YOUR ARABIC JOURNEY STARTS HERE</div><h2>Berani bicara,<br /><em>lancar berbahasa!</em></h2><p>Latih percakapan bahasa Arab bersama tutor AI yang siap menemanimu kapan saja.</p><div className="hero-actions"><button className="button button-white" onClick={() => onNavigate("tutor")}>Mulai ngobrol <ArrowRight size={17} /></button><span className="hero-note"><span className="online-dot" /> Tutor AI siap menemani</span></div></div>
        <div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-speech speech-one" dir="rtl">مَرْحَبًا!</div><div className="art-speech speech-two">Ahlan wa sahlan!</div><div className="mascot-face"><div className="mascot-cap">ل</div><div className="mascot-eyes"><i /><i /></div><div className="mascot-smile" /></div><div className="art-star star-one">✦</div><div className="art-star star-two">✧</div><div className="art-book">📖</div></div>
      </section>

      <section className="stats-grid">
        <StatCard icon={<Zap size={18} />} label="Total pengalaman" value={progress.xp.toLocaleString("id-ID")} suffix="XP" tone="yellow" detail="Terus kumpulkan XP!" />
        <StatCard icon={<Flame size={18} />} label="Belajar berturut-turut" value={String(progress.streak)} suffix="hari" tone="coral" detail="Jaga semangat belajarmu" />
        <StatCard icon={<BookOpen size={18} />} label="Materi diselesaikan" value={`${completedCount}/${lessons.length}`} suffix="materi" tone="green" detail={`${overallProgress}% dari seluruh materi`} />
      </section>

      <div className="dashboard-columns">
        <section className="section-card continue-card">
          <div className="section-heading"><div><div className="section-kicker">LANJUTKAN PERJALANAN</div><h3>Belajar berikutnya</h3></div><button className="text-link" onClick={() => onNavigate("lessons")}>Semua materi <ArrowUpRight size={15} /></button></div>
          <button className="continue-lesson" onClick={() => onOpenLesson(nextLesson)}>
            <div className={`lesson-emoji ${nextLesson.color}`}>{nextLesson.icon}</div><div className="continue-info"><span className="lesson-meta">KELAS {nextLesson.grade} <i>•</i> {nextLesson.duration}</span><strong>{nextLesson.title}</strong><span className="arabic-small" dir="rtl">{nextLesson.arabicTitle}</span><div className="mini-progress"><span style={{ width: progress.completedLessons.includes(nextLesson.id) ? "100%" : "12%" }} /></div></div><span className="round-arrow"><ChevronRight size={20} /></span>
          </button>
          <div className="lesson-path-label"><span>JALUR BELAJARMU</span><span>{completedCount} dari {lessons.length} selesai</span></div>
          <div className="path-track"><span style={{ width: `${overallProgress}%` }} /></div>
        </section>

        <section className="section-card daily-card">
          <div className="daily-top"><div className="daily-icon"><Target size={19} /></div><span className="daily-label">TANTANGAN HARIAN</span><span className="daily-xp">+15 XP</span></div>
          <h3>Latihan 10 menit</h3><p>Selesaikan satu sesi percakapan bersama Ustadz Arabi hari ini.</p><div className="daily-progress-row"><div className="daily-progress"><span style={{ width: dailyChallengeCompleted ? "100%" : "0%" }} /></div><span>{dailyChallengeCompleted ? "1/1" : "0/1"}</span></div><button className="button button-green button-full" onClick={() => onNavigate("tutor")}>{dailyChallengeCompleted ? "Latihan lagi" : "Ambil tantangan"} <ArrowRight size={16} /></button>
        </section>
      </div>

      <section className="quick-section"><div className="section-heading"><div><div className="section-kicker">PILIH AKTIVITAS</div><h3>Mau belajar apa hari ini?</h3></div></div><div className="quick-grid"><QuickAction icon={<MessageCircle size={20} />} title="Ngobrol dengan AI" description="Latihan percakapan" tone="mint" onClick={() => onNavigate("tutor")} /><QuickAction icon={<Theater size={20} />} title="Simulasi situasi" description="Roleplay kehidupan nyata" tone="peach" onClick={() => onNavigate("roleplay")} /><QuickAction icon={<ClipboardCheck size={20} />} title="Uji kemampuan" description="Kuis singkat dan seru" tone="lavender" onClick={() => onNavigate("quiz")} /><QuickAction icon={<BookMarked size={20} />} title="Jelajahi kosakata" description="Temukan kata baru" tone="yellow" onClick={() => onNavigate("dictionary")} /></div></section>
      <div className="dashboard-bottom-note"><div className="note-icon"><Lightbulb size={17} /></div><p><strong>Tips hari ini:</strong> Jangan takut salah saat berbicara. Kesalahan adalah bagian dari proses belajar. <span dir="rtl">لَا تَخَفْ مِنَ الْخَطَإِ</span></p></div>
    </div>
  );
}

function StatCard({ icon, label, value, suffix, tone, detail }: { icon: ReactNode; label: string; value: string; suffix: string; tone: string; detail: string }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}<small>{suffix}</small></div><div className="stat-detail">{detail}</div></div>;
}

function QuickAction({ icon, title, description, tone, onClick }: { icon: ReactNode; title: string; description: string; tone: string; onClick: () => void }) {
  return <button className="quick-action" onClick={onClick}><div className={`quick-icon ${tone}`}>{icon}</div><div><strong>{title}</strong><span>{description}</span></div><ChevronRight size={18} className="quick-chevron" /></button>;
}

function LessonsView({ grade, completedLessons, onOpenLesson }: { grade: string; completedLessons: string[]; onOpenLesson: (lesson: Lesson) => void }) {
  const shownLessons = lessons.filter((lesson) => grade === "Semua" || lesson.grade === grade);
  return <div className="subpage page-enter"><PageHeading eyebrow="KURIKULUM TERARAH" title="Materi Pembelajaran" subtitle="Belajar dari kosakata sederhana hingga percakapan sehari-hari." /><div className="learning-banner"><div><span className="banner-label">MAHARAH KALAM</span><h3>Mulai dari kata, tumbuh menjadi percakapan.</h3><p>Setiap materi dilengkapi kosakata, contoh dialog, dan latihan berbicara.</p></div><div className="banner-illustration">🗣️</div></div><div className="lesson-grid">{shownLessons.map((lesson, index) => { const done = completedLessons.includes(lesson.id); return <button className="lesson-card" key={lesson.id} onClick={() => onOpenLesson(lesson)}><div className="lesson-card-top"><div className={`lesson-emoji ${lesson.color}`}>{lesson.icon}</div>{done ? <span className="completed-pill"><Check size={12} /> Selesai</span> : <span className="lesson-number">0{index + 1}</span>}</div><div className="lesson-card-meta">KELAS {lesson.grade} <i>•</i> {lesson.level}</div><h3>{lesson.title}</h3><div className="lesson-arabic" dir="rtl">{lesson.arabicTitle}</div><p>{lesson.description}</p><div className="lesson-card-footer"><span><Clock3 size={14} /> {lesson.duration}</span><span className="start-link">{done ? "Ulangi materi" : "Mulai belajar"} <ArrowRight size={15} /></span></div></button>; })}</div>{shownLessons.length === 0 && <div className="empty-state">Belum ada materi untuk kelas ini.</div>}</div>;
}

function PageHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <div className="page-heading"><div className="section-kicker">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>;
}

function LessonModal({ lesson, completed, onClose, onComplete }: { lesson: Lesson; completed: boolean; onClose: () => void; onComplete: () => void }) {
  const [tab, setTab] = useState<"words" | "dialogue">("words");
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="lesson-modal" role="dialog" aria-modal="true" aria-label={lesson.title}><div className="modal-header"><div className={`lesson-emoji ${lesson.color}`}>{lesson.icon}</div><button className="icon-button" onClick={onClose} aria-label="Tutup"><X size={19} /></button></div><div className="modal-meta">KELAS {lesson.grade} <i>•</i> {lesson.level} <i>•</i> {lesson.duration}</div><h2>{lesson.title}</h2><div className="modal-arabic" dir="rtl">{lesson.arabicTitle}</div><p className="modal-description">{lesson.description}</p><div className="modal-tabs"><button className={tab === "words" ? "active" : ""} onClick={() => setTab("words")}>Kosakata</button><button className={tab === "dialogue" ? "active" : ""} onClick={() => setTab("dialogue")}>Contoh percakapan</button></div>{tab === "words" ? <div className="word-list">{lesson.words.map((word) => <div className="word-row" key={word.arabic}><div><strong dir="rtl">{word.arabic}</strong><span>{word.latin}</span></div><div className="word-meaning"><b>{word.meaning}</b><small dir="rtl">{word.example}</small></div><button className="sound-button" onClick={() => speakArabic(word.arabic)} aria-label={`Dengarkan ${word.arabic}`}><Volume2 size={17} /></button></div>)}</div> : <div className="dialogue-list">{lesson.dialogue.map((line, index) => <div className={`dialogue-line ${index % 2 ? "right" : ""}`} key={`${line.speaker}-${index}`}><span>{line.speaker}</span><strong dir="rtl">{line.arabic}</strong><small>{line.meaning}</small><button className="sound-button" onClick={() => speakArabic(line.arabic)} aria-label="Dengarkan dialog"><Volume2 size={15} /></button></div>)}</div>}<div className="modal-footer"><div className="modal-xp"><Zap size={16} fill="currentColor" /> +25 XP</div><button className="button button-green" onClick={onComplete}>{completed ? "Tutup materi" : "Tandai selesai"} <CheckCircle2 size={16} /></button></div></div></div>;
}

function TutorView({
  messages, input, setInput, loading, listening, notice, scenario, grade, level, setLevel, onSend, onListen, onReset, onSpeak, chatEndRef,
}: {
  messages: ChatMessage[]; input: string; setInput: (value: string) => void; loading: boolean; listening: boolean; notice: string; scenario: string; grade: string; level: string; setLevel: (value: string) => void; onSend: (event?: FormEvent) => void; onListen: () => void; onReset: () => void; onSpeak: (text: string) => void; chatEndRef: RefObject<HTMLDivElement | null>;
}) {
  return <div className="tutor-page page-enter"><div className="tutor-heading"><div><div className="section-kicker">AI SPEAKING PARTNER</div><h1>Ruang Percakapan</h1><p>Latih bahasa Arabmu. Tidak perlu takut salah, kita belajar bersama!</p></div><button className="button button-outline reset-chat" onClick={onReset}><RotateCcw size={15} /> Percakapan baru</button></div><div className="tutor-layout"><section className="chat-panel"><div className="chat-panel-header"><div className="tutor-avatar"><Bot size={24} /></div><div className="tutor-identity"><strong>Ustadz Arabi</strong><span><i className="online-dot" /> Tutor AI • Siap membantu</span></div><div className="chat-header-badge"><Sparkles size={13} /> AI Tutor</div></div>{scenario && <div className="scenario-strip"><Theater size={15} /><span>Mode roleplay aktif</span><span className="scenario-name">{scenario.split("\n")[0].slice(0, 58)}...</span></div>}<div className="chat-messages">{messages.map((message, index) => <div className={`message-row ${message.role === "user" ? "user-message" : "ai-message"}`} key={`${message.role}-${index}`}><div className={`message-avatar ${message.role}`}>{message.role === "assistant" ? <Bot size={17} /> : <UserRound size={17} />}</div><div className="message-content"><div className="message-sender">{message.role === "assistant" ? "Ustadz Arabi" : "Kamu"}</div><div className="message-bubble"><p className="message-text">{message.content}</p>{message.role === "assistant" && !message.content.startsWith("⚠️") && <button className="message-speak" onClick={() => onSpeak(message.content)}><Volume2 size={14} /> Dengarkan</button>}</div></div></div>)}{loading && <div className="message-row ai-message"><div className="message-avatar assistant"><Bot size={17} /></div><div className="message-content"><div className="message-sender">Ustadz Arabi</div><div className="message-bubble typing-bubble"><span /><span /><span /></div></div></div>}<div ref={chatEndRef} /></div><div className="chat-composer-wrap"><div className="composer-hint"><Sparkles size={13} /> Cobalah menjawab menggunakan bahasa Arab.</div><form className="chat-composer" onSubmit={onSend}><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="اُكْتُبْ رِسَالَتَكَ بِاللُّغَةِ الْعَرَبِيَّةِ..." rows={1} maxLength={1200} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onSend(); } }} /><button type="button" className={`mic-button ${listening ? "listening" : ""}`} onClick={onListen} aria-label="Gunakan mikrofon"><Mic size={19} /></button><button type="submit" className="send-button" disabled={!input.trim() || loading} aria-label="Kirim pesan"><Send size={18} /></button></form>{notice && <div className={`speech-notice ${listening ? "listening-text" : ""}`}>{notice}</div>}<div className="chat-disclaimer">Percakapan tidak disimpan di server aplikasi. Jangan masukkan data pribadi.</div></div></section><aside className="tutor-side"><div className="side-info-card tutor-tips"><div className="side-card-icon"><Lightbulb size={18} /></div><h3>Tips berbicara</h3><ul><li>Mulai dengan kalimat pendek.</li><li>Gunakan kosakata yang sudah dipelajari.</li><li>Ulangi jawaban setelah dikoreksi.</li><li>Berani mencoba adalah kunci!</li></ul></div><div className="side-info-card level-card"><div className="side-card-heading"><GraduationCap size={17} /><strong>Pengaturan belajar</strong></div><label htmlFor="level-select">Tingkat kemampuan</label><select id="level-select" value={level} onChange={(event) => setLevel(event.target.value)}><option>Pemula</option><option>Menengah</option></select><div className="level-note">Tutor akan menyesuaikan kosakata dan panjang kalimat dengan levelmu.</div><label className="grade-label">Kelas saat ini</label><div className="grade-chip">Kelas {grade === "Semua" ? "VII–IX" : grade}</div></div><div className="side-info-card phrase-card"><div className="phrase-top"><span>UNGKAPAN HARI INI</span><Volume2 size={15} onClick={() => speakArabic("مُمْتَازٌ! أَحْسَنْتَ.")} /></div><div className="phrase-arabic" dir="rtl">مُمْتَازٌ! أَحْسَنْتَ.</div><p>Bagus sekali! Kamu hebat.</p></div></aside></div></div>;
}

function RoleplayView({ onStart }: { onStart: (scenario: (typeof roleplays)[number]) => void }) {
  return <div className="subpage page-enter"><PageHeading eyebrow="PRAKTIK DUNIA NYATA" title="Simulasi Percakapan" subtitle="Pilih situasi, ambil peran, dan praktikkan bahasa Arab bersama AI." /><div className="roleplay-intro"><div className="roleplay-intro-icon">🎭</div><div><strong>Belajar melalui pengalaman</strong><p>Ustadz Arabi akan menjadi lawan bicaramu. Jawab pertanyaan dalam bahasa Arab dan dapatkan koreksi secara langsung.</p></div><span className="roleplay-intro-tag">6 SKENARIO</span></div><div className="roleplay-grid">{roleplays.map((scenario, index) => <div className="roleplay-card" key={scenario.id}><div className="roleplay-card-top"><div className={`roleplay-icon ${scenario.color}`}>{scenario.icon}</div><span className="scenario-count">SCENARIO 0{index + 1}</span></div><span className="roleplay-level">{scenario.level}</span><h3>{scenario.title}</h3><p>{scenario.subtitle}</p><button className="roleplay-start" onClick={() => onStart(scenario)}>Mulai simulasi <ArrowRight size={16} /></button></div>)}</div><div className="roleplay-bottom"><Sparkles size={17} /><span>Setiap percakapan adalah kesempatan baru untuk menjadi lebih percaya diri.</span></div></div>;
}

function QuizView({ index, answer, score, finished, onAnswer, onNext, onRestart }: { index: number; answer: number | null; score: number; finished: boolean; onAnswer: (answer: number) => void; onNext: () => void; onRestart: () => void }) {
  if (finished) return <div className="quiz-page page-enter"><div className="quiz-result"><div className="result-confetti">🏆</div><div className="section-kicker">SESI LATIHAN SELESAI</div><h1>مُمْتَازٌ! Hebat!</h1><p>Kamu sudah menyelesaikan latihan kosakata dan ungkapan bahasa Arab.</p><div className="score-circle"><strong>{score}</strong><span>/ {quizQuestions.length}</span></div><div className="result-stats"><div><Zap size={17} /><strong>+30 XP</strong><span>Pengalaman</span></div><div><Target size={17} /><strong>{Math.round((score / quizQuestions.length) * 100)}%</strong><span>Akurasi</span></div></div><button className="button button-green" onClick={onRestart}>Coba lagi <RotateCcw size={16} /></button></div></div>;
  const question = quizQuestions[index];
  const isCorrect = answer === question.answer;
  return <div className="quiz-page page-enter"><PageHeading eyebrow="UJI PEMAHAMANMU" title="Kuis Bahasa Arab" subtitle="Jawab pertanyaan berikut dan kumpulkan pengalaman belajar." /><div className="quiz-card"><div className="quiz-card-top"><span className="quiz-label"><CircleHelp size={16} /> LATIHAN KOSAKATA</span><span className="quiz-counter">{index + 1} <i>/</i> {quizQuestions.length}</span></div><div className="quiz-progress"><span style={{ width: `${((index + 1) / quizQuestions.length) * 100}%` }} /></div><div className="quiz-question"><p>{question.question}</p><div className="quiz-arabic" dir="rtl">{question.arabic}</div></div><div className="quiz-options">{question.options.map((option, optionIndex) => <button key={option} disabled={answer !== null} className={`quiz-option ${answer === optionIndex ? "selected" : ""} ${answer !== null && optionIndex === question.answer ? "correct" : ""} ${answer === optionIndex && !isCorrect ? "incorrect" : ""}`} onClick={() => onAnswer(optionIndex)}><span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span>{answer !== null && optionIndex === question.answer && <CheckCircle2 size={18} />}{answer === optionIndex && !isCorrect && <X size={18} />}</button>)}</div>{answer !== null && <div className={`quiz-feedback ${isCorrect ? "correct-feedback" : "incorrect-feedback"}`}><strong>{isCorrect ? "Jawaban benar! أحْسَنْتَ" : "Belum tepat, tetap semangat!"}</strong><p>{question.explanation}</p></div>}<div className="quiz-footer"><span><Zap size={15} /> Hadiah: 30 XP jika selesai</span><button className="button button-green" disabled={answer === null} onClick={onNext}>{index === quizQuestions.length - 1 ? "Lihat hasil" : "Lanjutkan"} <ArrowRight size={16} /></button></div></div></div>;
}

function DictionaryView({ search, setSearch, category, setCategory, categories, words, onSpeak }: { search: string; setSearch: (value: string) => void; category: string; setCategory: (value: string) => void; categories: string[]; words: typeof vocabulary; onSpeak: (text: string) => void }) {
  return <div className="subpage page-enter"><PageHeading eyebrow="PERKAYA KOSAKATA" title="Kamus Mini" subtitle="Temukan kosakata pilihan dan dengarkan cara pengucapannya." /><div className="dictionary-toolbar"><div className="dictionary-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari kata Arab, latin, atau artinya..." /></div><div className="category-select"><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter kategori">{categories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></div></div><div className="dictionary-summary"><span><BookMarked size={16} /> {words.length} kosakata ditemukan</span><span>Tekan ikon suara untuk mendengarkan</span></div><div className="dictionary-grid">{words.map((word, index) => <div className="dictionary-card" key={`${word.arabic}-${index}`}><div className="dictionary-card-top"><span className="dictionary-index">{String(index + 1).padStart(2, "0")}</span><span className="dictionary-category">{word.category}</span></div><div className="dictionary-arabic" dir="rtl">{word.arabic}</div><div className="dictionary-latin">{word.latin}</div><strong>{word.meaning}</strong><div className="dictionary-example"><span>Contoh kalimat</span><p dir="rtl">{word.example}</p></div><button className="dictionary-sound" onClick={() => onSpeak(word.arabic)}><Volume2 size={15} /> Dengarkan</button></div>)}</div>{words.length === 0 && <div className="empty-state">Kosakata tidak ditemukan. Coba kata kunci lain.</div>}</div>;
}
