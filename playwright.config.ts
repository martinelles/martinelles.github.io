import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: 'tests/e2e',
	// Com 3+ workers, o primeiro teste de cada worker estoura o timeout nesta máquina Windows (medicoes.md, obs. 3).
	workers: 2,
	webServer: {
		command: 'npm run build && npm run preview -- --port 4173 --strictPort',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	},
	use: { baseURL: 'http://localhost:4173', locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' },
	projects: [{ name: 'chromium', use: { ...devices['Pixel 7'] } }]
});
