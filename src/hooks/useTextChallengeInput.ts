import { useEffect, useRef, useState } from 'react'

/**
 * Shared state + handler for text-input challenges (Ghost Recall, Context Gap).
 * Compares user input case-insensitively to the answer word and triggers a
 * brief "wrong" visual state (~600ms shake) before clearing.
 */
export function useTextChallengeInput(answer: string, onSubmit: (isCorrect: boolean) => void) {
  const [input, setInput] = useState('')
  const [isWrong, setIsWrong] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!input.trim()) return
    const isCorrect = input.trim().toLowerCase() === answer.trim().toLowerCase()
    if (isCorrect) {
      onSubmit(true)
      setInput('')
    } else {
      setIsWrong(true)
      setTimeout(() => setIsWrong(false), 600)
    }
  }

  return { input, setInput, isWrong, inputRef, handleSubmit }
}
