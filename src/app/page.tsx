"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import { getCurrentUserId } from "@/lib/utils";
import LoginForm from "@/component/LoginForm";

interface User {
  id: number;
  username: string;
}

interface Quote {
  id: number;
  text: string;
  votes: number;
  user: User;
}

export default function Home() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [token, setToken] = useState<string>("");
  const [quoteText, setQuoteText] = useState("");
  const [editingQuoteId, setEditingQuoteId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setCurrentUserId(getCurrentUserId());

    if (savedToken) setToken(savedToken);
  }, [token]);

  useEffect(() => {
    if (token) fetchQuotes();
  }, [token, search, sort]);

  const fetchQuotes = async () => {
    const res = await axios.get<Quote[]>(`${baseUrl}/quotes`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { search },
    });

    setQuotes(res.data);
  };

  const handleVote = async (id: number) => {
    await axios.post(
      `${baseUrl}/quotes/${id}/vote`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    fetchQuotes();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  const handleCreateQuote = async () => {
    if (!quoteText.trim()) return;

    await axios.post(
      `${baseUrl}/quotes`,
      { text: quoteText },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setQuoteText("");
    fetchQuotes();
  };

  const handleEdit = (quote: Quote) => {
    setEditingQuoteId(quote.id);
    setEditingText(quote.text);
  };

  const handleUpdate = async () => {
    if (editingQuoteId === null || !editingText.trim()) return;

    await axios.put(
      `${baseUrl}/quotes/${editingQuoteId}`,
      { text: editingText },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setEditingQuoteId(null);
    setEditingText("");
    fetchQuotes();
  };

  const handleDelete = async (id: number) => {
    await axios.delete(`${baseUrl}/quotes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchQuotes();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateQuote();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Funny Quotes</h1>

      {!token ? (
        <LoginForm
          setToken={(newToken) => {
            localStorage.setItem("token", newToken);
            setToken(newToken);
          }}
        />
      ) : (
        <>
          <div className="mb-4 flex gap-4">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-2 rounded-md"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="border px-3 py-2 rounded-md"
            >
              <option value="desc">Most Voted</option>
              <option value="asc">Least Voted</option>
            </select>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Logout
            </button>
          </div>

          <div className="mb-6 flex gap-2">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Enter a quote..."
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                className="flex-1 border px-3 py-2 rounded-md"
              />
            </form>

            <button
              onClick={handleCreateQuote}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Add Quote
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quotes.length < 1 && <p>There's no quote</p>}

            {quotes.length > 0 &&
              quotes.map((quote) => (
                <div key={quote.id} className="border rounded-md p-4 shadow">
                  {editingQuoteId === quote.id ? (
                    <>
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full border p-2 rounded-md mb-2"
                      />
                      <button
                        onClick={handleUpdate}
                        className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingQuoteId(null)}
                        className="bg-gray-400 text-white px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-lg">{quote.text}</p>
                      <p className="text-sm text-gray-600">
                        by {quote.user.username}
                      </p>
                      <p className="font-semibold">Votes: {quote.votes}</p>
                      <button
                        onClick={() => handleVote(quote.id)}
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                      >
                        Vote
                      </button>
                      {quote.votes === 0 && (
                        <>
                          {quote.user.id === currentUserId &&
                            quote.votes === 0 && (
                              <button
                                onClick={() => handleEdit(quote)}
                                className="ml-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                              >
                                Edit
                              </button>
                            )}

                          <button
                            onClick={() => handleDelete(quote.id)}
                            className="ml-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
