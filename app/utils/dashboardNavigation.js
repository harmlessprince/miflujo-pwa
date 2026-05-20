export const dashboardNavigationItems = [
  {
    key: 'dashboard',
    name: 'Dashboard',
    bottomLabel: 'HOME',
    icon: 'dashboard',
    activeIcon: 'dashboard',
    pathName: '/dashboard',
    comingSoon: false,
    exact: true,
  },
  {
    key: 'statements',
    name: 'Statements',
    bottomLabel: 'STATEMENTS',
    icon: 'description',
    activeIcon: 'description',
    pathName: '/dashboard/statements',
    comingSoon: false,
  },
  {
    key: 'transactions',
    name: 'Transactions',
    bottomLabel: 'TXNS',
    icon: 'receipt_long',
    activeIcon: 'receipt_long',
    pathName: '/dashboard/transactions',
    comingSoon: false,
  },
  {
    key: 'analytics',
    name: 'Analytics',
    bottomLabel: 'ANALYTICS',
    icon: 'analytics',
    activeIcon: 'analytics',
    pathName: '/dashboard/analytics',
    comingSoon: false,
  },
  {
    key: 'ai',
    name: 'AI Assistant',
    bottomLabel: 'AI',
    icon: 'smart_toy',
    activeIcon: 'smart_toy',
    pathName: '/dashboard/ai',
    comingSoon: false,
  },
]

export const bottomNavigationItems = dashboardNavigationItems.map((item) => ({
  key: item.key,
  label: item.bottomLabel,
  icon: item.icon,
  activeIcon: item.activeIcon,
  pathName: item.pathName,
  exact: item.exact,
}))

function normalizePath(path = '') {
  const normalizedPath = path.split('?')[0].split('#')[0]
  if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
    return normalizedPath.slice(0, -1)
  }

  return normalizedPath || '/'
}

export function isDashboardNavigationItemActive(item, currentPath) {
  const itemPath = normalizePath(item.pathName)
  const routePath = normalizePath(currentPath)

  if (item.exact) return routePath === itemPath

  return routePath === itemPath || routePath.startsWith(`${itemPath}/`)
}

export function getActiveDashboardNavigationItem(items, currentPath) {
  return [...items]
    .filter((item) => isDashboardNavigationItemActive(item, currentPath))
    .sort((first, second) => second.pathName.length - first.pathName.length)[0] || null
}
