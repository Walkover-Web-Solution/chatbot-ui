/* eslint-disable @typescript-eslint/no-explicit-any */
const FULL_RE = /^\{\{([\w.[\]]+)\}\}$/;
const INLINE_RE = /\{\{([\w.[\]]+)\}\}/g;

export function resolvePath(path: string, scope: Record<string, any>): any {
    if (!path || !scope) return undefined;
    // Replace brackets with dots: item[0].id -> item.0.id
    const normalizedPath = path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '');
    const parts = normalizedPath.split('.');
    return parts.reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), scope);
}

export function interpolate(template: any, scope: Record<string, any>): any {
    if (typeof template !== "string") return template;
    const full = template.match(FULL_RE);
    if (full) {
        const resolved = resolvePath(full[1], scope);
        return resolved !== undefined ? resolved : template;
    }

    // Inline: replace each placeholder with its string representation
    return template.replace(INLINE_RE, (_: string, path: string) => {
        const resolved = resolvePath(path, scope);
        return resolved !== undefined ? String(resolved) : _;
    });
}

export function resolveNode(node: any, scope: Record<string, any>): any {
    if (typeof node === "string") return interpolate(node, scope);
    if (Array.isArray(node)) return node.map((n) => resolveNode(n, scope));
    if (node && typeof node === "object") {
        const out: Record<string, any> = {};
        for (const [k, v] of Object.entries(node)) {
            out[k] = resolveNode(v, scope);
        }
        return out;
    }
    return node;
}

export function resolveAction(actionRef: string, actionDefs: Record<string, any>, scope: Record<string, any> = {}): any {
    if (!actionRef || !actionDefs) return null;
    const template = actionDefs[actionRef];
    if (!template) {
        return null;
    }

    return resolveNode(JSON.parse(JSON.stringify(template)), scope);
}
