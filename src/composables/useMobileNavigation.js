import { ref, onMounted, onUnmounted } from 'vue'

export function useMobileNavigation() {
  const menuRef = ref(null)
  let intervalId = null
  let handleResize = null

  // Funciones de detección (más simples y directas)
  const isChromeMobile = () => {
    const userAgent = navigator.userAgent
    return userAgent.includes('Chrome') && userAgent.includes('Mobile')
  }

  const isDevToolsOpen = () => {
    const threshold = 160
    return window.outerHeight - window.innerHeight > threshold
  }

  const isDevToolsZoom100 = () => {
    return window.devicePixelRatio === 1 && isDevToolsOpen()
  }

  const isTallScreen = () => {
    return window.innerHeight > 800
  }

  const isProblematicHeight = () => {
    return window.innerHeight > 844
  }

  // Aplicar estilos básicos
  const applyBasicStyles = () => {
    if (menuRef.value) {
      const menu = menuRef.value
      menu.style.position = 'fixed'
      menu.style.bottom = '0px'
      menu.style.left = '0px'
      menu.style.right = '0px'
      menu.style.width = '100%'
      menu.style.zIndex = '9999'
      menu.style.transform = 'translateZ(0)'
    }
  }

  // Aplicar correcciones específicas para pantallas altas
  const applyTallScreenFix = () => {
    if (menuRef.value && isTallScreen()) {
      const menu = menuRef.value
      
      // Aplicar estilos base
      menu.style.position = 'fixed'
      menu.style.bottom = '0px'
      menu.style.left = '0px'
      menu.style.right = '0px'
      menu.style.width = '100%'
      menu.style.zIndex = '9999'
      menu.style.top = 'auto'
      
      // Correcciones específicas para alturas problemáticas
      if (isProblematicHeight()) {
        if (isDevToolsZoom100()) {
          // Fix específico para DevTools
          menu.style.transform = 'translate3d(0, 0, 0)'
          menu.style.willChange = 'transform'
          menu.style.maxHeight = '100dvh'
        } else if (isChromeMobile()) {
          // Fix específico para Chrome Mobile
          menu.style.transform = 'translate3d(0, 0, 0)'
          menu.style.willChange = 'transform'
        }
      }
    }
  }

  // Inicializar navegación
  const initializeNavigation = () => {
    if (isTallScreen()) {
      applyTallScreenFix()
    } else {
      applyBasicStyles()
    }
    
    // Event listeners para cambios de pantalla
    handleResize = () => {
      if (isTallScreen()) {
        applyTallScreenFix()
      } else {
        applyBasicStyles()
      }
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize)
    
    // Para pantallas problemáticas, aplicar corrección periódica
    if (isProblematicHeight()) {
      intervalId = setInterval(() => {
        applyTallScreenFix()
      }, 200)
    }
  }

  // Cleanup
  const cleanup = () => {
    if (handleResize) {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize)
    }
    
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  return {
    menuRef,
    initializeNavigation,
    cleanup
  }
}
