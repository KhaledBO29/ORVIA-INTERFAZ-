import { expect, test } from '@playwright/test';
import {
  catalog,
  emptyDraft,
  inventory,
  journal,
  quote,
  seed,
  validateDraft,
  validState,
} from '../../src/app/core/erp';
test('IVA por línea, retención y logística se calculan con redondeo en COP', () => {
  const d = {
    ...emptyDraft('orden'),
    lines: [
      { productId: 'CB-DIE', quantity: 100, price: 10800, iva: 0, stockCost: 0 },
      { productId: 'RP-BAN', quantity: 4, price: 235000, iva: 19, stockCost: 0 },
    ],
    freight: 60000,
    loading: 20000,
    retention: 2.5,
  };
  expect(quote(d)).toEqual({
    subtotal: 2020000,
    tax: 178600,
    withheld: 50500,
    gross: 2278600,
    total: 2228100,
    logistics: 80000,
  });
});
test('todas las operaciones de ejemplo cuadran el asiento y el inventario no mezcla plantas', () => {
  const s = seed();
  expect(validState(s)).toBe(true);
  for (const d of s.documents)
    expect(journal(d).reduce((s, l) => s + l.debit - l.credit, 0)).toBe(0);
  expect(
    inventory(s.documents).find((p) => p.id === 'CB-DIE' && p.plant === 'Planta Principal')
      ?.quantity,
  ).toBe(800);
  expect(
    inventory(s.documents).find((p) => p.id === 'CB-DIE' && p.plant === 'Planta El Encano')
      ?.quantity,
  ).toBe(340);
});
test('validación rechaza productos duplicados, NaN, unidades fraccionarias y fechas inválidas', () => {
  const draft = {
    ...emptyDraft('orden'),
    partyId: 'PR-REP',
    lines: [{ productId: 'RP-ROD', quantity: 1, price: 680000, iva: 19, stockCost: 0 }],
  };
  expect(() => validateDraft(draft, seed())).not.toThrow();
  expect(() =>
    validateDraft({ ...draft, lines: [...draft.lines, ...draft.lines] }, seed()),
  ).toThrow(/Agrupa/);
  expect(() =>
    validateDraft({ ...draft, lines: [{ ...draft.lines[0], quantity: 1.5 }] }, seed()),
  ).toThrow(/cantidades/);
  expect(() => validateDraft({ ...draft, freight: NaN }, seed())).toThrow(/costos/);
  expect(() => validateDraft({ ...draft, date: '2026-02-30' }, seed())).toThrow(/fechas/);
  expect(() =>
    validateDraft({ ...draft, lines: [{ ...draft.lines[0], price: Infinity }] }, seed()),
  ).toThrow();
});
test('la restauración rechaza esquemas incompletos, documentos duplicados y referencias inexistentes', () => {
  expect(validState({ version: 2, documents: [], parties: [{}] })).toBe(false);
  const s = seed();
  s.documents.push(s.documents[0]);
  expect(validState(s)).toBe(false);
  const t = seed();
  t.documents[0].lines[0].productId = 'NO-EXISTE';
  expect(validState(t)).toBe(false);
});
