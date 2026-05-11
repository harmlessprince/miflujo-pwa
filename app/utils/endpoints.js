export const endpoints = {
    auth: {
        google:  '/auth/google',
        me:      '/auth/me',
        refresh: '/auth/refresh',
    },
    accounts: {
        list: '/accounts',
    },
    dashboard: {
        get: '/v1/dashboard',
    },
    bankStatements: {
        list:      '/bank-statements',
        create:    '/bank-statements',
        detail:    (id) => `/bank-statements/${id}`,
        delete:    (id) => `/bank-statements/${id}`,
        dashboard: (id) => `/bank-statements/${id}/dashboard-summary`,
        choices:   '/bank-statement-choices',
    },
    transactions: {
        list: '/transactions',
        show: (id) => `/transactions/${id}`,
    },
    insights: {
        monthAnalysis:    (id) => `/compute-month-analysis/${id}`,
        weekAnalysis:     '/compute-week-analysis',
        totalIncome:      '/calculate-total-income',
        totalSpent:       '/calculate-total-spent',
        netCashflow:      '/calculate-net-cashflow',
        transactionStats: '/calculate-transaction-stats',
        byCategory:       '/analyze-transaction-by-category',
        byMerchant:       '/analyze-transaction-by-merchant',
        byDailyPattern:   '/analyze-transaction-by-daily-patterns',
        burnRate:         '/calculate-burn-rate',
        categoryConfidence: '/category-confidence',
        monthOverMonth:   '/month-over-month-comparison',
    },
    questions: {
        guided: '/questions/guided',
        answer: '/questions/answer',
        query:  '/query/route',
    },
}
