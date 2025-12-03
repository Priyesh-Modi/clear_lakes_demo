<script setup lang="ts">
import type { Profile, UserRole } from '~/types/database';

const { profile, isAdmin } = useAuth();

// Redirect if not admin
onMounted(() => {
  if (!isAdmin.value) {
    navigateTo('/');
  }
});

// State
const users = ref<Profile[]>([]);
const loading = ref(true);
const error = ref('');

// Create user modal state
const showCreateModal = ref(false);
const createForm = reactive({
  email: '',
  password: '',
  role: 'basic' as UserRole,
});
const createLoading = ref(false);
const createError = ref('');

// Fetch all users
const fetchUsers = async () => {
  loading.value = true;
  error.value = '';

  try {
    const { data, error: fetchError } = await $fetch<{ data: Profile[]; error?: string }>('/api/users/list');

    if (fetchError) {
      error.value = fetchError;
    } else {
      users.value = data || [];
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch users';
  } finally {
    loading.value = false;
  }
};

// Create new user
const handleCreateUser = async () => {
  createError.value = '';

  if (!createForm.email || !createForm.password) {
    createError.value = 'Email and password are required';
    return;
  }

  if (createForm.password.length < 6) {
    createError.value = 'Password must be at least 6 characters';
    return;
  }

  createLoading.value = true;

  try {
    const { data, error: submitError } = await $fetch<{ data: any; error?: string }>('/api/users/create', {
      method: 'POST',
      body: {
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
      },
    });

    if (submitError) {
      createError.value = submitError;
    } else {
      // Reset form
      createForm.email = '';
      createForm.password = '';
      createForm.role = 'basic';
      showCreateModal.value = false;

      // Refresh users list
      await fetchUsers();
    }
  } catch (err: any) {
    createError.value = err.message || 'Failed to create user';
  } finally {
    createLoading.value = false;
  }
};

// Toggle user ban status
const toggleBan = async (user: Profile) => {
  const newBanStatus = !user.is_banned;

  try {
    const { data, error: updateError } = await $fetch<{ data: any; error?: string }>('/api/users/update', {
      method: 'POST',
      body: {
        userId: user.id,
        is_banned: newBanStatus,
      },
    });

    if (updateError) {
      alert(`Error: ${updateError}`);
    } else {
      // Update local state
      user.is_banned = newBanStatus;
    }
  } catch (err: any) {
    alert(`Error: ${err.message || 'Failed to update user'}`);
  }
};

// Change user role
const changeRole = async (user: Profile, newRole: UserRole) => {
  try {
    const { data, error: updateError } = await $fetch<{ data: any; error?: string }>('/api/users/update', {
      method: 'POST',
      body: {
        userId: user.id,
        role: newRole,
      },
    });

    if (updateError) {
      alert(`Error: ${updateError}`);
    } else {
      // Update local state
      user.role = newRole;
    }
  } catch (err: any) {
    alert(`Error: ${err.message || 'Failed to update user'}`);
  }
};

// Load users on mount
onMounted(async () => {
  await fetchUsers();
});

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-800">User Management</h1>
          <div class="flex gap-4">
            <button
              @click="fetchUsers"
              class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
            <button
              @click="showCreateModal = true"
              class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Create New User
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <p class="text-gray-500">Loading users...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>

        <!-- Users Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ user.email }}
                  <span v-if="user.id === profile?.id" class="ml-2 text-xs text-blue-600">(You)</span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm">
                  <select
                    :value="user.role"
                    @change="changeRole(user, ($event.target as HTMLSelectElement).value as UserRole)"
                    class="border border-gray-300 rounded px-2 py-1 text-sm"
                    :disabled="user.id === profile?.id"
                  >
                    <option value="basic">Basic</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm">
                  <span
                    :class="{
                      'bg-red-100 text-red-800': user.is_banned,
                      'bg-green-100 text-green-800': !user.is_banned,
                    }"
                    class="px-2 py-1 rounded-full text-xs font-semibold uppercase"
                  >
                    {{ user.is_banned ? 'Banned' : 'Active' }}
                  </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.created_at) }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm">
                  <button
                    @click="toggleBan(user)"
                    :disabled="user.id === profile?.id"
                    :class="{
                      'bg-red-500 hover:bg-red-600': !user.is_banned,
                      'bg-green-500 hover:bg-green-600': user.is_banned,
                      'opacity-50 cursor-not-allowed': user.id === profile?.id,
                    }"
                    class="text-white px-3 py-1 rounded-md transition-colors text-xs"
                  >
                    {{ user.is_banned ? 'Unban' : 'Ban' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Summary -->
          <div class="mt-4 text-sm text-gray-600">
            Total: {{ users.length }} user{{ users.length !== 1 ? 's' : '' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Create User Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showCreateModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">Create New User</h2>

        <!-- Error Message -->
        <div
          v-if="createError"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
        >
          {{ createError }}
        </div>

        <form @submit.prevent="handleCreateUser" class="space-y-4">
          <!-- Email -->
          <div>
            <label for="new-email" class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="new-email"
              v-model="createForm.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="new-password" class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="new-password"
              v-model="createForm.password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <!-- Role -->
          <div>
            <label for="new-role" class="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="new-role"
              v-model="createForm.role"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="basic">Basic</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <!-- Buttons -->
          <div class="flex gap-4 mt-6">
            <button
              type="submit"
              :disabled="createLoading"
              class="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {{ createLoading ? 'Creating...' : 'Create User' }}
            </button>
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
