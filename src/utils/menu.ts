// utils/menu.ts - 修复后的菜单工具文件
import { routes } from '@/router/index';
import { getGeneralRoleFromToken } from '@/utils/auth';

function extractMenusFromRoutes(routes: any[]): any[] {
    return routes.flatMap(route => {
        // 如果是布局路由，提取其子路由作为菜单
        if (route.name === 'AppLayout' && route.children) {
            return route.children.filter(child => {
                // 过滤出需要在菜单中显示的路由
                const excludePaths = ['']; // 需要排除的菜单路径在这里添加
                return !excludePaths.includes(child.path) && child.meta?.title;
            }).map(child => {
                const menu: any = {
                    path: child.path,
                    name: child.name,
                    meta: child.meta,
                };

                // 处理子路由
                if (child.children && child.children.length > 0) {
                    menu.children = child.children.map(grandChild => ({
                        path: grandChild.path,
                        name: grandChild.name,
                        meta: grandChild.meta,
                    }));
                }

                return menu;
            });
        }

        // 对于其他路由，保持原有逻辑
        const excludePaths = ['/login', '/profile', '/register', '/403', '/:pathMatch(.*)*', '/', '/app'];
        if (!excludePaths.includes(route.path) && route.meta?.title) {
            const menu: any = {
                path: route.path,
                name: route.name,
                meta: route.meta,
            };

            if (route.children && route.children.length > 0) {
                menu.children = route.children.map(child => ({
                    path: child.path,
                    name: child.name,
                    meta: child.meta,
                }));
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

        // 检查用户角色是否在允许的角色列表中
        const hasPermission = menu.meta.roles.includes(userRole);

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

    // 从路由配置中提取菜单数据
    const allMenus = extractMenusFromRoutes(routes);

    // 根据用户角色过滤菜单
    return filterMenusByRole(allMenus, userRole);
};