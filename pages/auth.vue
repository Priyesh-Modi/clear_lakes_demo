<script setup lang="ts">
const route = useRoute();
const { signIn, signUp } = useAuth();

// Form state
const isSignUp = ref(false);
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Check for error query param (e.g., banned user)
onMounted(() => {
  if (route.query.error === 'banned') {
    errorMessage.value = 'Your account has been banned. Please contact an administrator.';
  }
});

// Handle form submission
const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  // Validation
  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in all fields';
    return;
  }

  if (isSignUp.value && password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match';
    return;
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters';
    return;
  }

  loading.value = true;

  try {
    if (isSignUp.value) {
      const { data, error } = await signUp(email.value, password.value);

      if (error) {
        errorMessage.value = error;
      } else {
        successMessage.value = 'Account created successfully! Redirecting...';
        setTimeout(() => {
          navigateTo('/');
        }, 1500);
      }
    } else {
      const { data, error } = await signIn(email.value, password.value);

      if (error) {
        errorMessage.value = error;
      } else {
        successMessage.value = 'Login successful! Redirecting...';
        setTimeout(() => {
          navigateTo('/');
        }, 1000);
      }
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An error occurred';
  } finally {
    loading.value = false;
  }
};

// Toggle between sign in and sign up
const toggleMode = () => {
  isSignUp.value = !isSignUp.value;
  errorMessage.value = '';
  successMessage.value = '';
  password.value = '';
  confirmPassword.value = '';
};
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
    <div class="mb-8">
      <img
        src="/full_logo.png"
        alt="Clear Lakes Dental"
        class="w-64 h-auto"
      />
    </div>

    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-3xl font-bold text-center mb-6">
        {{ isSignUp ? 'Create Account' : 'Sign In' }}
      </h1>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
      >
        {{ errorMessage }}
      </div>

      <!-- Success Message -->
      <div
        v-if="successMessage"
        class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
      >
        {{ successMessage }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <!-- Confirm Password (Sign Up only) -->
        <div v-if="isSignUp">
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In') }}
        </button>
      </form>

      <!-- Toggle Mode -->
      <div class="mt-4 text-center">
        <button
          @click="toggleMode"
          class="text-blue-500 hover:text-blue-600 text-sm"
        >
          {{ isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up" }}
        </button>
      </div>
    </div>
  </div>
</template>
