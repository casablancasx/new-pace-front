import { useMediaQuery, Box, Drawer } from '@mui/material';
import SidebarItems from './SidebarItems';
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
              },
            }
          }}
        >
          {/* ------------------------------------------- */}
          {/* Sidebar Box */}
          {/* ------------------------------------------- */}
          <Scrollbar sx={{ height: "100%" }}>
            <Box>
              {/* ------------------------------------------- */}
              {/* Sidebar Items */}
              {/* ------------------------------------------- */}
              <SidebarItems />
            </Box>
          </Scrollbar>
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
          },
        }
      }}
    >
      <Scrollbar sx={{ height: "100%" }}>
        {/* ------------------------------------------- */}
        {/* Sidebar For Mobile */}
        {/* ------------------------------------------- */}
        <SidebarItems />
      </Scrollbar>
    </Drawer>
  );
};
export default Sidebar;
