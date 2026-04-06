export default function FooterES() {
  return (
    <footer className="px-6 py-12" style={{ background: 'var(--brand-fg)', color: 'rgba(255,255,255,0.7)' }}>
      <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-6">
        <p className="text-sm">© 2026 Nestor Segura</p>

        <div className="text-sm flex items-center gap-0">
          <a href="#" className="text-white/50 hover:text-white transition">Aviso legal</a>
          <span className="text-white/20">{' | '}</span>
          <a href="#" className="text-white/50 hover:text-white transition">Política de privacidad</a>
          <span className="text-white/20">{' | '}</span>
          <a href="#" className="text-white/50 hover:text-white transition">Impressum</a>
        </div>

        <a
          href="https://linkedin.com/in/nestorsegura"
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            className="fill-white/50 group-hover:fill-white transition"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
      </div>
    </footer>
  )
}
