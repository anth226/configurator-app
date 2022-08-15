export default (file: string) => {
  const parts = file.split('.');
  if (parts.length < 2) return '';
  return parts[parts.length - 1];
};
