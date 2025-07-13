// utils/menu.ts - 修复后的菜单工具文件
import { routes } from '@/router/index';
import { getGeneralRoleFromToken } from '@/utils/auth';

/**
 * 从路由配置中提取菜单数据
 * @param routes 路由配置
 * @returns 菜单数据
 */
function extractMenusFromRoutes(routes: any[]): any[] {
    return routes.filter(route => {
        // 过滤出需要在菜单中显示的路由
        // 排除登录、注册、错误页面等
        const excludePaths = ['/login', '/profile', '/register', '/403', '/:pathMatch(.*)*', '/'];
        return !excludePaths.includes(route.path) && route.meta?.title;
    }).map(route => {
        const menu: any = {
            path: route.path,
            name: route.name,
            meta: route.meta,
        };

        // 处理子路由
        if (route.children && route.children.length > 0) {
            menu.children = route.children.map(child => ({
                path: child.path,
                name: child.name,
                meta: child.meta,
            }));
        }

        return menu;
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