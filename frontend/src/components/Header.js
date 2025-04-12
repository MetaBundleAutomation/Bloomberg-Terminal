import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: #2d2d2d;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  
  span {
    color: #2196f3;
    margin-right: 5px;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
`;

const NavItem = styled.a`
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  cursor: pointer;
  
  &:hover {
    color: #2196f3;
  }
`;

const Header = () => {
  return (
    <HeaderContainer>
      <Logo>
        <span>VIBE</span> Bloomberg Terminal
      </Logo>
      <Nav>
        <NavItem>Dashboard</NavItem>
        <NavItem>Market</NavItem>
        <NavItem>News</NavItem>
        <NavItem>Analysis</NavItem>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
