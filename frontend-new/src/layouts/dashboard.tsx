import React, { ReactNode } from 'react'

import Content from '../components/content'
import Footer from '../components/footer'
import Main from '../components/main'
import Wrapper from '../components/wrapper'

interface DashboardProps {
  children: ReactNode
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => (
  <React.Fragment>
    <Wrapper>
      <Main>
        <Content>{children}</Content>
        <Footer />
      </Main>
    </Wrapper>
  </React.Fragment>
)

export default Dashboard
