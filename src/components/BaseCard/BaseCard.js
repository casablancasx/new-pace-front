import React from "react";

import {
  Card,
  CardContent,
  Divider,
  Box,
  Typography,
  Chip,
} from "@mui/material";

const BaseCard = (props) => {
  return (
    <Card
      variant="elevation"
      sx={{
        p: 0,
        width: "100%",
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <Box p={2} display="flex" alignItems="center">
        <Box>
          <Typography variant="h5" fontWeight='500'>{props.title}</Typography>
        </Box>
        {props.chiptitle ? (
          <Chip
            label={props.chiptitle}
            size="small"
            sx={{
              ml: "auto",
              fontSize: "12px",
              fontWeight: "500",
            }}
          ></Chip>
        ) : (
          ""
        )}
      </Box>
      <Divider />
      <CardContent>{props.children}</CardContent>
    </Card>
  );
};

export default BaseCard;
