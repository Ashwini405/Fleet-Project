import { useAuth } from "../context/AuthContext";

export function usePermission(moduleName, action = "view") {
    const { hasPermission } = useAuth();
    return hasPermission(moduleName, action);
}
