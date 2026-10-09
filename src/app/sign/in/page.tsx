'use client';

import { useState } from 'react';
import { signInAction } from './actions';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signInAction(email, password);
    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-10 w-full max-w-md mx-4 sm:mx-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">GOSPELFIX Admin</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-gray-700">이메일</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-black transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-gray-700">비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-black transition-colors"
            />
          </label>

          {error && <p className="text-red-500 text-xs -mt-2">{error}</p>}

          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white rounded-lg py-3 text-sm font-medium transition-colors mt-1"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
