import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WordDetailPanel from '../../src/components/WordDetailPanel';
import { ReactNode } from 'react';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'vi' },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe('WordDetailPanel Rich Text Support', () => {
  const mockWord: any = {
    word_id: '1',
    word: 'test',
    definition: 'test definition',
    example: 'test example',
    phonetic: '/test/',
    image_url: null,
    fsrs_stability: 1,
    fsrs_difficulty: 1,
    fsrs_state: 0,
    fsrs_reps: 1,
    fsrs_lapses: 0,
    next_review_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    mastered: false,
    is_orphaned: false,
    topic_names: 'test topic',
    personal_note: '**Bold Note**\n- Bullet 1\n- Bullet 2'
  };

  it('renders bold text and bullet points in the notes tab', async () => {
    render(
      <WordDetailPanel 
        word={mockWord} 
        isOpen={true} 
        onClose={() => {}} 
        onToggleNotebook={async () => {}}
        isNotebookSaved={true}
        personalNote={mockWord.personal_note}
        onSaveNote={async () => {}}
        initialTab="notes"
      />
    );

    // Should find a strong/b tag for bold text
    const boldElement = screen.queryByText('Bold Note');
    // In current implementation, this will just be a p tag with the raw text including **
    // If it's correctly rendered, it should be an element with bold style or a <strong> tag.
    
    // Check for bullet points (li tags)
    const listItems = screen.queryAllByRole('listitem');
    
    expect(boldElement?.tagName.toLowerCase()).toBe('strong');
    expect(listItems.length).toBeGreaterThanOrEqual(2);
  });

  it('renders colored text using span tags', async () => {
    const coloredNote = 'This is <span style="color: red">red text</span>';
    render(
      <WordDetailPanel 
        word={mockWord} 
        isOpen={true} 
        onClose={() => {}} 
        onToggleNotebook={async () => {}}
        isNotebookSaved={true}
        personalNote={coloredNote}
        onSaveNote={async () => {}}
        initialTab="notes"
      />
    );

    const redText = screen.getByText('red text');
    expect(redText.tagName.toLowerCase()).toBe('span');
    expect(redText.getAttribute('style')).toContain('color: red');
  });

  it('shows formatting toolbar when in edit mode', async () => {
    const { container } = render(
      <WordDetailPanel
        word={mockWord}
        isOpen={true}
        onClose={() => {}}
        onToggleNotebook={async () => {}}
        isNotebookSaved={true}
        personalNote="Test note"
        onSaveNote={async () => {}}
        initialTab="notes"
        forceEdit={true}
      />
    );

    // Toolbar should be visible with premium buttons
    expect(await screen.findByTitle('editor.toolbar.bold')).toBeDefined();
    expect(screen.getByTitle('editor.toolbar.bulletList')).toBeDefined();
    expect(screen.getAllByTitle('editor.toolbar.colorText').length).toBeGreaterThan(0);
    expect(screen.getByTitle('editor.toolbar.undo')).toBeDefined();

    // Tiptap uses a div with contenteditable instead of textarea
    const editor = container.querySelector('.ProseMirror');
    expect(editor).toBeDefined();
    expect(editor?.getAttribute('contenteditable')).toBe('true');
  });

  it('updates the view when personalNote prop changes', async () => {
    const { rerender } = render(
      <WordDetailPanel
        word={mockWord}
        isOpen={true}
        onClose={() => {}}
        onToggleNotebook={async () => {}}
        isNotebookSaved={true}
        personalNote="Initial Note"
        onSaveNote={async () => {}}
        initialTab="notes"
      />
    );

    expect(screen.getByText('Initial Note')).toBeDefined();

    // Rerender with new note (simulating save update)
    rerender(
      <WordDetailPanel
        word={mockWord}
        isOpen={true}
        onClose={() => {}}
        onToggleNotebook={async () => {}}
        isNotebookSaved={true}
        personalNote="Updated Note"
        onSaveNote={async () => {}}
        initialTab="notes"
      />
    );

    expect(screen.getByText('Updated Note')).toBeDefined();
    expect(screen.queryByText('Initial Note')).toBeNull();
  });
});
