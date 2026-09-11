import { useEffect } from 'react'

export default function useReveal() {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const elements = [...document.querySelectorAll('#actualites .section-heading, #actualites .news-card, .coverage-copy, .coverage-map-panel, .footer-main')]
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          target.classList.add('is-revealed')
          observer.unobserve(target)
        }
      })
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0.18 })
    const showAll = () => {
      if (preference.matches) {
        elements.forEach(element => element.classList.add('is-revealed'))
        observer.disconnect()
      }
    }
    if (!preference.matches) elements.forEach((element, index) => {
      element.classList.add('scroll-reveal')
      element.classList.add('puzzle-reveal')
      element.style.setProperty('--reveal-delay', `${index % 5 * 130}ms`)
      observer.observe(element)
    })
    preference.addEventListener('change', showAll)
    return () => {
      observer.disconnect()
      preference.removeEventListener('change', showAll)
      elements.forEach(element => element.classList.remove('scroll-reveal', 'puzzle-reveal', 'is-revealed'))
    }
  }, [])
}
