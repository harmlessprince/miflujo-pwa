<script setup>
definePageMeta({ layout: 'authentication' })
useHead({ title: 'MiFlujo — Financial intelligence for Nigerian bank statements' })
</script>

<template>
    <div class="flex flex-col min-h-screen px-6 py-10">

        <!-- Logo -->
        <header class="flex items-center justify-center gap-x-2 pt-4">
            <span class="material-symbols-outlined text-primary text-[32px]">account_balance</span>
            <span class="text-headline-md font-semibold text-primary">MiFlujo</span>
        </header>

        <!-- Main content -->
        <main class="flex-1 flex flex-col justify-center gap-y-8 max-w-sm mx-auto w-full">
            <div class="text-center space-y-4">
                <h1 class="text-display-lg font-semibold text-navy">
                    Financial intelligence for Nigerian bank statements.
                </h1>
                <p class="text-body-md font-normal text-grey">
                    Upload your PDF statements and get instant AI-driven insights,
                    categorization, and fraud detection.
                </p>
            </div>

            <GoogleButton />
        </main>

        <!-- Footer -->
        <footer class="flex flex-col items-center gap-y-3 pb-4">
            <nav class="flex items-center gap-x-6">
                <a href="#" class="text-body-sm font-normal text-navy hover:text-primary transition-colors">
                    Terms of Service
                </a>
                <a href="#" class="text-body-sm font-normal text-navy hover:text-primary transition-colors">
                    Privacy Policy
                </a>
                <a href="#" class="text-body-sm font-normal text-navy hover:text-primary transition-colors">
                    Support
                </a>
            </nav>
            <p class="text-label-caps font-bold uppercase text-grey tracking-widest">
                &copy; 2024 MiFlujo Technologies
            </p>
        </footer>

    </div>
</template>
