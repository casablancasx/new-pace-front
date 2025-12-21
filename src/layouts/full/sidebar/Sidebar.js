import { useMediaQuery, Box, Drawer } from '@mui/material';
import SidebarItems from './SidebarItems';
import Upgrade from './Upgrade';
import Scrollbar from "../../../components/custom-scroll/Scrollbar";

const Sidebar = (props) => {

  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const sidebarWidth = '270px';
  const miniSidebarWidth = '0px';

  if (lgUp) {
    return (
      <Box
        sx={{
          width: props.isSidebarOpen ? sidebarWidth : miniSidebarWidth,
          flexShrink: 0,
          transition: 'width 0.3s ease-in-out',
        }}
      >
        {/* ------------------------------------------- */}
        {/* Sidebar for desktop */}
        {/* ------------------------------------------- */}
        <Drawer
          anchor="left"
          open={props.isSidebarOpen}
          variant="persistent"
          slotProps={{
            paper: {
              sx: {
                width: sidebarWidth,
                boxSizing: 'border-box',
                top: 0,
                transition: 'transform 0.3s ease-in-out',
                transform: props.isSidebarOpen ? 'translateX(0)' : `translateX(-${sidebarWidth})`,
                display: 'flex',
                flexDirection: 'column',
              },
            }
          }}
        >
          {/* ------------------------------------------- */}
          {/* Sidebar Box */}
          {/* ------------------------------------------- */}
          <Scrollbar sx={{ flex: 1 }}>
            <SidebarItems />
          </Scrollbar>
          {/* ------------------------------------------- */}
          {/* User Profile - Fixed at bottom */}
          {/* ------------------------------------------- */}
          <Upgrade />
        </Drawer >
      </Box >
    );
  }
  return (
    <Drawer
      anchor="left"
      open={props.isMobileSidebarOpen}
      onClose={props.onSidebarClose}
      variant="temporary"
      slotProps={{
        paper: {
          sx: {
            width: sidebarWidth,
            boxShadow: (theme) => theme.shadows[8],
            display: 'flex',
            flexDirection: 'column',
          },
        }
      }}
    >
      <Scrollbar sx={{ flex: 1 }}>
        {/* ------------------------------------------- */}
        {/* Sidebar For Mobile */}
        {/* ------------------------------------------- */}
        <SidebarItems />
      </Scrollbar>
      {/* ------------------------------------------- */}
      {/* User Profile - Fixed at bottom */}
      {/* ------------------------------------------- */}
      <Upgrade />
    </Drawer>
  );
};
export default Sidebar;
