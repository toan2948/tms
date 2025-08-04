"use client";

import { signIn } from "@/utils/languages/login";
import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    console.log("Logging in with:", { email, password });

    const error = await signIn(email, password);

    if (error) {
      setErrorMsg(error);
    } else {
      router.push("/");
    }
  };

  return (
    <Container maxWidth='sm'>
      <Box
        sx={{
          mt: 8,
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant='h5' component='h1' gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleLogin}>
          <Stack spacing={2}>
            <TextField
              label='Email'
              type='email'
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label='Password'
              type='password'
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errorMsg && <Alert severity='error'>{errorMsg}</Alert>}
            <Button variant='contained' color='primary' type='submit'>
              Log In
            </Button>
          </Stack>
        </form>
      </Box>
    </Container>
  );
}
