<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        @click="closeModal"
      ></div>
    </Transition>

    <!-- Modal -->
    <Transition
      enter-active-class="ease-out duration-500"
      enter-from-class="opacity-0 translate-y-8 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="ease-in duration-300"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-8 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-hidden sm:overflow-y-auto"
        @click.self="closeModal"
      >
        <div class="flex h-full items-stretch justify-center p-0 text-center sm:min-h-full sm:items-center sm:p-0">
          <div
            class="relative transform overflow-hidden bg-white text-left shadow-xl transition-all w-full h-full flex flex-col sm:rounded-lg sm:my-8 sm:w-full sm:max-w-2xl sm:h-auto sm:flex-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="connect-sheet-title"
            aria-describedby="connect-sheet-description"
          >
            <!-- Header -->
            <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-4 sm:px-6 sm:py-4">
              <div class="flex items-center justify-between">
                <h3 
                  id="connect-sheet-title"
                  class="text-lg font-semibold text-white"
                >
                  Conectar Sheet Existente
                </h3>
                <button
                  @click="closeModal"
                  class="rounded-md text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                >
                  <span class="sr-only">Cerrar</span>
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Description for screen readers -->
            <div id="connect-sheet-description" class="sr-only">
              Selecciona una hoja de Google Sheets existente para conectar a tu cuenta
            </div>

            <!-- Content -->
            <div class="px-4 py-4 sm:px-6 sm:py-6 flex-1 overflow-y-auto sm:overflow-visible sm:flex-none">
              <!-- Loading state -->
              <div v-if="loadingSheets" class="flex flex-col items-center justify-center py-12">
                <svg class="animate-spin h-8 w-8 text-primary-600 mb-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-sm text-gray-600">Cargando hojas disponibles...</p>
              </div>

              <!-- Error loading sheets -->
              <div v-else-if="errorLoading" class="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p class="text-sm text-red-600">{{ errorLoading }}</p>
              </div>

              <!-- Empty state -->
              <div v-else-if="sheets.length === 0" class="flex flex-col items-center justify-center py-12">
                <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="text-sm text-gray-600 mb-2">No se encontraron hojas disponibles</p>
                <p class="text-xs text-gray-500">Asegúrate de tener hojas de Google Sheets en tu cuenta</p>
              </div>

              <!-- Sheets list -->
              <div v-else class="space-y-3">
                <p class="text-sm text-gray-600 mb-4">
                  Selecciona una hoja de Google Sheets para conectar. La hoja será validada antes de la conexión.
                </p>

                <!-- Lista de sheets -->
                <div class="space-y-2 max-h-96 overflow-y-auto">
                  <button
                    v-for="sheet in sheets"
                    :key="sheet.id"
                    @click="selectSheet(sheet)"
                    :disabled="validating || connecting"
                    class="w-full text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
                    :class="selectedSheet?.id === sheet.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-2 mb-1">
                          <svg class="w-5 h-5 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <h4 class="text-sm font-semibold text-gray-900 truncate">{{ sheet.name }}</h4>
                        </div>
                        <p v-if="sheet.modifiedTime" class="text-xs text-gray-500">
                          Última modificación: {{ formatDate(sheet.modifiedTime) }}
                        </p>
                        <p v-else class="text-xs text-gray-400">Información de fecha no disponible</p>
                      </div>
                      <!-- Check indicator -->
                      <div v-if="selectedSheet?.id === sheet.id" class="ml-3 flex-shrink-0">
                        <div class="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                <!-- Validation result -->
                <Transition
                  enter-active-class="ease-out duration-200"
                  enter-from-class="opacity-0 -translate-y-2"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="ease-in duration-150"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 -translate-y-2"
                >
                  <div v-if="validationResult" class="mt-4 p-4 rounded-lg border" :class="validationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'">
                    <div class="flex items-start space-x-3">
                      <div v-if="validationResult.isValid" class="flex-shrink-0">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div v-else class="flex-shrink-0">
                        <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p v-if="validationResult.isValid" class="text-sm font-medium text-green-800 mb-1">
                          Hoja válida
                        </p>
                        <p v-else class="text-sm font-medium text-yellow-800 mb-1">
                          Hoja no válida
                        </p>
                        <p v-if="validationResult.message" class="text-sm text-gray-700">
                          {{ validationResult.message }}
                        </p>
                        <div v-if="validationResult.missingFields && validationResult.missingFields.length > 0" class="mt-2">
                          <p class="text-xs font-medium text-yellow-800 mb-1">Campos faltantes:</p>
                          <ul class="list-disc list-inside text-xs text-gray-700 space-y-1">
                            <li v-for="field in validationResult.missingFields" :key="field">{{ field }}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>

                <!-- General error message -->
                <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-sm text-red-600">{{ error }}</p>
                </div>
              </div>
            </div>

            <!-- Sticky footer actions -->
            <div class="px-4 py-4 sm:px-6 sm:py-4 border-t bg-white sticky bottom-0">
              <div class="flex space-x-3">
                <button 
                  type="button" 
                  @click="closeModal" 
                  class="btn-secondary flex-1"
                  :disabled="validating || connecting"
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  @click="handleConnect" 
                  :disabled="!selectedSheet || !validationResult?.isValid || connecting || validating" 
                  class="btn-primary flex-1" 
                  :class="{ 'opacity-50 cursor-not-allowed': !selectedSheet || !validationResult?.isValid || connecting || validating }"
                >
                  <svg v-if="connecting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ connecting ? 'Conectando...' : 'Conectar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getAvailableSheets, validateSheet, connectSheet } from '../services/api/sheets'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'connected'])

// Estado
const sheets = ref([])
const selectedSheet = ref(null)
const validationResult = ref(null)
const loadingSheets = ref(false)
const validating = ref(false)
const connecting = ref(false)
const error = ref('')
const errorLoading = ref('')

// Formatear fecha
const formatDate = (dateString) => {
  try {
    if (!dateString) return 'Fecha no disponible'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return format(date, "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
  } catch {
    return dateString || 'Fecha no disponible'
  }
}

// Cargar sheets al abrir el modal
const loadSheets = async () => {
  loadingSheets.value = true
  errorLoading.value = ''
  try {
    sheets.value = await getAvailableSheets()
    if (sheets.value.length === 0) {
      errorLoading.value = 'No se encontraron hojas de Google Sheets en tu cuenta. Asegúrate de tener hojas creadas y que tengas permisos para acceder a ellas.'
    }
  } catch (err) {
    console.error('Error loading sheets:', err)
    const errorMessage = err.message || ''
    
    // Mensajes más descriptivos según el tipo de error
    if (errorMessage.includes('401') || errorMessage.includes('Sesión expirada') || errorMessage.includes('no autorizado')) {
      errorLoading.value = 'Tu sesión ha expirado o no tienes los permisos necesarios para acceder a Google Sheets. Por favor, inicia sesión nuevamente y asegúrate de otorgar los permisos necesarios para acceder a tus hojas de cálculo.'
    } else if (errorMessage.includes('403') || errorMessage.includes('prohibido')) {
      errorLoading.value = 'No tienes permisos para acceder a Google Sheets. Por favor, contacta al administrador o verifica que tu cuenta tenga los permisos necesarios.'
    } else if (errorMessage.includes('No se pudo conectar')) {
      errorLoading.value = 'No se pudo conectar con el servidor. Verifica tu conexión a internet e inténtalo de nuevo.'
    } else {
      errorLoading.value = errorMessage || 'Error al cargar las hojas disponibles. Por favor, inténtalo de nuevo o verifica que tengas hojas de Google Sheets en tu cuenta.'
    }
  } finally {
    loadingSheets.value = false
  }
}

// Seleccionar una hoja y validarla
const selectSheet = async (sheet) => {
  selectedSheet.value = sheet
  validationResult.value = null
  error.value = ''

  // Validar automáticamente al seleccionar
  validating.value = true
  try {
    const result = await validateSheet(sheet.id)
    validationResult.value = result
  } catch (err) {
    error.value = err.message || 'Error al validar la hoja. Inténtalo de nuevo.'
    console.error('Error validating sheet:', err)
  } finally {
    validating.value = false
  }
}

// Conectar la hoja
const handleConnect = async () => {
  if (!selectedSheet.value || !validationResult.value?.isValid) {
    return
  }

  connecting.value = true
  error.value = ''
  try {
    await connectSheet(selectedSheet.value.id)
    emit('connected', selectedSheet.value)
    closeModal()
  } catch (err) {
    error.value = err.message || 'Error al conectar la hoja. Inténtalo de nuevo.'
    console.error('Error connecting sheet:', err)
  } finally {
    connecting.value = false
  }
}

// Cerrar modal y resetear estado
const closeModal = () => {
  selectedSheet.value = null
  validationResult.value = null
  error.value = ''
  errorLoading.value = ''
  emit('close')
}

// Watch para cargar sheets cuando se abre el modal
watch(() => props.isOpen, (open) => {
  if (open) {
    loadSheets()
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden'
  } else {
    // Restaurar scroll del body
    document.body.style.overflow = ''
  }
})

// Close modal with ESC key
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.isOpen && !connecting.value && !validating.value) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // Restaurar scroll del body al desmontar
  document.body.style.overflow = ''
})
</script>

<style scoped>
.btn-primary {
  @apply inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>

