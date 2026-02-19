/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                navy: {
                    900: '#0B2C6B', // Primary Navy
                    800: '#123C8C', // Secondary Navy (Hover)
                },
                gold: {
                    500: '#D4AF37', // Accent Gold
                },
                gray: {
                    50: '#F4F6F9',  // Light Grey Background
                    200: '#E5E7EB', // Border Grey
                    800: '#1F2937', // Text Primary
                    600: '#374151', // Body Text
                }
            },
            fontFamily: {
                sans: ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            boxShadow: {
                'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }
        },
    },
    plugins: [],
}
