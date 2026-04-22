import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import RichNoteEditor from '../../src/components/common/RichNoteEditor';

describe('RichNoteEditor Visuals', () => {
  it('should have list markers visible (simulated check)', () => {
    const { container } = render(
      <RichNoteEditor content="- Item 1\n- Item 2" onChange={() => {}} />
    );
    
    const editor = container.querySelector('.ProseMirror');
    const ul = editor?.querySelector('ul');
    
    // In JSDOM, computedStyle might not be perfect, but let's see if we can detect the lack of style
    if (ul) {
      const style = window.getComputedStyle(ul);
      // If Tailwind reset is active and no override exists, this might be 'none' or empty
      // We WANT it to be 'disc' or similar
      expect(style.listStyleType).not.toBe('none');
    }
  });
});
