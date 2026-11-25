<script setup lang="ts">
import {
  CircleAlertIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@lucide/vue'
import { useForm } from 'vee-validate'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toLoginError, useLoginMutation } from '@/features/auth/api/auth'
import { toTypedSchema } from '@/lib/zod-typed-schema'

const emit = defineEmits<{ success: [] }>()

/** Domyślny czas blokady, gdy backend nie zwróci nagłówka Retry-After. */
const DEFAULT_LOCK_SECONDS = 15 * 60

const schema = z.object({
  username: z.string().trim().min(1, 'Wpisz login.'),
  password: z.string().min(1, 'Wpisz hasło.'),
  remember: z.boolean(),
})

type LoginFormValues = z.infer<typeof schema>

const { defineField, errors, handleSubmit, resetField, submitCount } = useForm<LoginFormValues>({
  validationSchema: toTypedSchema(schema),
  initialValues: { username: '', password: '', remember: false },
})

const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')
const [remember] = defineField('remember')

const showPassword = ref(false)
const credentialsRejected = ref(false)
const lockedUntil = ref<number | null>(null)
let unlockTimer: ReturnType<typeof setTimeout> | undefined

const { mutateAsync, isPending } = useLoginMutation()

const isLocked = computed(() => lockedUntil.value !== null)
// Błędy walidacji pokazujemy dopiero po pierwszej próbie wysłania, potem na bieżąco.
const usernameError = computed(() => (submitCount.value > 0 ? errors.value.username : undefined))
const passwordError = computed(() => (submitCount.value > 0 ? errors.value.password : undefined))
const usernameInvalid = computed(() => Boolean(usernameError.value) || credentialsRejected.value)
const passwordInvalid = computed(() => Boolean(passwordError.value) || credentialsRejected.value)

// Po poprawieniu danych zdejmujemy czerwone obramowanie błędu logowania
// (czyszczenie hasła po odrzuceniu nie jest poprawką, więc je pomijamy).
watch([username, password], ([nextUsername, nextPassword], [prevUsername]) => {
  if (nextUsername !== prevUsername || nextPassword) credentialsRejected.value = false
})

function lock(seconds: number) {
  lockedUntil.value = Date.now() + seconds * 1000
  clearTimeout(unlockTimer)
  unlockTimer = setTimeout(() => {
    lockedUntil.value = null
  }, seconds * 1000)
}

onBeforeUnmount(() => clearTimeout(unlockTimer))

const onSubmit = handleSubmit(async (values) => {
  if (isLocked.value) return
  credentialsRejected.value = false

  try {
    await mutateAsync(values)
    emit('success')
  } catch (error) {
    const loginError = toLoginError(error)

    if (loginError.kind === 'invalid-credentials') {
      credentialsRejected.value = true
      resetField('password')
      toast.error('Nie udało się zalogować', {
        id: 'login-status',
        description: 'Login lub hasło są nieprawidłowe. Sprawdź dane i spróbuj ponownie.',
      })
    } else if (loginError.kind === 'locked') {
      const seconds = loginError.retryAfterSeconds ?? DEFAULT_LOCK_SECONDS
      const minutes = Math.max(1, Math.ceil(seconds / 60))
      lock(seconds)
      toast.warning('Zbyt wiele prób logowania', {
        id: 'login-status',
        description: `Ze względów bezpieczeństwa logowanie zostało chwilowo wstrzymane. Spróbuj ponownie za ${minutes} min lub skontaktuj się z administratorem.`,
        duration: 10_000,
      })
    } else {
      toast.error('Nie udało się zalogować', {
        id: 'login-status',
        description: 'Serwer jest chwilowo niedostępny. Spróbuj ponownie za chwilę.',
      })
    }
  }
})

function onForgotPassword() {
  toast.info('Reset hasła', {
    id: 'login-status',
    description:
      'Hasło do konta firmowego (AD) zresetuje administrator. Skontaktuj się z działem IT.',
  })
}
</script>

<template>
  <form
    class="flex w-full flex-col gap-5 rounded-2xl border bg-card p-8 text-card-foreground shadow-[0_8px_24px_rgb(15_23_41/0.06)]"
    novalidate
    :aria-busy="isPending"
    :data-state="isLocked ? 'locked' : credentialsRejected ? 'error' : 'default'"
    @submit="onSubmit"
  >
    <div class="flex flex-col gap-1.5">
      <h1 class="text-[22px] leading-tight font-bold">Zaloguj się</h1>
      <p class="text-[13px] text-muted-foreground">
        Użyj konta firmowego (AD/LDAPS), aby uzyskać dostęp do systemu EOD.
      </p>
    </div>

    <fieldset class="flex flex-col gap-5" :disabled="isLocked || isPending">
      <div class="flex flex-col gap-1.5">
        <Label for="login-username" class="text-xs font-semibold">Login</Label>
        <div class="relative">
          <UserIcon
            class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            :class="usernameInvalid ? 'text-destructive' : 'text-muted-foreground'"
            aria-hidden="true"
          />
          <Input
            id="login-username"
            v-model="username"
            v-bind="usernameAttrs"
            name="username"
            autocomplete="username"
            autocapitalize="none"
            spellcheck="false"
            placeholder="np. akowalska"
            class="h-11 rounded-[10px] pl-10 text-sm"
            :aria-invalid="usernameInvalid || undefined"
            :aria-describedby="usernameError ? 'login-username-error' : undefined"
          />
        </div>
        <!-- Stała wysokość, żeby karta nie „skakała” po pokazaniu błędu. -->
        <p
          :id="usernameError ? 'login-username-error' : undefined"
          class="flex min-h-4 items-center gap-1.5 text-xs font-medium text-destructive"
          aria-live="polite"
        >
          <template v-if="usernameError">
            <CircleAlertIcon class="size-3.25" aria-hidden="true" />
            {{ usernameError }}
          </template>
        </p>
      </div>

      <div class="flex flex-col gap-1.5">
        <Label for="login-password" class="text-xs font-semibold">Hasło</Label>
        <div class="relative">
          <LockIcon
            class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            :class="passwordInvalid ? 'text-destructive' : 'text-muted-foreground'"
            aria-hidden="true"
          />
          <Input
            id="login-password"
            v-model="password"
            v-bind="passwordAttrs"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Wpisz hasło"
            class="h-11 rounded-[10px] pr-11 pl-10 text-sm"
            :aria-invalid="passwordInvalid || undefined"
            :aria-describedby="passwordError ? 'login-password-error' : undefined"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            class="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
            :aria-label="showPassword ? 'Ukryj hasło' : 'Pokaż hasło'"
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            <EyeOffIcon v-if="showPassword" />
            <EyeIcon v-else />
          </Button>
        </div>
        <!-- Stała wysokość, żeby karta nie „skakała” po pokazaniu błędu. -->
        <p
          :id="passwordError ? 'login-password-error' : undefined"
          class="flex min-h-4 items-center gap-1.5 text-xs font-medium text-destructive"
          aria-live="polite"
        >
          <template v-if="passwordError">
            <CircleAlertIcon class="size-3.25" aria-hidden="true" />
            {{ passwordError }}
          </template>
        </p>
      </div>

      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <Checkbox id="login-remember" v-model="remember" name="remember" class="size-4.5" />
          <Label for="login-remember" class="text-[13px] font-medium">Zapamiętaj mnie</Label>
        </div>
        <Button
          type="button"
          variant="link"
          class="h-auto p-0 text-[13px] font-semibold"
          @click="onForgotPassword"
        >
          Nie pamiętasz hasła?
        </Button>
      </div>
    </fieldset>

    <Button
      type="submit"
      class="h-11 rounded-[10px] text-sm font-semibold hover:bg-primary/90"
      :disabled="isLocked || isPending"
    >
      <Loader2Icon v-if="isPending" class="animate-spin" aria-hidden="true" />
      {{ isPending ? 'Logowanie…' : 'Zaloguj się' }}
    </Button>

    <p
      class="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground"
    >
      <ShieldCheckIcon class="size-3 shrink-0" aria-hidden="true" />
      Połączenie szyfrowane (TLS). Problem z kontem? Skontaktuj się z administratorem.
    </p>
  </form>
</template>
