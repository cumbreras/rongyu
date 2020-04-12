import { extractBearer } from './extractBearer'

test('it should extract', () => {
  const headerValue = 'Bearer 123'
  const expectedExtracted = '123'
  expect(extractBearer(headerValue)).toBe(expectedExtracted)
})
