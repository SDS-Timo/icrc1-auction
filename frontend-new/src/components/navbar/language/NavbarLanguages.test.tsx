import { render } from '@testing-library/react'
import { Provider } from 'react-redux'

import store from '../../../store'

import NavbarLanguages from './index'

jest.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    }
  },
}))

describe('NavbarLanguages component', () => {
  test('renders correctly', () => {
    const { getByText } = render(
      <Provider store={store}>
        <NavbarLanguages />
      </Provider>,
    )

    const buttonElement = getByText('English')

    expect(buttonElement).toBeInTheDocument()
  })
})
