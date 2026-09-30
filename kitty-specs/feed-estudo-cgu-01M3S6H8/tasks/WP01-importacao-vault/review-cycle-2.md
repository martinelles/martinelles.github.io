---
affected_files: []
cycle_number: 2
mission_slug: feed-estudo-cgu-01M3S6H8
reproduction_command:
reviewed_at: '2026-09-30T14:27:10Z'
reviewer_agent: unknown
verdict: rejected
wp_id: WP01
---

# WP01 — review feedback, cycle 2 (rejected: 1 narrow blocker)

What was verified and is good (commit f3b190d):
- **B1 fixed.** None of the 11 cases is in the feed (8.112 Art. 60-C, 67, 231; LGPD 55-B; ADCT 109, 111; 13.844 26-A..26-D). Every lei id equals `slug(label)`: 0 `-N` suffixes and no duplicate labels. Spot checks show the last wording: CF Art. 107 (EC 122), 111-A, 112 (EC 45); 8.112 Art. 11; ADCT 107-A. The real LGPD Art. 5º is intact and "Art. 5 7." is skipped with a warning. 276 superseded wordings are discarded. I checked every superseded/kept pair whose wording differs a lot (31 pairs: CF 40/201/202/241, 8.112 19/46/133/140, 8429 1/7/16/17/23, ADCT 60/109…). All are real rewrites, and no distinct article was dropped by mistake. The "Este texto não substitui…" rule only removes content in 8.112, where it drops 5 articles, and all 5 belong to the separate promulgation act of vetoed parts (Art. 87 dotted, 192, 193, 231 dotted, 240 dotted, 250). The CF, 9.681 and 11.330 reset at ADCT/Anexo and lose nothing (aposFim = 0).
- **B2 fixed.** In MOT, only the 3 running-header lines (≥149×) are removed. No other PDF file has a line removed. The header text is gone from MOT posts. The one remaining match (item 3.3, "Secretaria Federal de Controle Interno") is legitimate prose.
- **B3 mostly fixed.** There are 180 "Referencial item N" posts covering 1–181. Item 5 is absent because it is revoked by IN SFC 7/2017, which is correct. Repeated numbers (20, 26, 48, 93–99, 102) are real IN 07 rewrites, and the last one wins. Items 1, 23, 77, 150 and 180 match the source.
- The Código de Ética has 19 incisos, and the 6 missing ones (XVII, XIX, XX, XXI, XXIII, XXV) are all revoked by Decreto 6.029/2007. This is correct.
- 1,928 questions, 0 gabarito mismatches against questoes.csv. 4,046 unique ids. Real output: 0 schema violations (using `esquema.ts`). Largest lot is 139.8 KB gzip. Two runs are byte-identical. The vault is untouched. Gates: check 0/0, 134 unit, build, 46 e2e. Only owned files are changed.

## Blocking

### B4. Referencial: the next section's subtitle leaks into the end of the previous item (30 of 180 posts)
The Referencial's section subtitles are plain lines in the source, not `#`, so `segmentarParagrafosAnexo` appends them to the item before them. Examples:
- item 99 ends "…Unidades Auditadas. (Redação dada pela Instrução Normativa SFC nº 07, de 2017) Gerenciamento de Recursos"
- Other items end with "\nSegunda linha de defesa", "\nPrograma de Trabalho", "\nSigilo Profissional", "\nGovernança", "\nPlanejamento", and so on.

This is the same class of defect as B2: text that isn't part of the paragraph shows up in the study card, and in 2 cases it is glued onto the same line. WP02 would commit it as content.

To list them: Referencial posts whose last line does not end in `.`, `;`, `:` or `)`. There are 31 of these, but item 57 is a false positive because the source itself ends in "autoridade competente" with no period.

Suggested fix: in the anexo segmentation, treat a line as a subtitle and close the current item when all of these hold:
- the line is short (for example ≤ 80 characters)
- it doesn't end in sentence punctuation
- the line before it ends in `.`, `;`, `:` or `)`
- the next line is a numbered paragraph, another such line, a `#`, or the end of the anexo

This keeps item 57, whose previous line ends in "da". Add a unit test with a real excerpt that has "Gerenciamento de Recursos" between items 99 and 100 and "Programa de Trabalho". The test should check that neither subtitle appears in any post and that item 57 keeps "autoridade competente". Optional: use the subtitle as the item's `subtopico`/context instead of throwing it away.

## Non-blocking (record as follow-up)
- **Lapsed MP wording kept as in force** (8.112 Art. 68, "Redação dada pela MP 568/2012"): acceptable as follow-up. It is a single known case, and the source annotation is visible in the card. Detecting it needs outside data (MP conversion or lapse), not parsing. Record it as a known limit or report it upstream to the vault.
- The non-blocking items from cycle 1 still stand: duplicate devices inside an article that is in force (LGPD Art. 11 § 4º ×3), `[Texto: ver …]` in 14 TCU 2015 questions, and C-004 keys not separated by scope.
