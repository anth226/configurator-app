export default async (seconds: number) => new Promise((resolve) => {
  setTimeout(() => {
    return resolve(true);
  }, seconds * 1000);
})