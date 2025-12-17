"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/guestbook`
  : "http://localhost:8080/api/guestbook";

export default function Home() {
  const [guestbooks, setGuestbooks] = useState([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchGuestbooks = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setGuestbooks(data);
    } catch (error) {
      console.error("Failed to fetch guestbooks:", error);
    }
  };

  useEffect(() => {
    fetchGuestbooks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname, content }),
      });

      if (res.ok) {
        setNickname("");
        setContent("");
        fetchGuestbooks();
      }
    } catch (error) {
      console.error("Failed to create guestbook:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Guestbook
        </h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your nickname"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Message
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="Write your message"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>

        {/* List */}
        <div className="space-y-4">
          {guestbooks.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet.</p>
          ) : (
            guestbooks.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-800">
                    {item.nickname}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleString("ko-KR")}
                  </span>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap">{item.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}