<script setup lang="ts">
import type { FormSubmissionInput, Priority } from '~/types/database';

// Form state
const formData = reactive<FormSubmissionInput>({
  full_name: '',
  email: '',
  phone: '',
  company: '',
  job_title: '',
  message: '',
  category: '',
  priority: undefined,
});

const loading = ref(false);
const error = ref('');
const success = ref(false);

// Priority options
const priorityOptions: Priority[] = ['low', 'medium', 'high'];

// Category options (customize as needed)
const categoryOptions = [
  'General Inquiry',
  'Technical Support',
  'Billing',
  'Feedback',
  'Other',
];

// Handle form submission
const handleSubmit = async () => {
  error.value = '';
  success.value = false;

  // Validation
  if (!formData.full_name || !formData.email) {
    error.value = 'Please fill in all required fields (Full Name and Email)';
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    error.value = 'Please enter a valid email address';
    return;
  }

  loading.value = true;

  try {
    const { data, error: submitError } = await $fetch<{ data: any; error?: string }>('/api/submissions/create', {
      method: 'POST',
      body: formData,
    });

    if (submitError) {
      error.value = submitError;
    } else {
      success.value = true;

      // Reset form
      Object.assign(formData, {
        full_name: '',
        email: '',
        phone: '',
        company: '',
        job_title: '',
        message: '',
        category: '',
        priority: undefined,
      });

      // Redirect after success
      setTimeout(() => {
        navigateTo('/');
      }, 2000);
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to submit form';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Submit New Data</h1>

        <!-- Success Message -->
        <div
          v-if="success"
          class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
        >
          Form submitted successfully! Redirecting to view data...
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
        >
          {{ error }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Full Name (Required) -->
          <div>
            <label for="full_name" class="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span class="text-red-500">*</span>
            </label>
            <input
              id="full_name"
              v-model="formData.full_name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>

          <!-- Email (Required) -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john@example.com"
            />
          </div>

          <!-- Phone (Optional) -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>

          <!-- Company (Optional) -->
          <div>
            <label for="company" class="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              id="company"
              v-model="formData.company"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Acme Inc."
            />
          </div>

          <!-- Job Title (Optional) -->
          <div>
            <label for="job_title" class="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              id="job_title"
              v-model="formData.job_title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Software Engineer"
            />
          </div>

          <!-- Category (Optional) -->
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              v-model="formData.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              <option v-for="cat in categoryOptions" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <!-- Priority (Optional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div class="flex gap-4">
              <label
                v-for="priority in priorityOptions"
                :key="priority"
                class="flex items-center"
              >
                <input
                  v-model="formData.priority"
                  type="radio"
                  :value="priority"
                  class="mr-2"
                />
                <span class="capitalize">{{ priority }}</span>
              </label>
            </div>
          </div>

          <!-- Message (Optional) -->
          <div>
            <label for="message" class="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              v-model="formData.message"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your message here..."
            ></textarea>
          </div>

          <!-- Submit Button -->
          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {{ loading ? 'Submitting...' : 'Submit Form' }}
            </button>
            <button
              type="button"
              @click="navigateTo('/')"
              class="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
