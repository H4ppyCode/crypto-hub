import { defineStore, storeToRefs } from 'pinia'
import type { ComputedRef, Ref } from 'vue'
import { computed, ref } from 'vue'
import type { Router } from 'vue-router'
import { useRouter } from 'vue-router'
import { $fetch } from "~/composables/use-fetch";
import type { AfterFetchContext, OnFetchErrorContext } from '@vueuse/core'

interface User {
    id: string
    email: string
    username: string
    avatar: string
    created_at: string
    roles: Role[]
}

interface Role {
    name: string
}

export interface ApiResponse<T> {
    data: T
}

export function useAuth() {
    const router: Router = useRouter()
    const token = useCookie('crypto-token')
    const user = useState<User | null>('user')

    const login = () => {
        const errorMessage: Ref<string> = ref<string>('')

        const { data, statusCode, post } = $fetch('users/login', {
            method: 'POST',
        }, {
            immediate: false,
            onFetchError: ({ data }: OnFetchErrorContext<any>): any => {
                errorMessage.value = data?.message || 'Une erreur est survenue'
            },
            async afterFetch({ data }: AfterFetchContext<{ token: string, user: User}>): Promise<any> {
                if (data?.token) {
                    errorMessage.value = ''
                    user.value = data.user
                    token.value = data.token
                    await router.push({ name: 'home' })
                }
            },
        }).json()

        return { data, statusCode, post, errorMessage }
    }

    const register = () => {
        const errorMessage: Ref<string> = ref<string>('')

        const { post } = $fetch('users/register', {
            method: 'POST',
        }, {
            immediate: false,
            onFetchError: ({ data }: OnFetchErrorContext<any>): any => {
                errorMessage.value = data?.message || 'Une erreur est survenue'
            },
            async afterFetch(ctx: AfterFetchContext<any>): Promise<any> {
                if (ctx?.data) {
                    errorMessage.value = ''
                    await router.push({ name: 'login' })
                }
            },
        }).json<ApiResponse<User>>()

        return { errorMessage, post }
    }

    const logout = async (): Promise<void> => {
        await $fetch('users/session/log_out', {
            method: 'DELETE',
        })

        user.value = null
        token.value = null
        await router.push({ name: 'index' })
    }

    const whoami = async (): Promise<void> => {
        if (!token.value)
            return

        await $fetch<User>('users/profile', {
            method: 'GET',
        }, {
            afterFetch({ data }: AfterFetchContext<User>): any {
                if (data) {
                    user.value = data
                }
            }
        }).json<ApiResponse<User>>()

        // if ([401, 403].includes(statusCode.value || 0)) {
        //     user.value = null
        //     document.cookie = ''
        //     return
        // }
    }

    const isLogged: ComputedRef<boolean> = computed(() => !!user.value)

    return {
        user,
        logout,
        register,
        login,
        isLogged,
        whoami,
    }
}
