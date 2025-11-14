<script setup lang="ts">
import 'vue-sonner/style.css';

import { Toaster } from '@/components/ui/sonner';
import { useClipboard } from '@vueuse/core';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Copy, Check, ExternalLink, Github, AlertCircle } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const scripts = [
  {
    id: 'survey',
    title: 'Survey Autofill',
    description: 'Automatically fill survey forms on wjx.cn with random selections',
    code: "fetch('https://getthevoid.github.io/dna-automation/scripts/survey/autofill.js').then(r=>r.text()).then(eval);",
    source: '/dna-automation/scripts/survey/autofill.js'
  },
  {
    id: 'divination',
    title: 'Divination Bot',
    description: 'Unlock all 17 character roles in the divination event on dna-panstudio.com',
    code: "fetch('https://getthevoid.github.io/dna-automation/scripts/events/divination-bot.js').then(r=>r.text()).then(eval);",
    source: '/dna-automation/scripts/events/divination-bot.js'
  }
];

const clipboardMap = new Map(
  scripts.map(script => [script.id, useClipboard({ source: script.code })])
);

const handleCopy = (id: string, title: string) => {
  const clipboard = clipboardMap.get(id);
  if (clipboard) {
    clipboard.copy();
    toast.success(`${title} copied to clipboard`);
  }
};
</script>

<template>
  <main class="min-h-screen p-8">
    <div class="container space-y-12">
      <div class="space-y-2">
        <h1 class="text-3xl font-semibold">DNA Automation</h1>
        <p class="text-muted-foreground text-sm">Console scripts for Duet Night Abyss</p>
      </div>

      <Alert variant="destructive">
        <AlertCircle class="size-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          These scripts are provided for educational purposes only. Use at your own risk.
        </AlertDescription>
      </Alert>

      <div class="space-y-6">
        <Card v-for="script in scripts" :key="script.id">
          <CardHeader>
            <CardTitle>{{ script.title }}</CardTitle>
            <CardDescription>{{ script.description }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="bg-foreground/10 relative rounded-md p-3">
              <code class="block overflow-x-auto pr-20 text-xs">{{ script.code }}</code>
              <Button
                @click="handleCopy(script.id, script.title)"
                size="icon-sm"
                variant="ghost"
                class="absolute top-2 right-2"
              >
                <Check v-if="clipboardMap.get(script.id)?.copied.value" />
                <Copy v-else />
              </Button>
            </div>
            <a
              :href="script.source"
              target="_blank"
              class="text-muted-foreground inline-flex items-center gap-1 text-xs hover:underline"
            >
              View source
              <ExternalLink class="h-3 w-3" />
            </a>
          </CardContent>
        </Card>
      </div>

      <footer class="border-t pt-6 text-center">
        <a
          href="https://github.com/getthevoid/dna-automation"
          class="text-muted-foreground hover:text-primary inline-flex items-center gap-2 text-sm transition-colors hover:underline"
        >
          <Github class="size-4" />
          GitHub Repository
        </a>
      </footer>
    </div>
  </main>
  <Toaster />
</template>
