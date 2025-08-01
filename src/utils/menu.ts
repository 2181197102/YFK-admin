// utils/menu.ts - 修复后的菜单工具文件
import { routes } from '@/router/index';
import { getGeneralRoleFromToken, getRoleCodeFromToken } from '@/utils/auth';

function extractMenusFromRoutes(routes: any[], excludePaths: string[] = []): any[] {
    return routes.flatMap(route => {
        // 如果是布局路由，提取其子路由作为菜单
        if (route.name === 'AppLayout' && route.children) {
            return route.children
                .filter(child => child.meta?.title && !excludePaths.includes(child.path))
                .map(child => {
                    const menu: any = {
                        path: child.path,
                        name: child.name,
                        meta: child.meta,
                    };

                    // 子菜单处理，递归过滤子节点
                    if (child.children && child.children.length > 0) {
                        menu.children = child.children
                            .filter(grandChild => grandChild.meta?.title && !excludePaths.includes(grandChild.path))
                            .map(grandChild => ({
                                path: grandChild.path,
                                name: grandChild.name,
                                meta: grandChild.meta,
                            }));

                        // 如果子菜单全部被过滤掉，可以不返回 children 字段
                        if (menu.children.length === 0) {
                            delete menu.children;
                        }
                    }

                    return menu;
                });
        }

        // 对于非布局路由，继续原有逻辑
        if (!excludePaths.includes(route.path) && route.meta?.title) {
            const menu: any = {
                path: route.path,
                name: route.name,
                meta: route.meta,
            };

            if (route.children && route.children.length > 0) {
                menu.children = route.children
                    .filter(child => child.meta?.title && !excludePaths.includes(child.path))
                    .map(child => ({
                        path: child.path,
                        name: child.name,
                        meta: child.meta,
                    }));

                if (menu.children.length === 0) {
                    delete menu.children;
                }
            }

            return [menu];
        }

        return [];
    });
}


/**
 * 根据用户角色过滤菜单
 * @param menus 菜单配置
 * @param userRole 用户角色
 * @returns 过滤后的菜单配置
 */
export const filterMenusByRole = (menus: any[], userRole: string): any[] => {
    return menus.filter(menu => {
        // 如果菜单没有定义角色权限，则默认允许所有角色访问
        if (!menu.meta?.roles) {
            return true;
        }

        // 获取用户的原始角色代码和通用角色
        const userRoleCode = getRoleCodeFromToken();
        const userGeneralRole = getGeneralRoleFromToken();

        // 检查用户角色是否在允许的角色列表中
        // 支持通用角色（如 DOCTOR）和具体角色代码（如 FAMILY_DOCTOR）
        const hasPermission = menu.meta.roles.includes(userGeneralRole) || menu.meta.roles.includes(userRoleCode);

        if (hasPermission && menu.children) {
            // 如果有权限且有子菜单，递归过滤子菜单
            menu.children = filterMenusByRole(menu.children, userRole);
        }

        return hasPermission;
    });
};

/**
 * 获取当前用户可访问的菜单
 * @returns 过滤后的菜单
 */
export const getUserMenus = (): any[] => {
    const userRole = getGeneralRoleFromToken();

    if (!userRole) {
        console.warn('用户角色获取失败，返回空菜单');
        return [];
    }

    // 设置你想要隐藏的路径（子路由路径也可以，支持屏蔽子菜单 如： /research/projects）
    const excludePaths = ['/login', '/profile', '/register', '/403', '/:pathMatch(.*)*', '/', '/app', '/profile'];

    // 提取并过滤菜单
    const allMenus = extractMenusFromRoutes(routes, excludePaths);
    return filterMenusByRole(allMenus, userRole);
};
