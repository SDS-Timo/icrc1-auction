import { render } from '@testing-library/react'

import Content from './content'

describe('Content component', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <Content>
        <div>Auctions</div>
      </Content>,
    )

    expect(getByText('Auctions')).toBeInTheDocument()
  })
})
