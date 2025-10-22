<template>
  <!-- Versión de emergencia sin Teleport -->
  <div 
    v-if="isMobile"
    class="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 shadow-lg"
    :style="menuStyle"
  >
    <div class="flex h-16 px-2">
      <button
        @click="navigateToTab('expenses')"
        :class="[
          'flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200',
          activeTab === 'expenses' 
            ? 'text-primary-600 bg-primary-50' 
            : 'text-gray-500 hover:text-gray-700'
        ]"
      >
        <div class="relative">
          <svg class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <div v-if="activeTab === 'expenses'" class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"></div>
        </div>
        <span class="text-xs font-medium mt-1">Gastos</span>
      </button>
      
      <button
        @click="navigateToTab('fixed')"
        :class="[
          'flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200',
          activeTab === 'fixed' 
            ? 'text-primary-600 bg-primary-50' 
            : 'text-gray-500 hover:text-gray-700'
        ]"
      >
        <div class="relative">
          <svg class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <div v-if="activeTab === 'fixed'" class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"></div>
        </div>
        <span class="text-xs font-medium mt-1">Fijos</span>
      </button>
      
      <button
        @click="navigateToTab('summary')"
        :class="[
          'flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200',
          activeTab === 'summary' 
            ? 'text-primary-600 bg-primary-50' 
            : 'text-gray-500 hover:text-gray-700'
        ]"
      >
        <div class="relative">
          <svg class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <div v-if="activeTab === 'summary'" class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"></div>
        </div>
        <span class="text-xs font-medium mt-1">Resumen</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Props
const props = defineProps({
  currentTab: {
    type: String,
    default: 'expenses'
  }
})

// Emits
const emit = defineEmits(['tab-change'])

// Computed
const activeTab = computed(() => props.currentTab)
const isMobile = ref(false)

// Estilo dinámico para el menú
const menuStyle = computed(() => {
  const viewportHeight = window.innerHeight
  const isTall = viewportHeight > 800
  
  if (isTall) {
    return {
      position: 'fixed',
      top: `${viewportHeight - 64}px`,
      left: '0',
      right: '0',
      width: '100%',
      zIndex: '9999'
    }
  } else {
    return {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      width: '100%',
      zIndex: '9999'
    }
  }
})

// Methods
const navigateToTab = (tab) => {
  emit('tab-change', tab)
  
  if (route.path === '/') {
    router.replace({ 
      path: '/', 
      query: { tab: tab } 
    })
  }
}

// Detectar si es móvil
const checkMobile = () => {
  isMobile.value = window.innerWidth < 640 // sm breakpoint
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })
})
</script>
