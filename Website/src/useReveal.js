import { useEffect } from 'react'

export default function useReveal() {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const elements = [...document.querySelectorAll('.service-card, .stat, .statistics-intro, .section-heading, .news-card, .coverage-copy, .coverage-map-panel, .footer-main')]
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          target.classList.add('is-revealed')
          observer.unobserve(target)
        }
      })
    }, { threshold: 0.08 })
    const showAll = () => {
      if (preference.matches) {
        elements.forEach(element => element.classList.add('is-revealed'))
        observer.disconnect()
      }
    }
    if (!preference.matches) elements.forEach((element, index) => {
      element.classList.add('scroll-reveal')
      element.style.setProperty('--reveal-delay', `${index % 4 * 55}ms`)
      observer.observe(element)
    })
    preference.addEventListener('change', showAll)
    return () => {
      observer.disconnect()
      preference.removeEventListener('change', showAll)
      elements.forEach(element => element.classList.remove('scroll-reveal', 'is-revealed'))
    }
  }, [])
}
