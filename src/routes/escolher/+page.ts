import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// FR-001: a escolha de concurso deixou de existir; favoritos antigos de /escolher levam ao feed.
export const load: PageLoad = () => {
	redirect(307, '/');
};
