"use client";

import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { login } from "./actions";

export default function LoginPage() {
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
        <form>
          <TextField
            id='email'
            name='email'
            type='email'
            label='Email'
            variant='outlined'
            fullWidth
            margin='normal'
            required
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
          />
          <Button
            type='submit'
            variant='contained'
            color='primary'
            fullWidth
            formAction={login}
            sx={{ mt: 2 }}
          >
            Log in
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
