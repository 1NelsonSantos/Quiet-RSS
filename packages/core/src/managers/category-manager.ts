import type { Category, CategoryCreatePayload, CategoryUpdatePayload } from '@quiet-rss/types';
import { StorageManager } from '../storage/storage-manager';

/**
 * Category manager that handles all category-related operations including creating,
 * updating, deleting, and organizing categories for feed management.
 */
export class CategoryManager {
  /**
   * Creates a new Category Manager instance
   * @param storage - Storage manager for persisting category data
   */
  constructor(private storage: StorageManager) {}

  /**
   * Create a new category
   * @param payload - Category creation data including name and optional styling
   * @returns Promise that resolves to the created category object
   * @throws Error if category name already exists
   */
  async createCategory(payload: CategoryCreatePayload): Promise<Category> {
    const categories = await this.storage.loadCategories();

    // Check for duplicate name
    const existingCategory = categories.find(c => c.name.toLowerCase() === payload.name.toLowerCase());

    if (existingCategory) {
      throw new Error(`Category with name "${payload.name}" already exists`);
    }

    const category: Category = {
      id: this.generateId(),
      name: payload.name,
      color: payload.color,
      icon: payload.icon,
      order: categories.length,
      feedCount: 0,
      unreadCount: 0,
    };

    categories.push(category);
    await this.storage.saveCategories(categories);

    return category;
  }

  /**
   * Update an existing category's properties
   * @param payload - Category update data with ID and properties to change
   * @returns Promise that resolves to the updated category object
   * @throws Error if category is not found or name conflict exists
   */
  async updateCategory(payload: CategoryUpdatePayload): Promise<Category> {
    const categories = await this.storage.loadCategories();
    const categoryIndex = categories.findIndex(c => c.id === payload.id);

    if (categoryIndex === -1) {
      throw new Error(`Category with ID ${payload.id} not found`);
    }

    const category = categories[categoryIndex];

    // Check for name conflicts if name is being updated
    if (payload.name !== undefined && payload.name !== category.name) {
      const name = payload.name;

      const existingCategory = categories.find(c => c.id !== payload.id && c.name.toLowerCase() === name.toLowerCase());

      if (existingCategory) {
        throw new Error(`Category with name "${name}" already exists`);
      }
    }

    // Update category properties
    if (payload.name !== undefined) {
      category.name = payload.name;
    }
    if (payload.color !== undefined) {
      category.color = payload.color;
    }
    if (payload.icon !== undefined) {
      category.icon = payload.icon;
    }
    if (payload.order !== undefined) {
      category.order = payload.order;
    }

    categories[categoryIndex] = category;
    await this.storage.saveCategories(categories);

    return category;
  }

  /**
   * Delete a category and optionally reassign its feeds
   * @param categoryId - ID of the category to delete
   * @param reassignTo - Optional category ID to move feeds to, or null to un-categorize
   * @returns Promise that resolves when category is deleted and feeds are reassigned
   * @throws Error if category is not found
   */
  async deleteCategory(categoryId: string, reassignTo?: string): Promise<void> {
    const categories = await this.storage.loadCategories();
    const categoryIndex = categories.findIndex(c => c.id === categoryId);

    if (categoryIndex === -1) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }

    // Validate reassign target if provided
    if (reassignTo) {
      const targetCategory = categories.find(c => c.id === reassignTo);
      if (!targetCategory) {
        throw new Error(`Target category with ID ${reassignTo} not found`);
      }
    }

    // Update feeds that belong to this category
    const feeds = await this.storage.loadFeeds();
    const updatedFeeds = feeds.map(feed => {
      if (feed.categoryId === categoryId) {
        return { ...feed, categoryId: reassignTo || undefined };
      }
      return feed;
    });

    // Remove the category
    const filteredCategories = categories.filter(c => c.id !== categoryId);

    // Save both updates
    await Promise.all([this.storage.saveCategories(filteredCategories), this.storage.saveFeeds(updatedFeeds)]);
  }

  /**
   * Get all categories with updated feed and unread counts
   * @returns Promise that resolves to array of categories with current counts
   */
  async getAllCategories(): Promise<Category[]> {
    const [categories, feeds, articles] = await Promise.all([
      this.storage.loadCategories(),
      this.storage.loadFeeds(),
      this.storage.loadArticles(),
    ]);

    // Update feed and unread counts for each category
    return categories
      .map(category => {
        const categoryFeeds = feeds.filter(f => f.categoryId === category.id);
        const feedIds = categoryFeeds.map(f => f.id);
        const unreadArticles = articles.filter(a => feedIds.includes(a.feedId) && !a.isRead);

        return {
          ...category,
          feedCount: categoryFeeds.length,
          unreadCount: unreadArticles.length,
        };
      })
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get a single category by ID with updated counts
   * @param categoryId - ID of the category to retrieve
   * @returns Promise that resolves to the category or null if not found
   */
  async getCategoryById(categoryId: string): Promise<Category | null> {
    const categories = await this.getAllCategories();

    return categories.find(c => c.id === categoryId) || null;
  }

  /**
   * Reorder categories by updating their order values
   * @param categoryIds - Array of category IDs in the desired order
   * @returns Promise that resolves when categories are reordered
   * @throws Error if any category ID is invalid
   */
  async reorderCategories(categoryIds: string[]): Promise<void> {
    const categories = await this.storage.loadCategories();

    // Validate all category IDs exist
    for (const id of categoryIds) {
      if (!categories.find(c => c.id === id)) {
        throw new Error(`Category with ID ${id} not found`);
      }
    }

    // Update order for each category
    const updatedCategories = categories.map(category => {
      const newOrder = categoryIds.indexOf(category.id);
      return {
        ...category,
        order: newOrder !== -1 ? newOrder : category.order,
      };
    });

    await this.storage.saveCategories(updatedCategories);
  }

  /**
   * Get feeds that belong to a specific category
   * @param categoryId - ID of the category
   * @returns Promise that resolves to array of feeds in the category
   */
  async getFeedsByCategory(categoryId: string): Promise<any[]> {
    const feeds = await this.storage.loadFeeds();

    return feeds.filter(f => f.categoryId === categoryId);
  }

  /**
   * Get feeds that are not assigned to any category
   * @returns Promise that resolves to array of un-categorized feeds
   */
  async getUncategorizedFeeds(): Promise<any[]> {
    const feeds = await this.storage.loadFeeds();

    return feeds.filter(f => !f.categoryId);
  }

  /**
   * Get category statistics
   * @returns Promise that resolves to category counts and totals
   */
  async getCategoryStats(): Promise<{
    totalCategories: number;
    categorizedFeeds: number;
    uncategorizedFeeds: number;
  }> {
    const [categories, feeds] = await Promise.all([this.storage.loadCategories(), this.storage.loadFeeds()]);

    const categorizedFeeds = feeds.filter(f => f.categoryId).length;
    const uncategorizedFeeds = feeds.length - categorizedFeeds;

    return {
      totalCategories: categories.length,
      categorizedFeeds,
      uncategorizedFeeds,
    };
  }

  /**
   * Generate a unique ID for categories
   * @returns Unique string ID
   */
  private generateId(): string {
    return `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
