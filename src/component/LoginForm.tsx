"use client";
import axios from "axios";
import { useState } from "react";

export default function LoginForm({
  setToken,
}: {
  setToken: (token: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [registerMode, setRegisterMode] = useState(false);

  const handleAuth = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const url = registerMode
        ? `${baseUrl}/auth/register`
        : `${baseUrl}/auth/login`;
      const res = await axios.post(url, { username, password });

      setToken(res.data.access_token);
    } catch (e) {
      setError("Authentication failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto border p-6 rounded-md shadow">
      <h2 className="text-xl font-bold mb-4">
        {registerMode ? "Register" : "Login"}
      </h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full mb-3 border px-3 py-2 rounded-md"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-3 border px-3 py-2 rounded-md"
      />
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button
        onClick={handleAuth}
        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mb-2"
      >
        {registerMode ? "Register" : "Login"}
      </button>
      <button
        onClick={() => setRegisterMode(!registerMode)}
        className="w-full text-sm text-blue-600 hover:underline"
      >
        {registerMode
          ? "Already have an account? Login"
          : "Don't have an account? Register"}
      </button>
    </div>
  );
}
