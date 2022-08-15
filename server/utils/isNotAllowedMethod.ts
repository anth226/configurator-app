export default (method: string, methods = []): boolean =>
  !methods.includes(method);
