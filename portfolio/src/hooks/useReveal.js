import { useEffect, useRef, useState } from 'react'

/**
 * Anade la clase .visible al elemento cuando entra en pantalla.
 * Se hace con IntersectionObserver en vez de una libreria de animacion
 * para no anadir dependencias a un sitio estatico.
 */
export function useReveal({ threshold = 0.15, once = true } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Sin soporte de IntersectionObserver, mostrar el contenido sin animar.
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('visible')
      return
    }

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          el.classList.add('visible')
          if (once) observer.unobserve(el)
        } else if (!once) {
          el.classList.remove('visible')
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  return ref
}

/**
 * Devuelve el id de la seccion visible en pantalla, para resaltarla
 * en la navegacion.
 */
export function useSeccionActiva(ids) {
  const [activa, setActiva] = useState(ids[0])

  useEffect(() => {
    const secciones = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    if (!secciones.length || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entradas) => {
        // De todas las secciones visibles, la que ocupa mas pantalla gana.
        const visible = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiva(visible.target.id)
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.3, 0.6] },
    )

    secciones.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [ids])

  return activa
}

/** Progreso de lectura de la pagina, de 0 a 1. */
export function useProgresoScroll() {
  const [progreso, setProgreso] = useState(0)

  useEffect(() => {
    let pendiente = false

    const alScroll = () => {
      if (pendiente) return
      pendiente = true
      requestAnimationFrame(() => {
        const alto = document.documentElement.scrollHeight - window.innerHeight
        setProgreso(alto > 0 ? window.scrollY / alto : 0)
        pendiente = false
      })
    }

    window.addEventListener('scroll', alScroll, { passive: true })
    alScroll()
    return () => window.removeEventListener('scroll', alScroll)
  }, [])

  return progreso
}
