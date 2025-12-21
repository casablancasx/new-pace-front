import React, { useState } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import PropTypes from 'prop-types'

// components
import { IconBellRinging, IconMenu } from '@tabler/icons-react'

const Header = (props) => {
  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    [theme.breakpoints.up('lg')]: {
      minHeight: '70px',
    },
  }))
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }))

  // notification dd
  const [anchorEl, setAnchorEl] = useState(null)

  const [menuPosition, setMenuPosition] = useState(null)

  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect() // Get exact position
    setMenuPosition({
      top: rect.bottom + window.scrollY, // Position menu below the icon
      left: rect.left + window.scrollX, // Align with icon
    })
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <AppBarStyled position='sticky' color='default'>
      <ToolbarStyled>
        {/* Botão menu para mobile */}
        <IconButton
          color='inherit'
          aria-label='menu'
          onClick={props.toggleMobileSidebar}
          sx={{
            display: {
              lg: 'none',
              xs: 'inline',
            },
          }}>
          <IconMenu width='20' height='20' />
        </IconButton>

        {/* Botão toggle sidebar para desktop */}
        <IconButton
          color='inherit'
          aria-label='toggle sidebar'
          onClick={props.toggleSidebar}
          sx={{
            display: {
              lg: 'inline',
              xs: 'none',
            },
          }}>
          <IconMenu width='20' height='20' />
        </IconButton>

        <Box flexGrow={1} />
        
        <Stack spacing={1} direction='row' alignItems='center'>
          {/* Ícone de notificações */}
          <IconButton
            aria-label='show 4 new mails'
            color='inherit'
            aria-controls='notification-menu'
            aria-haspopup='true'
            onClick={handleClick}>
            <Badge variant='dot' color='primary'>
              <IconBellRinging size='21' stroke='1.5' />
            </Badge>
          </IconButton>

          <Menu
            id='notification-menu'
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorReference='anchorPosition'
            anchorPosition={
              menuPosition
                ? { top: menuPosition.top, left: menuPosition.left }
                : undefined
            }
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  boxShadow: 9,
                  minWidth: '200px',
                },
              },
            }}>
            <MenuItem onClick={handleClose}>
              <Typography variant='body1'>Item 1</Typography>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Typography variant='body1'>Item 2</Typography>
            </MenuItem>
          </Menu>
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  )
}

Header.propTypes = {
  sx: PropTypes.object,
}

export default Header
