export const endpoints = {
    auth: {
        google:  '/auth/google',
        emailToken: '/auth/email-token',
        me:      '/auth/me',
        refresh: '/auth/refresh',
    },
    preferences: {
        me: '/preferences/me',
    },
    accounts: {
        list: '/accounts',
    },
    bankStatements: {
        list:      '/bank-statements',
        create:    '/bank-statements',
        detail:    (id) => `/bank-statements/${id}`,
        delete:    (id) => `/bank-statements/${id}`,
        dashboard: (id) => `/bank-statements/${id}/dashboard-summary`,
        summaryReport: (id) => `/bank-statements/${id}/summary-report`,
        choices:   '/bank-statement-choices',
    },
    transactions: {
        list: '/transactions',
        show: (id) => `/transactions/${id}`,
        reviewQueues: '/transactions/review-queues/labels',
        applyLabelRules: '/transactions/labels/apply-rules',
        corrections: (id) => `/transactions/${id}/corrections`,
        reviewLabel: (id, labelKey) => `/transactions/${id}/labels/${labelKey}/review`,
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
        query:  '/query-insight',
    },
    aiAttempts: {
        list: '/ai/questions/attempts',
        summary: '/ai/questions/attempts/summary',
        feedback: (id) => `/ai/questions/attempts/${id}/feedback`,
    },
    actions: {
        budgets: {
            list: '/actions/budgets',
            create: '/actions/budgets',
            update: (id) => `/actions/budgets/${id}`,
        },
        goals: {
            list: '/actions/goals',
            create: '/actions/goals',
            update: (id) => `/actions/goals/${id}`,
        },
        alertRules: {
            list: '/actions/alert-rules',
            create: '/actions/alert-rules',
            update: (id) => `/actions/alert-rules/${id}`,
        },
        alerts: {
            list: '/actions/alerts',
            evaluate: '/actions/alerts/evaluate',
            updateStatus: (id) => `/actions/alerts/${id}/status`,
        },
        insightInteractions: '/actions/insights/interactions',
        summary: '/actions/summary',
    },
}
