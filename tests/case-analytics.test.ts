import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { trackGoal } from '../lib/analytics'
import ts from 'typescript'
import vm from 'node:vm'

test('analytics requires CookieConsent initialization even when another ym function exists', () => {
  const calls: unknown[][] = []
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window')
  const fake = { ym: (...args: unknown[]) => calls.push(args), __ymLoaded: false, location: { pathname: '/cases/future' } }
  Object.defineProperty(globalThis, 'window', { value: fake, configurable: true })
  try {
    trackGoal('case_view', { case_id: 'future' })
    assert.equal(calls.length, 0)
    fake.__ymLoaded = true
    trackGoal('case_view', { case_id: 'future' })
    assert.deepEqual(calls, [[53776969, 'reachGoal', 'case_view', { case_id: 'future', page_path: '/cases/future' }]])
  } finally {
    if (original) Object.defineProperty(globalThis, 'window', original)
    else Reflect.deleteProperty(globalThis, 'window')
  }
})

test('real CaseTracking hook lifecycle defers until consent, emits once and cleans up on navigation', () => {
  const calls: unknown[][] = []
  const listeners = new Set<() => void>()
  const fake = { __ymLoaded: false, ym: () => {}, location: { pathname: '/cases/one', search: '?utm_source=instagram&text=private' },
    addEventListener: (_: string, callback: () => void) => listeners.add(callback),
    removeEventListener: (_: string, callback: () => void) => listeners.delete(callback) }
  let effect: (() => (() => void)) | undefined
  const ref = { current: null }
  const source = readFileSync(new URL('../components/CaseTracking.tsx', import.meta.url), 'utf8')
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const exports: { CaseTracking?: (props: { caseId: string }) => void } = {}
  vm.runInNewContext(js, { exports, window: fake, require: (id: string) => {
    if (id === 'react') return { useRef: () => ref, useEffect: (fn: typeof effect) => { effect = fn } }
    if (id.includes('analytics')) return { trackGoal: (...args: unknown[]) => calls.push(args) }
    if (id.includes('contact-events')) return { contactContext: () => ({ utm_source: 'instagram' }) }
    throw new Error(id)
  } })
  exports.CaseTracking!({ caseId: 'one' })
  let cleanup = effect!()
  assert.equal(calls.length, 0)
  fake.__ymLoaded = true
  listeners.forEach(callback => callback())
  listeners.forEach(callback => callback())
  assert.equal(calls.length, 1)
  assert.equal(JSON.stringify(calls[0]), JSON.stringify(['case_view', { utm_source: 'instagram', case_id: 'one' }]))
  cleanup()
  assert.equal(listeners.size, 0)
  exports.CaseTracking!({ caseId: 'one' })
  cleanup = effect!()
  assert.equal(calls.length, 1)
  cleanup()
  exports.CaseTracking!({ caseId: 'two' })
  cleanup = effect!()
  assert.equal(calls.length, 2)
  cleanup()
})

test('case view subscribes to consent-ready, uses existing tracker and deduplicates effect reruns', () => {
  const component = readFileSync(new URL('../components/CaseTracking.tsx', import.meta.url), 'utf8')
  const consent = readFileSync(new URL('../components/CookieConsent.tsx', import.meta.url), 'utf8')
  const page = readFileSync(new URL('../app/cases/[slug]/page.tsx', import.meta.url), 'utf8')
  assert.ok(component.includes("trackGoal('case_view'"))
  assert.ok(component.includes('useRef'))
  assert.ok(component.includes('removeEventListener'))
  assert.ok(component.includes('clc:analytics-ready'))
  assert.ok(consent.includes("dispatchEvent(new Event('clc:analytics-ready'))"))
  assert.ok(page.includes('<CaseTracking caseId={item.id}'))
  assert.ok(!component.includes('contact_'))
})
