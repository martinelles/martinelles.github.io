import { describe, expect, it } from 'vitest';
import { aceitaQuestoes, idTarefa, modoDe, topicoDe } from '$lib/plano/ids';

describe('ids de tarefa (emenda D4)', () => {
	it('monta e desmonta `<topicoId>:L|Q`', () => {
		expect(idTarefa('CDA-01', 'leitura')).toBe('CDA-01:L');
		expect(idTarefa('CDA-01', 'questoes')).toBe('CDA-01:Q');
		expect(topicoDe('CDA-01:L')).toBe('CDA-01');
		expect(topicoDe('CDA-01:Q')).toBe('CDA-01');
		expect(topicoDe('CDA-01')).toBe('CDA-01');
		expect(modoDe('CDA-01:L')).toBe('leitura');
		expect(modoDe('CDA-01:Q')).toBe('questoes');
		expect(modoDe('CDA-01')).toBeNull();
	});

	it('só :Q aceita questões', () => {
		expect(aceitaQuestoes('CDA-01:Q')).toBe(true);
		expect(aceitaQuestoes('CDA-01:L')).toBe(false);
		expect(aceitaQuestoes('CDA-01')).toBe(false);
	});
});
