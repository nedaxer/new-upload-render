/**
 * Offline Storage Utility
 * Manages local storage for notifications, news, transactions, and other critical data
 */

interface StoredData {
  data: any;
  timestamp: number;
  expiresAt?: number;
}

interface NotificationData {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  imageUrl?: string;
  category?: string;
}

interface TransactionData {
  _id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  [key: string]: any;
}

class OfflineStorage {
  private readonly STORAGE_KEYS = {
    NOTIFICATIONS: 'nedaxer_notifications',
    NEWS: 'nedaxer_news',
    TRANSACTIONS: 'nedaxer_transactions',
    DEPOSITS: 'nedaxer_deposits',
    TRANSFERS: 'nedaxer_transfers',
    BALANCES: 'nedaxer_balances',
    WALLET_SUMMARY: 'nedaxer_wallet_summary',
    CRYPTO_PRICES: 'nedaxer_crypto_prices',
    FAVORITES: 'nedaxer_favorites',
    USER_DATA: 'nedaxer_user_data'
  };

  private readonly EXPIRY_TIMES = {
    NEWS: 24 * 60 * 60 * 1000, // 24 hours
    CRYPTO_PRICES: 10 * 60 * 1000, // 10 minutes
    GENERAL: 7 * 24 * 60 * 60 * 1000 // 7 days for other data
  };

  /**
   * Store data with optional expiry
   */
  private setItem(key: string, data: any, expiryMs?: number): void {
    try {
      const storedData: StoredData = {
        data,
        timestamp: Date.now(),
        expiresAt: expiryMs ? Date.now() + expiryMs : undefined
      };
      localStorage.setItem(key, JSON.stringify(storedData));
    } catch (error) {
      console.warn('Failed to store data locally:', error);
    }
  }

  /**
   * Get data and check if it's expired
   */
  private getItem(key: string): any | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const storedData: StoredData = JSON.parse(item);
      
      // Check if data has expired
      if (storedData.expiresAt && Date.now() > storedData.expiresAt) {
        localStorage.removeItem(key);
        return null;
      }

      return storedData.data;
    } catch (error) {
      console.warn('Failed to retrieve data from local storage:', error);
      return null;
    }
  }

  /**
   * Store notifications locally
   */
  storeNotifications(notifications: NotificationData[]): void {
    this.setItem(this.STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  /**
   * Get stored notifications
   */
  getNotifications(): NotificationData[] | null {
    return this.getItem(this.STORAGE_KEYS.NOTIFICATIONS);
  }

  /**
   * Store news articles with 24-hour expiry
   */
  storeNews(news: NewsItem[]): void {
    this.setItem(this.STORAGE_KEYS.NEWS, news, this.EXPIRY_TIMES.NEWS);
  }

  /**
   * Get stored news (will return null if expired after 24 hours)
   */
  getNews(): NewsItem[] | null {
    return this.getItem(this.STORAGE_KEYS.NEWS);
  }

  /**
   * Store transaction history
   */
  storeTransactions(transactions: TransactionData[]): void {
    this.setItem(this.STORAGE_KEYS.TRANSACTIONS, transactions);
  }

  /**
   * Get stored transactions
   */
  getTransactions(): TransactionData[] | null {
    return this.getItem(this.STORAGE_KEYS.TRANSACTIONS);
  }

  /**
   * Store deposit history
   */
  storeDeposits(deposits: any[]): void {
    this.setItem(this.STORAGE_KEYS.DEPOSITS, deposits);
  }

  /**
   * Get stored deposits
   */
  getDeposits(): any[] | null {
    return this.getItem(this.STORAGE_KEYS.DEPOSITS);
  }

  /**
   * Store transfer history
   */
  storeTransfers(transfers: any[]): void {
    this.setItem(this.STORAGE_KEYS.TRANSFERS, transfers);
  }

  /**
   * Get stored transfers
   */
  getTransfers(): any[] | null {
    return this.getItem(this.STORAGE_KEYS.TRANSFERS);
  }

  /**
   * Store user balances
   */
  storeBalances(balances: any[]): void {
    this.setItem(this.STORAGE_KEYS.BALANCES, balances);
  }

  /**
   * Get stored balances
   */
  getBalances(): any[] | null {
    return this.getItem(this.STORAGE_KEYS.BALANCES);
  }

  /**
   * Store wallet summary
   */
  storeWalletSummary(summary: any): void {
    this.setItem(this.STORAGE_KEYS.WALLET_SUMMARY, summary);
  }

  /**
   * Get stored wallet summary
   */
  getWalletSummary(): any | null {
    return this.getItem(this.STORAGE_KEYS.WALLET_SUMMARY);
  }

  /**
   * Store crypto prices with 10-minute expiry
   */
  storeCryptoPrices(prices: any[]): void {
    this.setItem(this.STORAGE_KEYS.CRYPTO_PRICES, prices, this.EXPIRY_TIMES.CRYPTO_PRICES);
  }

  /**
   * Get stored crypto prices
   */
  getCryptoPrices(): any[] | null {
    return this.getItem(this.STORAGE_KEYS.CRYPTO_PRICES);
  }

  /**
   * Store user favorites
   */
  storeFavorites(favorites: any[]): void {
    this.setItem(this.STORAGE_KEYS.FAVORITES, favorites);
  }

  /**
   * Get stored favorites
   */
  getFavorites(): any[] | null {
    return this.getItem(this.STORAGE_KEYS.FAVORITES);
  }

  /**
   * Store user data
   */
  storeUserData(userData: any): void {
    this.setItem(this.STORAGE_KEYS.USER_DATA, userData);
  }

  /**
   * Get stored user data
   */
  getUserData(): any | null {
    return this.getItem(this.STORAGE_KEYS.USER_DATA);
  }

  /**
   * Update a single notification's read status
   */
  updateNotificationReadStatus(notificationId: string): void {
    const notifications = this.getNotifications();
    if (notifications) {
      const updatedNotifications = notifications.map(notification => 
        notification._id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      );
      this.storeNotifications(updatedNotifications);
    }
  }

  /**
   * Add a new notification to local storage
   */
  addNotification(notification: NotificationData): void {
    const notifications = this.getNotifications() || [];
    const updatedNotifications = [notification, ...notifications];
    this.storeNotifications(updatedNotifications);
  }

  /**
   * Clear expired data
   */
  clearExpiredData(): void {
    // News will auto-expire, but we can manually clear other expired items
    const keys = Object.values(this.STORAGE_KEYS);
    keys.forEach(key => {
      this.getItem(key); // This will automatically remove expired items
    });
  }

  /**
   * Clear all stored data (for logout)
   */
  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Check if we're online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Get data with fallback to offline storage
   */
  getWithFallback<T>(onlineData: T | null, offlineGetter: () => T | null): T | null {
    if (this.isOnline() && onlineData !== null) {
      return onlineData;
    }
    return offlineGetter();
  }
}

export const offlineStorage = new OfflineStorage();