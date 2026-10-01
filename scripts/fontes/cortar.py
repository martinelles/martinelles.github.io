"""Corta as fontes do app (Literata e Grandstander) em .woff2 pequenos, só com o latim.

O que faz: baixa as fontes variáveis do repositório google/fonts, fixado num commit, para
scripts/fontes/origem/ (fora do git); instancia cada uma num peso estático; corta para o
latim usado em pt-BR; grava em static/fontes/ e junta as licenças em static/fontes/OFL.txt.
No fim imprime o tamanho de cada arquivo e a soma, e sai com erro se a soma passar de 110 KB
(NFR-002: teto de 120 KB, com 10 KB de folga para a textura).

Commit fixado do google/fonts: 9710da1eacb3be272583c3224dcb70f9da6eadbb (main em 2026-09-30).
Nomes conferidos na listagem desse commit: Literata[opsz,wght].ttf, Literata-Italic[opsz,wght].ttf
e Grandstander[wght].ttf. O eixo opsz da Literata vai de 7 a 72, então opsz=12 vale sem ajuste.

Reprodutível: o head.modified da fonte de origem é mantido (recalcTimestamp=False), e rodar de
novo gera arquivos com o mesmo hash.

Data: 2026-09-30.
Como rodar (Python 3 com fontTools e brotli): python scripts/fontes/cortar.py
"""

import sys
import urllib.parse
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

COMMIT = '9710da1eacb3be272583c3224dcb70f9da6eadbb'
BASE = f'https://raw.githubusercontent.com/google/fonts/{COMMIT}/ofl'

RAIZ = Path(__file__).resolve().parents[2]
ORIGEM = RAIZ / 'scripts' / 'fontes' / 'origem'
DESTINO = RAIZ / 'static' / 'fontes'

TETO_KB = 110

# (arquivo de origem, eixos da instância, arquivo de saída)
CORTES = [
	('literata/Literata[opsz,wght].ttf', {'wght': 400, 'opsz': 12}, 'literata-400.woff2'),
	('literata/Literata-Italic[opsz,wght].ttf', {'wght': 400, 'opsz': 12}, 'literata-400i.woff2'),
	('literata/Literata[opsz,wght].ttf', {'wght': 700, 'opsz': 12}, 'literata-700.woff2'),
	('grandstander/Grandstander[wght].ttf', {'wght': 700}, 'grandstander-700.woff2'),
]

LICENCAS = [('Literata', 'literata/OFL.txt'), ('Grandstander', 'grandstander/OFL.txt')]

UNICODES = 'U+0000-00FF, U+0131, U+0152-0153, U+2013-2014, U+2018-201E, U+2022, U+2026, U+20AC'


def baixar(caminho: str) -> Path:
	"""Baixa o arquivo do commit fixado, se ainda não estiver em origem/."""
	local = ORIGEM / caminho
	if not local.exists():
		local.parent.mkdir(parents=True, exist_ok=True)
		url = f'{BASE}/{urllib.parse.quote(caminho)}'
		print(f'baixando {url}')
		with urllib.request.urlopen(url) as resposta:
			local.write_bytes(resposta.read())
	return local


def opcoes() -> subset.Options:
	o = subset.Options()
	o.layout_features = ['kern', 'liga']
	o.flavor = 'woff2'
	o.hinting = False
	o.name_IDs = [0, 1, 2, 3, 4, 5, 6]
	return o


def cortar(origem: Path, eixos: dict, saida: Path) -> None:
	fonte = TTFont(origem, recalcTimestamp=False)
	fvar = {a.axisTag: (a.minValue, a.maxValue) for a in fonte['fvar'].axes}
	for eixo, valor in eixos.items():
		minimo, maximo = fvar[eixo]
		if not minimo <= valor <= maximo:
			sys.exit(f'{origem.name}: {eixo}={valor} fora de [{minimo}, {maximo}]')
	estatica = instantiateVariableFont(fonte, eixos)
	o = opcoes()
	cortador = subset.Subsetter(options=o)
	cortador.populate(unicodes=subset.parse_unicodes(UNICODES))
	cortador.subset(estatica)
	estatica.flavor = o.flavor
	saida.parent.mkdir(parents=True, exist_ok=True)
	estatica.save(saida, reorderTables=True)


def main() -> None:
	for caminho, eixos, arquivo in CORTES:
		cortar(baixar(caminho), eixos, DESTINO / arquivo)

	partes = []
	for familia, caminho in LICENCAS:
		texto = baixar(caminho).read_text(encoding='utf-8').strip()
		partes.append(f'== {familia} ==\n\n{texto}\n')
	(DESTINO / 'OFL.txt').write_text('\n'.join(partes), encoding='utf-8', newline='\n')

	soma = 0
	for _, _, arquivo in CORTES:
		tamanho = (DESTINO / arquivo).stat().st_size
		soma += tamanho
		print(f'{arquivo:<26} {tamanho / 1024:6.1f} KB')
	print(f'{"soma":<26} {soma / 1024:6.1f} KB (teto {TETO_KB} KB)')
	if soma > TETO_KB * 1024:
		sys.exit(f'soma {soma / 1024:.1f} KB passa do teto de {TETO_KB} KB (NFR-002)')


if __name__ == '__main__':
	main()
