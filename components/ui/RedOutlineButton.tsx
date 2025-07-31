import { Button, ButtonProps } from "@mui/material";
import React from "react";

type RedOutlineButtonProps = ButtonProps & {
  children: React.ReactNode;
};

const RedOutlineButton: React.FC<RedOutlineButtonProps> = ({
  children,
  sx,
  ...rest
}) => {
  return (
    <Button
      variant='outlined'
      sx={{
        marginRight: "10px",
        color: "red",
        borderColor: "red",
        "&:hover": {
          backgroundColor: "rgba(255, 0, 0, 0.04)",
          borderColor: "red",
        },
        ...sx, // Allow overrides via props
      }}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default RedOutlineButton;
