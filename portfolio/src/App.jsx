import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Demos from './components/Demos'
import Skills from './components/Skills'
import Contact from './components/Contact'

export default function App() {
  return (
    <>
      <a
        href="#proyectos"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-200 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-ink"
      >
        Saltar al contenido
      </a>

      <Nav />

      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Demos />
        <Skills />
        <Contact />
      </main>

      <footer className="border-t border-line px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-mist sm:flex-row">
          <p>© {new Date().getFullYear()} Daniel Alconada Díaz</p>
          <p className="font-mono">React · Vite · Tailwind CSS</p>
        </div>
      </footer>
    </>
  )
}
