// node --test netlify/functions/_bayRules.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { frontBayOpen, backBayFirstViolation } from './_bayRules.js'

const takenSet = (keys) => (b, d) => keys.includes(`${b}|${d}`)
const D = '2026-10-10'

test('Bay 1 opens only once Bay 2 is taken; Bay 4 once Bay 3 is', () => {
  assert.equal(frontBayOpen(1, D, takenSet([])), false)
  assert.equal(frontBayOpen(1, D, takenSet([`2|${D}`])), true)
  assert.equal(frontBayOpen(4, D, takenSet([])), false)
  assert.equal(frontBayOpen(4, D, takenSet([`3|${D}`])), true)
})
test('back bays are always open', () => {
  assert.equal(frontBayOpen(2, D, takenSet([])), true)
  assert.equal(frontBayOpen(3, D, takenSet([])), true)
})
test('booking the pair together is fine (a large boat, or both chosen)', () => {
  assert.equal(backBayFirstViolation([{ berthId: 1, slotDate: D }, { berthId: 2, slotDate: D }], takenSet([])), null)
})
test('refuses a front bay whose back bay is free that day', () => {
  assert.deepEqual(backBayFirstViolation([{ berthId: 4, slotDate: D }], takenSet([])), { front: 4, back: 3, date: D })
})
test('the back bay must be taken on the SAME day', () => {
  assert.notEqual(backBayFirstViolation([{ berthId: 1, slotDate: D }], takenSet(['2|2026-10-11'])), null)
})
