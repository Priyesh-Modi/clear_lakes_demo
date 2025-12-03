<script setup lang="ts">
const { user, profile, isAdmin, signOut, fetchProfile } = useAuth();

// Fetch profile on mount
onMounted(async () => {
  await fetchProfile();
});

// Handle logout
const handleLogout = async () => {
  await signOut();
  navigateTo('/auth');
};
</script>

<template>
  <div class="flex flex-col w-full px-4 pt-4 gap-4">
    <!-- Top Row: Logo and User Info -->
    <div class="flex flex-row justify-between items-start">
      <img
        src="../public/full_logo.png"
        alt="Clear Lakes Dental"
        class="w-[256px] h-[152px]"
      />

      <!-- User Info and Logout -->
      <div class="flex flex-col items-end gap-2 pt-4">
        <div class="text-sm text-gray-600">
          <p class="font-medium">{{ profile?.email }}</p>
          <p class="text-xs">
            Role: <span class="font-semibold uppercase">{{ profile?.role }}</span>
          </p>
        </div>
        <button
          @click="handleLogout"
          class="text-sm bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Navigation Row -->
    <div class="flex flex-row gap-4 justify-center flex-wrap">
      <button
        class="text-xl font-semibold border-2 border-[#a5dcb0] rounded-lg px-4 py-2 hover:bg-[#a5dcb0] hover:text-white cursor-pointer transition-colors"
        @click="navigateTo('/')"
      >
        View Data
      </button>
      <button
        class="text-xl font-semibold border-2 border-[#9ad7db] rounded-lg px-4 py-2 hover:bg-[#9ad7db] hover:text-white cursor-pointer transition-colors"
        @click="navigateTo('/addData')"
      >
        Add Data
      </button>
      <button
        v-if="isAdmin"
        class="text-xl font-semibold border-2 border-[#f4c2c2] rounded-lg px-4 py-2 hover:bg-[#f4c2c2] hover:text-white cursor-pointer transition-colors"
        @click="navigateTo('/users')"
      >
        Manage Users
      </button>
    </div>
  </div>
</template>
