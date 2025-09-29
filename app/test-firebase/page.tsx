"use client"

import { useState } from "react"
import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"

export default function TestFirebasePage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const testSignIn = async () => {
    setLoading(true)
    setResult("")
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      setResult(`✅ Sign in successful! User ID: ${userCredential.user.uid}`)
    } catch (error: any) {
      setResult(`❌ Sign in failed: ${error.message}`)
    }
    setLoading(false)
  }

  const testSignUp = async () => {
    setLoading(true)
    setResult("")
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      setResult(`✅ Sign up successful! User ID: ${userCredential.user.uid}`)
    } catch (error: any) {
      setResult(`❌ Sign up failed: ${error.message}`)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-lg">
        <h1 className="text-2xl font-bold text-white mb-6">Firebase Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              placeholder="test@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              placeholder="password123"
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={testSignIn}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Test Sign In
            </button>
            <button
              onClick={testSignUp}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Test Sign Up
            </button>
          </div>
          
          {result && (
            <div className="mt-4 p-3 bg-slate-700 rounded text-sm text-white">
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

