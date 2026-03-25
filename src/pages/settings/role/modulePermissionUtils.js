/** Normalize module-wise-permissions API into { id, name, permissions: [{ id, name }] } */
export function normalizeModuleGroups(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.map((g, idx) => {
        const moduleIdRaw = g.id ?? g.module_id ?? g.moduleId;
        const moduleId =
            moduleIdRaw !== undefined && moduleIdRaw !== null && moduleIdRaw !== ""
                ? Number(moduleIdRaw)
                : idx;
        const name =
            g.name ??
            g.module_name ??
            g.title ??
            (Number.isFinite(moduleId) ? `Module ${moduleId}` : `Module ${idx + 1}`);

        let perms =
            g.permissions ??
            g.allmodule ??
            g.module_permissions ??
            g.permission ??
            [];
        if (!Array.isArray(perms)) perms = [];

        const permissions = perms
            .map((p) => ({
                id: p.id ?? p.permission_id,
                name: p.name ?? p.permission_name ?? p.title ?? "",
            }))
            .filter((p) => p.id != null && p.id !== "");

        return {
            id: Number.isFinite(moduleId) ? moduleId : moduleIdRaw ?? idx,
            name,
            permissions,
        };
    });
}

export function sameModuleId(a, b) {
    return String(a) === String(b);
}
