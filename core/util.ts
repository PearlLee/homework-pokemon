export function getLastPath(url: string): string {
    const urls = new URL(url).pathname.split("/").filter((x) => x.length > 0);
    return urls[urls.length - 1];
}
