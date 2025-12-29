const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
    requireAuth?: boolean;
}

interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Array<{ msg: string; param: string }>;
}

class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor() {
        this.baseUrl = API_URL;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('token');
        }
    }

    setToken(token: string | null) {
        this.token = token;
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('token', token);
            } else {
                localStorage.removeItem('token');
            }
        }
    }

    getToken() {
        return this.token;
    }

    private async request<T>(
        endpoint: string,
        options: FetchOptions = {}
    ): Promise<ApiResponse<T>> {
        const { requireAuth = true, ...fetchOptions } = options;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (requireAuth && this.token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...fetchOptions,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error');
        }
    }

    async get<T>(endpoint: string, options?: FetchOptions) {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    async post<T>(endpoint: string, body?: unknown, options?: FetchOptions) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async put<T>(endpoint: string, body?: unknown, options?: FetchOptions) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    async delete<T>(endpoint: string, options?: FetchOptions) {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }

    async uploadFile<T>(endpoint: string, formData: FormData, options?: FetchOptions) {
        const { requireAuth = true, ...fetchOptions } = options || {};

        const headers: HeadersInit = {};

        if (requireAuth && this.token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...fetchOptions,
                method: 'POST',
                headers,
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            return data as ApiResponse<T>;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Upload error');
        }
    }
}

export const api = new ApiClient();

// Auth API
export const authApi = {
    register: (data: { name: string; email: string; password: string }) =>
        api.post('/auth/register', data, { requireAuth: false }),

    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data, { requireAuth: false }),

    getMe: () => api.get('/auth/me'),

    updateProfile: (data: { name?: string; avatar?: string }) =>
        api.put('/auth/profile', data),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
        api.put('/auth/password', data),

    verifyEmail: (token: string) =>
        api.post('/auth/verify-email', { token }, { requireAuth: false }),
};

// Presentations API
export const presentationsApi = {
    getAll: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
        const queryString = params
            ? '?' + new URLSearchParams(params as Record<string, string>).toString()
            : '';
        return api.get(`/presentations${queryString}`);
    },

    getOne: (id: string) => api.get(`/presentations/${id}`),

    update: (id: string, data: { title?: string; description?: string; slides?: unknown[]; theme?: string }) =>
        api.put(`/presentations/${id}`, data),

    delete: (id: string) => api.delete(`/presentations/${id}`),

    export: (id: string, options?: { enableAnimations: boolean }) => api.post(`/presentations/${id}/export`, options),

    getDownloadUrl: (id: string) => `${API_URL}/presentations/${id}/download`,
};

// Generate API
export const generateApi = {
    fromText: (data: { content: string; title?: string; slideCount?: number; theme?: string }) =>
        api.post('/generate/text', data),

    fromFile: (formData: FormData) =>
        api.uploadFile('/generate/file', formData),

    improve: (id: string, instruction: string) =>
        api.post(`/generate/${id}/improve`, { instruction }),

    preview: (data: { content: string; slideCount?: number }) =>
        api.post('/generate/preview', data),
};
