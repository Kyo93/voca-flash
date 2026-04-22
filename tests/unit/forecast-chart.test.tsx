import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import ForecastMiniChart from '../../src/components/dashboard/ForecastMiniChart'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../src/i18n'

describe('ForecastMiniChart', () => {
  it('renders bars even with zero forecast data (fallback to 15%)', () => {
    const forecast = [0, 0, 0, 0, 0, 0, 0]
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <ForecastMiniChart forecast={forecast} />
      </I18nextProvider>
    )

    // Check for bars
    // Empty bars have bg-white/10 and dashed border
    const bars = container.querySelectorAll('.bg-white\\/10')
    expect(bars.length).toBe(5)

    bars.forEach(bar => {
      expect((bar as HTMLElement).style.height).toBe('15%')
    })
  })

  it('renders dynamic labels starting with Today', () => {
    const forecast = [0, 0, 0, 0, 0, 0, 0]
    const { getByText } = render(
      <I18nextProvider i18n={i18n}>
        <ForecastMiniChart forecast={forecast} />
      </I18nextProvider>
    )

    // Vietnamese default in i18n mock setup usually
    expect(getByText(/H.Nay/i)).toBeDefined()
  })

  it('renders data bars with higher opacity and visible counts', () => {
    const forecast = [10, 0, 0, 0, 0]
    const { container, getByText, getAllByText } = render(
      <I18nextProvider i18n={i18n}>
        <ForecastMiniChart forecast={forecast} />
      </I18nextProvider>
    )

    const dataBars = container.querySelectorAll('.bg-white\\/40')
    expect(dataBars.length).toBe(1)
    
    // Counts should be visible (both on bar and total)
    const counts = getAllByText('10')
    expect(counts.length).toBeGreaterThanOrEqual(1)
  })

  it('bar wrapper should have flex-1 to ensure percentage height works', () => {
    const forecast = [0, 0, 0, 0, 0]
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <ForecastMiniChart forecast={forecast} />
      </I18nextProvider>
    )

    // The wrapper around the bar and the count
    const wrappers = container.querySelectorAll('.relative.w-full.flex-col')
    wrappers.forEach(wrapper => {
      expect(wrapper.classList.contains('flex-1')).toBe(true)
    })
  })
})
