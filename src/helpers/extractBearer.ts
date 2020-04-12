export function extractBearer(authorizationHeader: string): string {
  return authorizationHeader.split(' ')[1]
}
