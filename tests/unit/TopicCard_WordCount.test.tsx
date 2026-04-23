import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TopicCard from '../../src/components/roadmap/TopicCard';
import type { Topic } from '../../src/lib/types';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === 'topics.wordsCount') {
        return `${options?.count} từ vựng`;
      }
      return key;
    },
  }),
}));

describe('TopicCard — Word Count Display', () => {
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
    total: 25,
    learned: 5,
    mastered: 2,
    percent: 20
  };

  it('displays the total number of words in the standard variant', () => {
    render(
      <BrowserRouter>
        <TopicCard 
          topic={mockTopic} 
          roadmapId="roadmap-1" 
          stats={mockStats} 
        />
      </BrowserRouter>
    );

    // Expect to see "25 từ vựng" (or similar based on stats.total)
    expect(screen.getByText('25 từ vựng')).toBeDefined();
  });

  it('displays the total number of words in the Up Next variant', () => {
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

    expect(screen.getByText('25 từ vựng')).toBeDefined();
  });
});
