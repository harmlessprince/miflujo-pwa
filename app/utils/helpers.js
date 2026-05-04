// export const getObjectFromLocalStorage = (key, default_value) => {
//     var value = localStorage.getItem(key);
//     if (value === null || value == undefined || value == "undefined") {
//         return default_value;
//     }
//     if (typeof value == "string") {
//         return JSON.parse(value);
//     }
//     return null;
// };
import { useApiService } from '~/services/apiService.js';
import { endpoints } from '~/utils/endpoints.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
export const formatMoney = (amount) => {
    return Intl.NumberFormat("en-US", {
        style: "currency", currency: "NGR",
    }).format(amount);
};

export const delay = ms => new Promise(res => setTimeout(res, ms));
export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

export const logger = {
  log: (...args) => {
    const config = useRuntimeConfig()
    if (config.public.appEnv !== 'production') {
      console.log(...args);
    }
    }, error: (...args) => {
      const config = useRuntimeConfig()
        if (config.public.appEnv !== 'production') {
            console.error(...args);
        }
    }, warn: (...args) => {
      const config = useRuntimeConfig()
        if (config.public.appEnv !== 'production') {
            console.warn(...args);
        }
    }
};

export const formatToMoney = (value, currency = '₦') => {
    if (isNaN(value)) return currency + '0.00';

    return `${currency}${Number(value).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

const FILE_UPLOAD_RULES = {
  image: {
    maxSizeInBytes: 1 * 1024 * 1024,
    errorMessage: 'Image size must be 1MB or less',
  },
  pdf: {
    maxSizeInBytes: 3 * 1024 * 1024,
    errorMessage: 'PDF size must be 3MB or less',
  },
}

export const handleFileUpload = async (eventOrFile, options = {}) => {
  let file;
  const fileType = options.fileType || 'image';
  const uploadRule = FILE_UPLOAD_RULES[fileType];
  
  // Handle both event objects and File objects
  if (eventOrFile instanceof File) {
    file = eventOrFile;
  } else if (eventOrFile?.target?.files) {
    file = eventOrFile.target.files[0];
  } else {
    return null;
  }

  if (!file) return null;

  if (!uploadRule) {
    logger.error('Unsupported file type for upload:', fileType);
    return null;
  }

  if (file.size > uploadRule.maxSizeInBytes) {
    alert(uploadRule.errorMessage);
    return null;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);

  try {
    const { post } = useApiService();
    const response = await post(endpoints.files.upload, formData, {forceMode: options.forceMode || 'test'});
    if (response?.data?.url) {
      if (options.returnMeta) {
        return response.data;
      }
      return response.data.url;
    } else {      
      return null;
    }
  } catch (error) {
    logger.error('File upload failed:', error);
    return null;
  } 
};

export const generateStorefrontUrl = (tradingName) => {
  if (!tradingName) return ''
  const slug = tradingName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  return `https://${slug}.shopsynch.com`
}

export const getInitials = (name) => {
  if (!name) return "";

  return name
    .trim()
    .split(/\s+/)             // Split by any whitespace (handles multiple spaces)
    .map(word => word[0])      // Take the first character of each word
    .join("")                  // Combine them
    .toUpperCase();            // Ensure they are capitalized
};

/**
 * Validates if a string is a properly formatted URL path.
 * @param {string} path - The string to test.
 * @returns {boolean}
 */
export const isValidPath = (path) => {
  // Regex Breakdown:
  // ^               : Start of string
  // \/              : Must start with a forward slash
  // (               : Start grouping for path segments
  //   [a-z0-9._~!$&'()*+,;=@%-] : Allowed RFC 3986 characters
  //   |           : OR
  //   \/          : Another forward slash (for nested paths)
  // )* : Repeat segments zero or more times
  // $               : End of string
  const pathRegex = /^\/([a-z0-9._~!$&'()*+,;=@%-]|\/)*$/i;

  // Check for basic format and ensure no double slashes "//" (optional)
  return pathRegex.test(path) && !path.includes('//');
};


export const getPaginatedData = (data) => {
  return {
    hasPrevious: data?.current_page > 1,
    currentPage: data?.current_page,
    hasNext: data?.to < data.total,
    from: data?.from,
    to: data?.to,
    pageSize: data?.per_page,
    maxVisibleButtons: 15,
    total: data?.total,
    totalPages:
      Math.floor(data?.total % data?.per_page) === 0
        ? Math.floor(data?.total / data?.per_page)
        : Math.floor(data?.total / data?.per_page) + 1,
    // totalPages: data?.total,
  };
}

export const cleanObject = (object) => {
  Object.keys(object).forEach((key) => {
    if (
      object[key] === "" ||
      object[key] === null ||
      object[key] === "" ||
      object[key] === "undefined" ||
      object[key] === undefined
    ) {
      delete object[key];
    }
  });
  return object;
};




/**
 * Maps a raw inventory insights API response to the shape expected by the inventory page.
 * @param {Object|null} data - The `data` field from the API response.
 * @returns {Object|null}
 */
export const mapInventoryResponse = (data) => {
  if (!data) return null;

  const isTrendPositive = (trend, inverse = false) => {
    const positive = typeof trend === 'string' && trend.trim().startsWith('+');
    return inverse ? !positive : positive;
  };

  const mapPerfItems = (items = []) => {
    const maxUnits = items[0]?.totalQuantitySold || 50;
    return items.map((item) => ({
      label: item.name.split(' ')[0],
      name: item.name,
      units: item.totalQuantitySold,
      pct: Math.round((item.totalQuantitySold / (maxUnits || 50)) * 100),
    }));
  };

  return {
    period: { label: data.periodLabel ?? '' },
    kpis: [
      {
        id: 'turnover',
        label: 'Stock Turnover Ratio',
        value: String(data.stockTurnoverRatio ?? '0'),
        trend: data.stockTurnoverTrend ?? '0%',
        trendPositive: isTrendPositive(data.stockTurnoverTrend),
        note: 'High efficiency (Benchmark: 6.0)',
        icon: 'autorenew',
        accent: 'border-primary',
      },
      {
        id: 'outofstock',
        label: 'Out-of-stock Rate',
        value: `${data.outOfStockRate ?? 0}%`,
        trend: data.outOfStockTrend ?? '0%',
        trendPositive: isTrendPositive(data.outOfStockTrend, true),
        note: 'Slightly above target (1.5%)',
        icon: 'warning',
        accent: 'border-red-500',
      },
      {
        id: 'value',
        label: 'Total Inventory Value',
        value: formatToMoney(data.totalInventoryValue ?? 0),
        trend: data.inventoryValueTrend ?? '0%',
        trendPositive: isTrendPositive(data.inventoryValueTrend),
        note: 'Improved lean capital usage',
        icon: 'payments',
        accent: 'border-blue-400',
      },
    ],
    lowStock: {
      criticalCount: data.lowStockCriticalCount ?? 0,
      items: (data.lowStockItems ?? []).map((item) => ({
        id: item.productId,
        name: item.productName,
        stock: item.onHandQty,
        maxStock: item.maxStock ?? 50,
        severity: item.severity,
        image: item.productImage,
      })),
    },
    performance: {
      topSellers: mapPerfItems(data.topSellers ?? []),
      slowMovers: mapPerfItems(data.slowMovers ?? []),
    },
    predictive: {
      title: 'Predictive Analysis Active',
      body: 'Our AI models suggest increasing stock for',
      highlightProduct: 'Outdoor Lighting',
      bodySuffix: 'by 15% before next Tuesday based on trending localized weather patterns.',
      recommendation: '+15% Stock Volume',
      actionLabel: 'Apply Optimization',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2eSlkNr8FqM2Eq5LOXyA1TYfOBQgUFtKIb-k3rQ5aFxMW6_0iJpG-0WkAegO1NUVvS0UDhvI7VkHlwlHnlGHLV3pJJV0pC3VxEeE4RaCHr-r2VBgqcBhiEGvdxJ6nHmIPY60jDlT7Uuav0DzJC44ZCWblU7P2vgd0Vy5YNe8bFgMx_Lxr5Yoq7eI0CDlLNbXJdl_vEesBhF4gHFwWr7Io4cXJhEnm_yqNgY89VH5EyLg8IbSVPT5wm5u7Ek0R3v_vz4lf0',
    },
  };
};

export const formatDate = (val, formatType = 'standard') => {
  dayjs.extend(relativeTime);
  if (!val) return 'N/A';
  
  const date = dayjs(val);
  
  // Validation: check if the date is actually valid
  if (!date.isValid()) return 'Invalid Date';

  switch (formatType) {
    case 'relative':
      return date.fromNow(); // "2 seconds ago", "4 days ago"
    case 'year':
      return date.format('YYYY'); // "2024"
    case 'short':
      return date.format('DD/MM/YYYY'); // "15/04/2024"
    case 'full':
      return date.format('MMMM D, YYYY'); // "April 15, 2024"
    default:
      return date.toDate().toLocaleDateString(); // Fallback to your original logic
  }
};
