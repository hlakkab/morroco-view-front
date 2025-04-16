import { mockArtisans } from '../data/mockArtisans';
import { Artisan, ArtisanType } from '../types/Artisan';

/**
 * Mock service that simulates API calls for artisan data
 */
export class MockArtisanService {
  private artisans: Artisan[];

  constructor() {
    // Initialize with the mock data
    this.artisans = [...mockArtisans];
  }

  /**
   * Get all artisans
   * @returns Promise resolving to array of Artisan objects
   */
  async getAllArtisans(): Promise<Artisan[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return [...this.artisans];
  }

  /**
   * Get artisan by ID
   * @param id - The ID of the artisan to retrieve
   * @returns Promise resolving to Artisan object or null if not found
   */
  async getArtisanById(id: string): Promise<Artisan | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const artisan = this.artisans.find(a => a.id === id);
    return artisan ? { ...artisan } : null;
  }

  /**
   * Get artisans by city
   * @param city - The city to filter by
   * @returns Promise resolving to array of Artisan objects
   */
  async getArtisansByCity(city: string): Promise<Artisan[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return this.artisans
      .filter(a => a.city.toLowerCase() === city.toLowerCase())
      .map(a => ({ ...a }));
  }

  /**
   * Get artisans by type
   * @param type - The type to filter by
   * @returns Promise resolving to array of Artisan objects
   */
  async getArtisansByType(type: ArtisanType): Promise<Artisan[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return this.artisans
      .filter(a => a.type === type)
      .map(a => ({ ...a }));
  }

  /**
   * Toggle the saved status of an artisan
   * @param id - The ID of the artisan to update
   * @returns Promise resolving to the updated Artisan or null if not found
   */
  async toggleSavedStatus(id: string): Promise<Artisan | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.artisans.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    // Toggle the saved status
    this.artisans[index] = {
      ...this.artisans[index],
      saved: !this.artisans[index].saved
    };
    
    return { ...this.artisans[index] };
  }

  /**
   * Get featured artisans
   * @returns Promise resolving to array of featured Artisan objects
   */
  async getFeaturedArtisans(): Promise<Artisan[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.artisans
      .filter(a => a.isFeatured)
      .map(a => ({ ...a }));
  }
}

// Export a singleton instance
export const mockArtisanService = new MockArtisanService();
export default mockArtisanService; 