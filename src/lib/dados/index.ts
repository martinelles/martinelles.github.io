import concursos from './concursos.json';
import ferramentas from './ferramentas.json';
import config from './config.json';
import { validarDados } from './validar';

export const dados = validarDados({ concursos, ferramentas, config });
export const buscarConcurso = (id: string | null) => dados.concursos.find((c) => c.id === id) ?? null;
export const buscarFerramenta = (id: string) => dados.ferramentas.find((f) => f.id === id) ?? null;
export { validarDados } from './validar';
export * from './tipos';
