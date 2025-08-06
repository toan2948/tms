"use client";

import {
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    // Create a FormData object to pass to the server action
    const formData = new FormData(event.currentTarget);

    try {
      await login(formData); // call your server action
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      display='flex'
      justifyContent='center'
      alignItems='center'
      minHeight='100vh'
      bgcolor='#f5f5f5'
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 2,
        }}
      >
        <Typography variant='h5' component='h1' gutterBottom align='center'>
          Log In
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            id='email'
            name='email'
            type='email'
            label='Email'
            variant='outlined'
            fullWidth
            margin='normal'
            required
            disabled={isLoading}
          />
          <TextField
            id='password'
            name='password'
            type='password'
            label='Password'
            variant='outlined'
            fullWidth
            margin='normal'
            required
            disabled={isLoading}
          />
          <Button
            type='submit'
            variant='contained'
            color='primary'
            fullWidth
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color='inherit' />
            ) : (
              "Log in"
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
