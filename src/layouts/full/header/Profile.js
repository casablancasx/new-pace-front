import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  Avatar,
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText, Typography
} from '@mui/material';

import { IconDashboard, IconMail, IconUser } from '@tabler/icons-react';

import ProfileImg from 'src/assets/images/profile/user-1.jpg';
import useAuth from '../../../hooks/useAuth';

const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const { user, logout } = useAuth();
  
  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleLogout = () => {
    logout();
    handleClose2();
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="perfil do usuário"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        onClick={handleClick2}
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
        }}
      >
        <Avatar
          src={ProfileImg}
          alt={user?.nome || 'User'}
          sx={{
            width: 35,
            height: 35,
          }}
        />
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '200px',
          },
        }}
      >
        <MenuItem>
          <Link to='/form-layouts'>
            <Box display='flex' alignItems='center'>
              <ListItemIcon>
                <IconUser width={20} />
              </ListItemIcon>
              <ListItemText><Typography variant='subtitle1' color='textPrimary'>My Profile</Typography></ListItemText>
            </Box>
          </Link>
        </MenuItem>
        <MenuItem>
          <Link to='/tables/basic-table'>
            <Box display='flex' alignItems='center'>
              <ListItemIcon>
                <IconMail width={20} />
              </ListItemIcon>
              <ListItemText><Typography variant='subtitle1' color='textPrimary'>Performance</Typography></ListItemText>
            </Box>
          </Link>
        </MenuItem>
        <MenuItem>
          <Link to='/dashboard'>
            <Box display='flex' alignItems='center'>
              <ListItemIcon>
                <IconDashboard width={20} />
              </ListItemIcon>
              <ListItemText><Typography variant='subtitle1' color='textPrimary'>My Dashboard</Typography></ListItemText>
            </Box>
          </Link>
        </MenuItem>
        <Box mt={1} py={1} px={2}>
          <Button 
            to="/auth/login" 
            variant="outlined" 
            color="primary" 
            component={Link} 
            fullWidth
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
