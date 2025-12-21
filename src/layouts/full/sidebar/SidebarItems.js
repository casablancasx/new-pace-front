import React from "react";
import { useLocation, NavLink } from 'react-router-dom';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse, Typography, styled } from "@mui/material";
import { IconPoint, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import Menuitems from "./MenuItems";
import Upgrade from "./Upgrade";
import useAuth from "../../../hooks/useAuth";

// Styled components
const SidebarContainer = styled(Box)(({ theme }) => ({
  padding: "0 24px",
  overflowX: 'hidden',
}));

const SubheaderText = styled(Typography)(({ theme }) => ({
  padding: '12px 16px 8px',
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
  letterSpacing: '0.5px',
}));

const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})(({ theme, isActive }) => ({
  borderRadius: '7px',
  marginBottom: '4px',
  padding: '10px 16px',
  backgroundColor: isActive ? '#5D87FF' : 'transparent',
  color: isActive ? '#fff' : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: isActive ? '#5D87FF' : '#49BEFF1a',
  },
  '& .MuiListItemIcon-root': {
    color: isActive ? '#fff' : theme.palette.text.secondary,
    minWidth: '36px',
  },
}));

const StyledNavLink = styled(NavLink)({
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
  width: '100%',
});

const ExternalLink = styled('a')({
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
  width: '100%',
});

const ChipBadge = styled('span')({
  backgroundColor: '#49BEFF1a',
  color: '#1b84ff',
  fontSize: '0.7rem',
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: '4px',
  marginLeft: '8px',
});

// Componente para itens de submenu com estado de colapso
const SubmenuItem = ({ item, pathDirect, itemIcon, userRole }) => {
  const [open, setOpen] = React.useState(false);

  const handleToggle = () => {
    setOpen(!open);
  };

  // Filtrar children baseado no role
  const filteredChildren = item.children?.filter(child => 
    !child.roles || child.roles.includes(userRole)
  ) || [];

  if (filteredChildren.length === 0) return null;

  return (
    <>
      <ListItem disablePadding>
        <StyledListItemButton onClick={handleToggle} isActive={false}>
          <ListItemIcon>{itemIcon}</ListItemIcon>
          <ListItemText primary={item.title} />
          {open ? <IconChevronUp size="1rem" /> : <IconChevronDown size="1rem" />}
        </StyledListItemButton>
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 2 }}>
          {renderMenuItems(filteredChildren, pathDirect, userRole)}
        </List>
      </Collapse>
    </>
  );
};

// Função para renderizar itens do menu
const renderMenuItems = (items, pathDirect, userRole) => {
  return items.map((item) => {
    // Verificar se o usuário tem permissão para ver este item
    if (item.roles && !item.roles.includes(userRole)) {
      return null;
    }

    const Icon = item.icon ? item.icon : IconPoint;
    const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

    // Subheader
    if (item.subheader) {
      return (
        <SubheaderText key={item.subheader}>
          {item.subheader}
        </SubheaderText>
      );
    }

    // Submenu com filhos
    if (item.children) {
      return (
        <SubmenuItem
          key={item.id}
          item={item}
          pathDirect={pathDirect}
          itemIcon={itemIcon}
          userRole={userRole}
        />
      );
    }

    // Verifica se é link externo
    const isExternalLink = item.href && item.href.startsWith('http');
    const isActive = pathDirect === item.href;

    // Link externo
    if (isExternalLink) {
      return (
        <ListItem key={item.id} disablePadding>
          <ExternalLink
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <StyledListItemButton isActive={false} disabled={item.disabled}>
              <ListItemIcon>{itemIcon}</ListItemIcon>
              <ListItemText primary={item.title} />
              {item.chip && <ChipBadge>{item.chip}</ChipBadge>}
            </StyledListItemButton>
          </ExternalLink>
        </ListItem>
      );
    }

    // Link interno - usa NavLink do React Router DOM
    // Se estiver desabilitado, não usa NavLink
    if (item.disabled) {
      return (
        <ListItem key={item.id} disablePadding>
          <StyledListItemButton isActive={false} disabled={true}>
            <ListItemIcon>{itemIcon}</ListItemIcon>
            <ListItemText primary={item.title} />
            {item.chip && <ChipBadge>{item.chip}</ChipBadge>}
          </StyledListItemButton>
        </ListItem>
      );
    }

    return (
      <ListItem key={item.id} disablePadding>
        <StyledNavLink to={item.href || '#'}>
          <StyledListItemButton isActive={isActive} disabled={item.disabled}>
            <ListItemIcon>{itemIcon}</ListItemIcon>
            <ListItemText primary={item.title} />
            {item.chip && <ChipBadge>{item.chip}</ChipBadge>}
          </StyledListItemButton>
        </StyledNavLink>
      </ListItem>
    );
  });
};

const SidebarItems = () => {
  const location = useLocation();
  const pathDirect = location.pathname;
  const { user } = useAuth();
  const userRole = user?.role || 'USER';

  return (
    <SidebarContainer>
      {/* Menu Items */}
      <List sx={{ mt: 2 }}>
        {renderMenuItems(Menuitems, pathDirect, userRole)}
      </List>
    </SidebarContainer>
  );
};

export default SidebarItems;

