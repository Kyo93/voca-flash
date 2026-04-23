import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TopicCard from '../../src/components/roadmap/TopicCard';
import type { Topic } from '../../src/lib/types';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('TopicCard — Up Next Variant Image', () => {
  const mockTopic: Topic = {
    id: 'topic-1',
    roadmap_id: 'roadmap-1',
    name: 'Test Topic',
    slug: 'test-topic',
    description: 'Test Description',
    sort_order: 1,
    icon: 'book',
    color: '#FF0000',
    image_url: 'https://example.com/image.jpg',
    created_at: '',
    updated_at: ''
  };

  const mockStats = {
    total: 10,
    learned: 2,
    mastered: 0,
    percent: 20
  };

  it('renders an image when isUpNext is true', () => {
    render(
      <BrowserRouter>
        <TopicCard 
          topic={mockTopic} 
          roadmapId="roadmap-1" 
          stats={mockStats} 
          isUpNext={true} 
        />
      </BrowserRouter>
    );

    const img = screen.queryByAltText('Test Topic');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('https://example.com/image.jpg');
  });

  it('renders an image when isFeatured is true', () => {
    render(
      <BrowserRouter>
        <TopicCard 
          topic={mockTopic} 
          roadmapId="roadmap-1" 
          stats={mockStats} 
          isFeatured={true} 
        />
      </BrowserRouter>
    );

    const img = screen.queryByAltText('Test Topic');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('https://example.com/image.jpg');
    
    // Featured variant should have "Active Chapter" text
    expect(screen.getByText('roadmap.card.activeChapter')).toBeDefined();
  });
});
