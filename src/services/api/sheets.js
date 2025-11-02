import { makeRequest } from '../httpClient'

const base = '/auth'

/**
 * Obtiene todas las hojas de Google Sheets disponibles del usuario
 * @returns {Promise<Array>} Lista de hojas con id, name, modifiedTime, etc.
 */
export async function getAvailableSheets() {
  try {
    console.log('[Sheets API] Fetching available sheets from /auth/sheets')
    const response = await makeRequest(`${base}/sheets`, {
      skipAuthRedirect: true // Prevenir redirección automática para manejar el error mejor
    })
    console.log('[Sheets API] Response from /auth/sheets:', response)
    
    // El backend puede devolver { data: [...] } o directamente [...]
    const items = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
    
    if (!Array.isArray(items)) {
      console.warn('Unexpected response format from /auth/sheets:', response)
      return []
    }
    
    return items.map(sheet => ({
      id: sheet?.id || '',
      name: sheet?.name || '',
      modifiedTime: sheet?.modifiedTime || sheet?.modified_time || null
    }))
  } catch (error) {
    console.error('Error in getAvailableSheets:', error)
    // Re-lanzar el error para que el componente lo maneje
    throw error
  }
}

/**
 * Valida si una hoja de Google Sheets tiene la estructura correcta
 * @param {string} sheetId - ID de la hoja de Google Sheets
 * @returns {Promise<Object>} Resultado de validación con isValid, missingFields, etc.
 */
export async function validateSheet(sheetId) {
  const response = await makeRequest(`${base}/sheet/validate`, {
    method: 'POST',
    body: JSON.stringify({ sheetId }),
    skipAuthRedirect: true
  })
  // El backend devuelve { success: true, data: { isValid, missingSheets, ... } }
  const data = response?.data || response
  return {
    isValid: data?.isValid ?? false,
    missingFields: data?.missingSheets || data?.missingFields || [],
    message: data?.missingSheets?.length > 0 
      ? `Faltan las siguientes hojas: ${data.missingSheets.join(', ')}`
      : data?.message || ''
  }
}

/**
 * Conecta una hoja de Google Sheets al usuario
 * @param {string} sheetId - ID de la hoja de Google Sheets
 * @returns {Promise<Object>} Resultado de la conexión
 */
export async function connectSheet(sheetId) {
  const response = await makeRequest(`${base}/sheet`, {
    method: 'PUT',
    body: JSON.stringify({ sheetId })
  })
  return response
}

