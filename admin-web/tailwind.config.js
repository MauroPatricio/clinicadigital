/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                    950: '#2e1065',
                },
                accent: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    500: '#14b8a6',
                    600: '#0d9488',
                },
                slate: {
                    950: '#020617',
                }
            },
            fontFamily: {
                sans: ['Inter', 'Outfit', 'sans-serif'],
            },
            boxShadow: {
                'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1), 0 1px 4px -1px rgba(0, 0, 0, 0.05)',
                'premium-hover': '0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 1px 6px -1px rgba(0, 0, 0, 0.05)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'scale-in': 'scaleIn 0.4s cubic-bezier(0.2, 1, 0.3, 1) forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
