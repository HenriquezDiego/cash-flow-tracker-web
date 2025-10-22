<template>
  <div class="space-y-6 pb-20 lg:pb-6">
    <!-- Header mejorado -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gastos</h1>
        <p class="text-sm text-gray-600 mt-1">Administra tus gastos y mantén el control de tus finanzas</p>
      </div>
      
      <!-- Botón de agregar mejorado para desktop -->
      <div class="flex justify-end">
        <button
          v-if="showAddButton"
          @click="showModal = true"
          class="btn-primary items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Agregar Gasto</span>
        </button>
      </div>
    </div>

    <!-- Layout Container -->
    <div class="lg:grid lg:grid-cols-3 lg:gap-6">
      <!-- UNA SOLA instancia del componente de gastos -->
      <div class="lg:col-span-2">
        <ExpensesListComponent 
          ref="expensesListRef" 
          @edit-expense="openEdit" 
          @delete-expense="confirmDelete"
          :class="{
            // Mobile: ocultar si no está en tab de gastos
            'hidden lg:block': activeTab !== 'expenses'
          }"
        />
      </div>

      <!-- Sidebar Desktop -->
      <div class="hidden lg:block lg:col-span-1 space-y-6">
        <BudgetProgress amount-size="sm" />
        <FixedExpensesManager />
      </div>
    </div>

    <!-- Mobile: Contenido de otros tabs -->
    <div class="lg:hidden">
      <!-- Tab: Gastos Fijos -->
      <div v-show="activeTab === 'fixed'" class="space-y-4 min-h-[calc(100vh-200px)] pb-20">
        <FixedExpensesManager />
      </div>

      <!-- Tab: Resumen -->
      <div v-show="activeTab === 'summary'" class="space-y-4 min-h-[calc(100vh-200px)] pb-20">
        <BudgetProgress amount-size="sm" />
      </div>
    </div>

    <!-- Modal para agregar gastos -->
    <ExpenseModal 
      :is-open="showModal"
      :expense="editingExpense"
      @close="closeModal"
      @expense-added="afterChange"
      @expense-updated="afterChange"
    />

    <!-- Quick Actions Flotante (solo mobile) -->
    <Teleport to="body">
      <div class="fixed bottom-20 right-4 z-50 sm:hidden">
        <!-- Botón Principal mejorado -->
        <button
          @click="toggleQuickActions"
          class="w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-500/30 group"
          :class="{ 'rotate-45': showQuickActions }"
          aria-label="Agregar gasto"
          title="Agregar gasto"
        >
          <svg 
            class="w-7 h-7 mx-auto transition-transform duration-300" 
            :class="{ 'rotate-45': showQuickActions }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>

        <!-- Menú de Acciones mejorado -->
        <div v-if="showQuickActions" class="absolute bottom-20 right-0 mb-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 z-[60]">
          <div class="px-3 pb-2 border-b border-gray-100">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Acciones rápidas</p>
          </div>
          
          <!-- Agregar Gasto (acción principal) -->
          <button
            @click="openAddExpense"
            class="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-200 group"
          >
            <div class="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-200 transition-colors duration-200">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <div class="text-sm font-semibold">Agregar Gasto</div>
              <div class="text-xs text-gray-500">Registrar nuevo gasto</div>
            </div>
          </button>

          <!-- Filtros Avanzados -->
          <button
            @click="openAdvancedFilters"
            class="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 group"
          >
            <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors duration-200">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <div class="text-sm font-semibold">Filtros</div>
              <div class="text-xs text-gray-500">Categoría, tipo, período</div>
            </div>
          </button>

          <!-- Filtrar por Fecha -->
          <button
            @click="openDateFilter"
            class="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 group"
          >
            <div class="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors duration-200">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div class="text-sm font-semibold">Filtrar Fecha</div>
              <div class="text-xs text-gray-500">Rango personalizado</div>
            </div>
          </button>
        </div>

        <!-- Overlay para cerrar -->
        <div 
          v-if="showQuickActions" 
          class="fixed inset-0 z-40" 
          @click="showQuickActions = false"
        ></div>
      </div>
    </Teleport>

    <!-- Navegación móvil inferior -->
    <MobileBottomNavigation 
      :current-tab="activeTab"
      @tab-change="handleTabChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import ExpenseModal from '../components/ExpenseModal.vue'
import MobileBottomNavigation from '../components/MobileBottomNavigation.vue'
import { notify } from '../services/notifications.js'
import ExpensesListComponent from '../components/ExpensesList.vue'
import BudgetProgress from '../components/BudgetProgress.vue'
import FixedExpensesManager from '../components/FixedExpensesManager.vue'
import { useExpenseStore } from '../stores/expenseStore'

const expenseStore = useExpenseStore()
const showModal = ref(false)
const editingExpense = ref(null)
const showQuickActions = ref(false)
const expensesListRef = ref(null)
const activeTab = ref('expenses') // 'expenses' | 'fixed' | 'summary'
const showAddButton = ref(false) // Solo mostrar en desktop
const isDesktop = ref(window.innerWidth >= 1024) // lg breakpoint

const openEdit = (expense) => {
  editingExpense.value = expense
  showModal.value = true
}

const openAddExpense = () => {
  editingExpense.value = null
  showModal.value = true
  showQuickActions.value = false
}

const toggleQuickActions = () => {
  showQuickActions.value = !showQuickActions.value
}

const openAdvancedFilters = async () => {
  showQuickActions.value = false
  activeTab.value = 'expenses'
  
  // Esperar a que Vue renderice el cambio de tab antes de expandir
  await nextTick()
  
  expensesListRef.value?.expandFilters?.()
}

const openDateFilter = () => {
  showQuickActions.value = false
  expensesListRef.value?.toggleRange?.()
}

const handleTabChange = (tab) => {
  activeTab.value = tab
}

const confirmDelete = async (expense) => {
  // Delegado al componente hijo con dialog; este es fallback si se usa el evento
  try {
    await expenseStore.deleteExpense(expense.id)
    notify.success('Gasto eliminado')
  } catch (e) {
    notify.error('No se pudo eliminar el gasto')
  }
}

const closeModal = () => {
  showModal.value = false
  editingExpense.value = null
}

const afterChange = () => { closeModal(); notify.success('Cambios guardados') }

// Detectar tamaño de pantalla para mostrar/ocultar botón
const updateScreenSize = () => {
  showAddButton.value = window.innerWidth >= 640
  isDesktop.value = window.innerWidth >= 1024
}

// Inicializar y escuchar cambios de tamaño
onMounted(() => {
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})
</script>

<style scoped>
.btn-primary {
  @apply inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}
</style>