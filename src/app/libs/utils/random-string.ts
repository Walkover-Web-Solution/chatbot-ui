export function getRandomString(length: number = 5, charSet?: string): string {
    const characterSet = charSet ?? 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return 'x'.repeat(length).replace(/./g, () => characterSet[Math.floor(Math.random() * characterSet.length)]);
}
