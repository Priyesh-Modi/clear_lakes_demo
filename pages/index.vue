<script setup lang="ts">
import type { FormSubmission } from '~/types/database';

const { profile, isAdmin } = useAuth();

// Reactive state for submissions
const submissions = ref<FormSubmission[]>([]);
const loading = ref(true);
const error = ref('');

// Fetch submissions
const fetchSubmissions = async () => {
  loading.value = true;
  error.value = '';

  try {
    const { data, error: fetchError } = await $fetch<{ data: FormSubmission[]; error?: string }>('/api/submissions/list');

    if (fetchError) {
      error.value = fetchError;
    } else {
      submissions.value = data || [];
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch submissions';
  } finally {
    loading.value = false;
  }
};

// Load submissions on mount
onMounted(async () => {
  await fetchSubmissions();
});

// Format date for display
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-800">
            {{ isAdmin ? 'All Submissions' : 'My Submissions' }}
          </h1>
          <button
            @click="fetchSubmissions"
            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <p class="text-gray-500">Loading submissions...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>

        <!-- Empty State -->
        <div v-else-if="submissions.length === 0" class="text-center py-8">
          <p class="text-gray-500 mb-4">No submissions found.</p>
          <button
            @click="navigateTo('/addData')"
            class="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Create Your First Submission
          </button>
        </div>

        <!-- Submissions Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="submission in submissions" :key="submission.id" class="hover:bg-gray-50">
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ submission.full_name }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ submission.email }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ submission.company || '-' }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm">
                  <span
                    :class="{
                      'bg-red-100 text-red-800': submission.priority === 'high',
                      'bg-yellow-100 text-yellow-800': submission.priority === 'medium',
                      'bg-green-100 text-green-800': submission.priority === 'low',
                      'bg-gray-100 text-gray-800': !submission.priority,
                    }"
                    class="px-2 py-1 rounded-full text-xs font-semibold uppercase"
                  >
                    {{ submission.priority || 'none' }}
                  </span>
                </td>
                <td class="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {{ submission.message || '-' }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(submission.created_at) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Summary -->
        <div class="mt-4 text-sm text-gray-600">
          Total: {{ submissions.length }} submission{{ submissions.length !== 1 ? 's' : '' }}
        </div>
      </div>
    </div>
  </div>
</template>
