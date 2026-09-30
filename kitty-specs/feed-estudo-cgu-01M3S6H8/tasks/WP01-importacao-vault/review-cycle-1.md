---
affected_files: []
cycle_number: 1
mission_slug: feed-estudo-cgu-01M3S6H8
reproduction_command:
reviewed_at: '2026-09-30T14:08:32Z'
reviewer_agent: unknown
verdict: rejected
wp_id: WP01
---

# WP01 — review feedback (rejected)

What's good: gates all green (check 0 errors, 124 unit, build, 46 e2e); all 1,928 questions match questoes.csv exactly (gabarito, numero, situacao, enunciado/textoBase, alternativas, including the `|` inside CGU2012-P3-TI-DES-12); 69 anuladas + 100 without gabarito discarded; 140 flashcards; ids unique across the index and all lots; index↔lot map consistent; materias.json totals match; every lot ≤ 140 KB gzip; two runs are byte-identical; vault untouched; only owned files changed; C-004 check present and tested; missing feed-conteudo/ tolerated. Carousel: all screens ≤ 700 chars, split at line boundaries; `revogados` indices all point to revoked lines.

## Blocking

### B1. Revoked articles show up as current law, plus 252 superseded-version posts
The leis-secas files come from planalto with the strikethrough lost, so an article that was rewritten appears twice: the old text first, then the current text (`Redação dada…` / `Revogado…`). The importer turns every occurrence into a post (`art-67`, `art-67-2`…) and only checks the caput of each occurrence on its own. As a result:
- In **11 articles** the current version is revoked but the old version is published as if it were in force: Lei 8.112 Art. 60-C, **Art. 67** (adicional por tempo de serviço, revoked in 2001: `l:02-Lei-8112-1990-Regime-Juridico:art-67` is in the feed), Art. 231; LGPD Art. 55-B; CF ADCT Art. 109 and 111; Lei 13.844 Art. 26-A to 26-D. This goes against R6/T004 ("descartar artigo cujo caput está revogado") and would teach revoked law.
- **252 posts** with an `-N` suffix are superseded versions of the same article (e.g. `l:02-Lei-8112-1990-Regime-Juridico:art-11-2`, Decreto 11.330 Anexo I Art. 1º twice).

Fix: inside a file, with the same prefix (ADCT/Anexo N) and the same key, **the last occurrence is the one in force**. Drop the earlier ones, and if the last one has a revoked or vetoed caput, drop them all. Count the superseded occurrences as their own discard reason in the report. Keep `-N` only for a label that really repeats after this dedup, if any case is left. Add a unit test that uses a real case (8.112 Art. 67 or LGPD Art. 55-B) as a fixture.

### B2. MOT: the PDF running header lands in the middle of sentences
In 19-MOT the header block `Ministério da Transparência e Controladoria-Geral da União` / `Secretaria Federal de Controle Interno` / `Brasília, dez. 2017` (150 times in the file) gets joined into the paragraph by `emendarLinhas`. Example, `item-1-1-1-3`: "…sem prejuízo do Ministério da Transparência e Controladoria-Geral da União Secretaria Federal de Controle Interno Brasília, dez. 2017 encaminhamento às demais partes interessadas." This affects 67 lines, about 40% of the 165 MOT posts. Page numbers are already removed (`/^\d{1,4}$/` when `pdf`), so do the same for the header. A generic option: in `pdf` files, drop non-structural lines that repeat ≥ 10 times in the file, before segmentation and joining. Add a test.

### B3. IN SFC 3/2017: the Referencial Técnico (the actual content) is dropped
T004 and R6 name IN SFC 3 explicitly among the norms imported **by numbered item**. The file has 4 `Art.` in the body of the IN (approval, applicability, entry into force, revocation), so it went down the article path. Those 4 boilerplate posts were imported and the ~82k-char Anexo (the Referencial, numbered paragraphs `1.` … `N.` under Capítulo/Seção, which is core content for Fundamentos de Auditoria) was dropped with a warning. Import the Anexo's numbered paragraphs as posts (e.g. label "Anexo Item 23", or "Referencial Item 23"). Note that `segmentarItens` requires a nearly uppercase title for an undotted item, and here the items are prose paragraphs, so the rule has to be adapted for this annex. The 4 body articles can stay. Test with an excerpt from the real annex.

## Non-blocking (follow-up, record it; fixing now is optional)
- **Superseded text inside an article in force**: e.g. LGPD Art. 11 has § 4º three times (original, MP 869, Lei 13.853) and 8.112 Art. 9 has two `II -` and two `Parágrafo único`. The source has no markers. Possible heuristic: a device followed by the same label with `(Redação dada…)` is superseded, so strike it through or drop it. Otherwise, report it upstream (vault).
- **Decreto 1.171 (Código de Ética)**: the whole Code is in the Anexo (14.6k chars, rules in Roman numerals under Seções) and was dropped; only the 3 articles of the decree came in. It is exam-relevant, so it is worth importing it by section/rule (same treatment as B3).
- **14 TCU 2015 questions** carry `[Texto: ver TCU2015-BAS-10]` at the start of the `enunciado`: a reference to another question's base text that the user will not see. Resolve it by copying the `textoBase` of the referenced question, or at least strip the bracket.
- C-004: the article keys (`chaves`) do not separate ADCT/Anexo from the main body, so a résumé citing "Art. 100" passes if only ADCT Art. 100 exists. Minor.
- LGPD has `Art. 5 7. (VETADO).` (OCR); it gets keyed as Art. 5. Harmless today (vetoed and discarded), but after B1 make sure it does not "supersede" the real Art. 5: treat "Art. 5 7" as 57 or ignore it.

## Deviations: accepted
- Lots packed to 140 KB gzip (margin under 150): OK.
- "Anexo I Art. 1º" / "ADCT Art. N" labels: OK, they keep ids unique.
- Joining broken PDF lines (MOT, IN SFC 3, IN GSI): outside MOT, 100% of the lines match the source ignoring whitespace, so no words change. Only B2 needs fixing.
- References/glossary/appendices at the end of MOT cut out of the last item: OK.
- `node-minimo.d.ts` instead of `@types/node`: OK (no new dependency).
- Warning for decree annexes that only hold tables and org charts (9.681, 11.330, IN SGD 1 and 94): OK as it stands.
