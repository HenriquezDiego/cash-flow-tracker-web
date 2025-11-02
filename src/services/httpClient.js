// Ligero cliente HTTP con manejo de baseURL, headers, autenticación y mensajes de error

import { getToken, removeToken } from './auth.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

function joinUrl(base, endpoint) {
  if (!base) return endpoint
  if (!endpoint) return base
  if (base.endsWith('/') && endpoint.startsWith('/')) return base + endpoint.slice(1)
  if (!base.endsWith('/') && !endpoint.startsWith('/')) return `${base}/${endpoint}`
  return base + endpoint
}

export async function makeRequest(endpoint, options = {}) {
  const url = joinUrl(API_BASE_URL, endpoint)

  // Obtener token de autenticación
  const token = getToken()
  
  // Preparar headers con token si existe
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  }
  
  // Agregar Authorization header si hay token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Opcional: timeout simple
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 30000)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers
    })

    console.log(`[HTTP] ${options.method || 'GET'} ${endpoint} - Status: ${response.status}`)

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`
      let errorData = null
      
      try {
        errorData = await response.json()
        errorMessage = errorData?.message || errorData?.error || errorMessage
      } catch {
        const text = await response.text()
        if (text) errorMessage = text
      }

      console.error(`[HTTP Error] ${endpoint}:`, {
        status: response.status,
        message: errorMessage,
        data: errorData
      })

      // Manejar error 401 (no autorizado o token expirado)
      // Opción para prevenir redirección automática si se especifica
      if (response.status === 401 && !options.skipAuthRedirect) {
        removeToken()
        window.location.href = '/login'
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.')
      } else if (response.status === 401) {
        // Si skipAuthRedirect está activo, solo lanzar el error sin redirigir
        throw new Error(`Error de autenticación: ${errorMessage}`)
      }
      
      throw new Error(errorMessage)
    }

    if (response.status === 204) return {}
    try {
      return await response.json()
    } catch (parseError) {
      console.warn('Failed to parse response as JSON:', parseError)
      return {}
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('La solicitud tardó demasiado y fue cancelada.')
    }
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.')
    }
    console.error('HTTP error:', error)
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}


