var imported = {};
export function loadScript(src) {
    if (imported[src])
        return Promise.resolve();
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;

        document.body.appendChild(script);

        script.addEventListener('load', () => {
            imported[src] = true;
            resolve(script);
        });
        script.addEventListener('error', () => reject(script));
    });
}