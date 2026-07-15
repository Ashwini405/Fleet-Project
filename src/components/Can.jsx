import { usePermission } from "../hooks/usePermission";

export default function Can({ module, action = "view", children, fallback = null }) {
    const allowed = usePermission(module, action);
    return allowed ? children : fallback;
}
